const Libp2p = require('libp2p');
const TCP = require('libp2p-tcp');
const {NOISE} = require('libp2p-noise');
const MPLEX = require('libp2p-mplex');
const Gossipsub = require('libp2p-gossipsub');
const Bootstrap = require('libp2p-bootstrap');
const DHT = require('libp2p-kad-dht');
const pipe = require('it-pipe')
const PeerId = require("peer-id");
const {put_record} = require("./p2p");
const collect = require('collect.js');
const {application} = require("express");
const {CID} = require('multiformats/cid');
const json = require('multiformats/codecs/json');
const {sha256} = require('multiformats/hashes/sha2');
const all = require("it-all");
const delay = require("delay");

const BOOTSTRAP_IDS = [
    'Qmcia3HF2wMkZXqjRUyeZDerEVwtDtFRUqPzENDcF8EgDb',
    'QmXkot7VYCjXcoap1D51X1LEiAijKwyNZaAkmcqqn1uuPs',
]

const RECORDS = new Map();

exports.create_node = async function create_node() {
    const peerId = await PeerId.createFromJSON(require(process.env.PEERID));

    const node = await Libp2p.create({
        peerId,
        addresses: {
            listen: ['/ip4/127.0.0.1/tcp/0']
        }, modules: {
            transport: [TCP],
            connEncryption: [NOISE],
            streamMuxer: [MPLEX],
            peerDiscovery: [Bootstrap], // we can add other mechanisms such as bootstrap
            pubsub: Gossipsub,
            dht: DHT,
        }, config: {
            peerDiscovery: {
                autoDial: true,
                [Bootstrap.tag]: {
                    list: [
                        '/ip4/127.0.0.1/tcp/8998/p2p/Qmcia3HF2wMkZXqjRUyeZDerEVwtDtFRUqPzENDcF8EgDb',
                        '/ip4/127.0.0.1/tcp/8999/p2p/QmXkot7VYCjXcoap1D51X1LEiAijKwyNZaAkmcqqn1uuPs'
                    ],
                    interval: 1000,
                    enabled: true,
                }
            },
            dht: {
                enabled: true
            }
        }
    });

    node.application = {
        posts: [],
        subscribed: [],
        subscribers: [],
        username: process.env.USERNAME,
        peerId: node.peerId.toB58String(),
        updated: 0,
    };

    node.on('peer:discovery', (peer) => {
        console.log('peer:discovery', peer.toB58String());
    });

    let locked = false;

    node.connectionManager.on('peer:connect', async (connection) => {
        console.log('Connected to:', connection.remotePeer.toB58String());

        // if the connection was established to a Bootstrap Peer, then it should have
        // the public record available if it does exist for this user, then it should
        // update the record
        if (locked) return;
        locked = true;

        if (BOOTSTRAP_IDS.includes(connection.remotePeer.toB58String())) {
            await delay(2000);

            const cid = await username_cid(node.application.username);
            let providers;
            try {
                providers = await all(node.contentRouting.findProviders(cid, {timeout: 5000}));
            } catch (_) {
                console.log("Could not find providers for own record");
                providers = [];
            }

            if (providers.length === 0) {
                console.log("Record not found! Creating...")
                RECORDS.set(cid.toString(), node.application);
                await node.contentRouting.provide(cid)
                    .catch(e => console.warn("Providing own record:", e.code));
                console.log("> Providing own record");

                return;
            }

            console.log("Found", providers.length, "providers for own record:", providers.map(v => v.id.toB58String()));

            let done = false;
            let record = null;
            let i = 0;
            while (!done && i < providers.length) {
                let dial = null;

                try {
                    dial = await node.dialProtocol(providers[i++].id, ['/record/1.0.0']);
                } catch (e) {
                    continue;
                }

                const {stream} = dial;
                await pipe([cid.toString()], stream);
                await pipe(
                    stream,
                    async function (source) {
                        const allItems = [];
                        for await (const item of source) {
                            allItems.push(item.toString());
                        }

                        record = JSON.parse(allItems[0]);
                        RECORDS.set(cid.toString(), record);
                        node.application = record;
                        console.log("Retrieved own record from:", providers[i - 1].id.toB58String());
                        await node.contentRouting.provide(cid);
                        console.log("> Providing own record");
                        done = true;
                    }
                );
            }

            if (record === null) {
                console.log("Record not found! Creating...")
                RECORDS.set(cid.toString(), node.application);
                await node.contentRouting.provide(cid)
                    .catch((e) => console.warn("Providing:", e.code));
                console.log("> Providing own record");
            }

            // for each subscribed user, add a new handler right?
            for (const username of node.application.subscribed) {
                await node.pubsub.subscribe(username);
                console.log("Subscribed to Topic:", username);
                node.pubsub.on(username, async (msg) => {
                    console.log(`[PUBSUB] Record for:${username} updated!`);
                    let record = JSON.parse(new TextDecoder().decode(msg.data));
                    const cid = await username_cid(record.username);
                    RECORDS.set(cid.toString(), record);
                });
            }
        }

        node.peerStore.addressBook.add(connection.remotePeer, [connection.remoteAddr]);
    })

    node.handle('/username', ({stream}) => {
        pipe([node.application.username], stream)
    })

    node.handle('/subscribe/1.0.0', ({stream}) => {
        pipe(
            stream,
            async function (source) {
                for await (const msg of source) {
                    // add new subscriber (idempotent)
                    if (!collect(node.application.subscribers).contains(msg.toString())) {
                        node.application.subscribers.push(msg.toString());
                        // update record
                        await exports.put_record(node, node.application);
                    }
                }
            }
        )
    })

    node.handle('/unsubscribe/1.0.0', ({stream}) => {
        pipe(
            stream,
            async function (source) {
                for await (const msg of source) {
                    // remove subscriber (idempotent)
                    node.application.subscribers = node.application.subscribers.filter(function (value) {
                        return value !== msg.toString();
                    });
                    await exports.put_record(node, node.application);
                }
            }
        )
    });

    node.handle('/echo/1.0.0', ({stream}) => {
        pipe(['echo'], stream);
    });

    node.handle('/record/1.0.0', async ({stream}) => {
        // receive cid for the record
        let cid = null;
        await pipe(
            stream,
            async function (source) {
                for await (const msg of source) {
                    cid = msg.toString();
                    return;
                }
            }
        );
        if (!cid) return;
        console.log("CID:", cid);
        if (!RECORDS.has(cid)) {
            console.log("CID not found!");
            pipe(
                ["ERR_NOT_FOUND"],
                stream
            );
        } else {
            console.log("Sending Record:", RECORDS.get(cid).username)
            pipe(
                [JSON.stringify(RECORDS.get(cid))],
                stream
            );
        }


    });

    await node.start();
    console.log('libp2p has started');

    // subscribe own topic, so it can publish everytime there's a change on its own record
    node.pubsub.subscribe(node.application.username);

    node.pubsub.on(node.application.username, async (msg) => {
        console.log("Own node has been updated!");
        node.application = JSON.parse(new TextDecoder().decode(msg.data));
        let cid = await username_cid(node.application.username);
        RECORDS.set(cid.toString(), node.application);
    })

    const listenAddrs = node.transportManager.getAddrs();
    console.log('listen:', listenAddrs);

    const advertiseAddrs = node.multiaddrs;
    console.log('advertise:', advertiseAddrs);

    return node;
}

exports.get_providers = async function(node, username) {
    let cid = await username_cid(username);

    let providers;
    try {
        providers = await all(node.contentRouting.findProviders(cid, {timeout: 5000}));
    } catch (_) {
        providers = [];
    }

    return providers.map(v => v.id.toB58String());
}

const username_cid = async function (username) {
    // Encoded Uint8array representation of `value` using the plain JSON IPLD codec
    const bytes = json.encode(username);
    // Hash Uint8array representation
    const hash = await sha256.digest(bytes)
    // Create CID (default base32)
    return CID.create(1, json.code, hash)
}

async function _get_username(node, peerId) {
    return new Promise(resolve => {
        node.dialProtocol(peerId, ['/username'])
            .then(async ({stream}) => {
                await pipe(
                    stream,
                    async function (source) {
                        for await (const msg of source) {
                            // first one since the other side just sends one value -> username
                            resolve({message: msg.toString(), code: 'OK'});
                            return;
                        }
                    }
                )
            }, reason => resolve({message: "unreachable node", code: reason.code}));
    });
}

exports.get_discovered = async function (node) {
    const discovered = [];

    node.peerStore.addressBook.data.forEach((v, k) => {
        let node = {
            id: k,
        }

        let addresses = []
        v.addresses.forEach((address) => {
            addresses.push(address.multiaddr.toString());
        })
        node.addresses = addresses;

        discovered.push(node);
    })

    // usernames
    for (let discoveredElement of discovered) {
        let peerId = PeerId.createFromB58String(discoveredElement.id);
        let {message, code} = await _get_username(node, peerId);

        console.log({peerId: discoveredElement.id, message: message, code: code});

        switch (code) {
            case 'ERR_DIALED_SELF':
                discoveredElement.username = node.application.username;
                break;
            case 'ERR_UNSUPPORTED_PROTOCOL':
                discoveredElement.username = 'bootstrap node';
                break;
            case 'OK':
                discoveredElement.username = message;
                break;
            default:
                break;
        }
    }

    return discovered;
}

exports.get_username = async function (node, idStr) {
    try {
        let peerId = PeerId.createFromB58String(idStr);
        return await _get_username(peerId);
    } catch (e) {
        return {message: "ERR_PEERID"};
    }
}

exports.put_record = async function (node, record) {
    node.application = record;
    node.application.updated = Date.now();

    return new Promise((resolve, reject) => {
        node.pubsub.publish(node.application.username,
            new TextEncoder().encode(JSON.stringify(record)))
            .then(_ => {
                console.log("> Record Updated and Published!");
                resolve();
            }, reason => {
                console.log("> Could not update and publish record:", reason.message);
                reject(reason);
            });
    });
}

exports.get_or_create_record = async function (node) {
    return await node.contentRouting.get(new TextEncoder().encode(node.application.username));
}

exports.get_record = async function (node, username) {
    return new Promise(resolve => {
        node.contentRouting.get(new TextEncoder().encode(username))
            .then(
                message => {
                    // Get the record and add the new post
                    let msgStr = new TextDecoder().decode(message.val);
                    let record = JSON.parse(msgStr);

                    resolve(record);
                },
                reason => resolve(reason.code)
            );
    })
}

exports.get_peer_id_by_username = async function (node, username) {
    // this should be a connection to the database it will be hardcoded for now

    switch (username) {
        case 'skdgt':
            return 'QmcKqmDw4NbiXLw6hEpNGjqyTsMgJLQ3MPvxZm5qmcyAGS';
        case 'test1':
            return 'Qmb4ok97PbUpQVQjv3wThBpYUKHD1KQDhVphajWKDYmf41';
        default:
            return 'ERR_NOT_FOUND';
    }
}

exports.subscribe = async function (node, peerId, username) {
    return new Promise(async (resolve) => {
        if (collect(node.application.subscribed).contains(username)) {
            return resolve("ERR_ALREADY_SUB");
        }

        node.application.subscribed.push(username);
        await exports.put_record(node, node.application);

        // start reading posts from external user
        await node.pubsub.subscribe(username);
        console.log("Subscribed to Topic:", username);
        node.pubsub.on(username, async (msg) => {
            console.log(`[PUBSUB] Record for:${username} updated!`);
            let record = JSON.parse(new TextDecoder().decode(msg.data));
            const cid = await username_cid(record.username);
            RECORDS.set(cid.toString(), record);
        });

        // somebody should have the user's record by CID, if not there's nothing we can do.
        const cid = await username_cid(username);
        let providers = await all(node.contentRouting.findProviders(cid, {timeout: 5000}))
            .catch(_ => {
                console.log("Could not find providers for:", username);
                providers = [];
            })

        if (providers.length === 0) {
            return resolve('ERR_NOT_FOUND');
        }

        console.log("Found", providers.length, "providers for", username);

        let done = false;
        let record = null;
        let i = 0;
        while (!done && i < providers.length) {
            let dial = null;

            try {
                dial = await node.dialProtocol(providers[i++].id, ['/record/1.0.0']);
            } catch (e) {
                continue;
            }

            const {stream} = dial;
            await pipe([cid.toString()], stream);
            await pipe(
                stream,
                async function (source) {
                    const allItems = [];
                    for await (const item of source) {
                        allItems.push(item.toString());
                    }

                    // update their subscribers list and send them to the topic
                    record = JSON.parse(allItems[0]);
                    if (record === "ERR_NOT_FOUND") {
                        return;
                    }

                    if (!collect(record.subscribers).contains(node.application.username)) {
                        record.subscribers.push(node.application.username);
                        record.updated = Date.now();

                        await node.pubsub.publish(username,
                            new TextEncoder().encode(JSON.stringify(record)));
                        console.log("[PUBSUB] Sent an update for:", username);
                    }

                    await node.contentRouting.provide(cid);
                    RECORDS.set(cid.toString(), record);
                    console.log("> Providing for:", username);
                    done = true;
                }
            );
        }
        return resolve(record);
    });
}

exports.unsubscribe = async function (node, peerId, username) {
    return new Promise(async (resolve) => {
       if (!collect(node.application.subscribed).contains(username)) {
           return resolve("ERR_NOT_SUBSCRIBED");
       }

        node.application.subscribed = node.application.subscribed.filter(function (value) {
            return value !== username;
        });
        await exports.put_record(node, node.application);
        // signal we are not subscribing user anymore
        // somebody should have the user's record by CID, if not there's nothing we can do.
        const cid = await username_cid(username);
        let providers = await all(node.contentRouting.findProviders(cid, {timeout: 5000}))
            .catch(_ => {
                console.log("Could not find providers for:", username);
                providers = [];
            })

        if (providers.length === 0) {
            return resolve('ERR_NOT_FOUND');
        }

        console.log("Found", providers.length, "providers for", username);

        let done = false;
        let record = null;
        let i = 0;
        while (!done && i < providers.length) {
            let dial = null;

            try {
                dial = await node.dialProtocol(providers[i++].id, ['/record/1.0.0']);
            } catch (e) {
                continue;
            }

            const {stream} = dial;

            await pipe([cid.toString()], stream);
            await pipe(
                stream,
                async function (source) {
                    const allItems = [];
                    for await (const item of source) {
                        allItems.push(item.toString());
                    }

                    // update their subscribers list and send them to the topic
                    record = JSON.parse(allItems[0]);
                    if (collect(record.subscribers).contains(node.application.username)) {
                        record.subscribers = record.subscribers.filter(function (value) {
                            return value !== username;
                        });
                        record.updated = Date.now();

                        await node.pubsub.publish(username,
                            new TextEncoder().encode(JSON.stringify(record)));
                        console.log("[PUBSUB] Sent an update for:", username);
                    }
                    done = true;
                }
            );
        }

        await node.pubsub.unsubscribe(username);
        console.log("[PUBSUB] Unsubscribed", username);
        return resolve("OK");
    });
}

exports.echo = async function (node, peerId) {
    return new Promise(resolve => {
        node.dialProtocol(peerId, ['/echo/1.0.0'])
            .then(async ({stream}) => {
                pipe(
                    stream,
                    async function (source) {
                        for await (const msg of source) {
                            if (msg.toString() === "echo") {
                                resolve(true);
                                return;
                            }
                        }
                    }
                )
            }, _ => resolve(false));
    })
}
