const Libp2p = require("libp2p");
const TCP = require("libp2p-tcp");
const {NOISE} = require("libp2p-noise");
const MPLEX = require("libp2p-mplex");
const Gossipsub = require("libp2p-gossipsub");
const Bootstrap = require("libp2p-bootstrap");
const DHT = require("libp2p-kad-dht");
const pipe = require("it-pipe");
const PeerId = require("peer-id");
const collect = require("collect.js");
const {CID} = require("multiformats/cid");
const json = require("multiformats/codecs/json");
const {sha256} = require("multiformats/hashes/sha2");
const all = require("it-all");
const delay = require("delay");
const Ping = require("libp2p/src/ping");
const fs = require("fs");
const {Multiaddr} = require('multiaddr')

const {get_user_id_by_username} = require("./fire");

const BOOTSTRAP_IDS = [
    "Qmcia3HF2wMkZXqjRUyeZDerEVwtDtFRUqPzENDcF8EgDb",
    "QmXkot7VYCjXcoap1D51X1LEiAijKwyNZaAkmcqqn1uuPs",
    "Qmd693X3Jsd2MrBrrdRKiWAUD2zPiXQXnimGJdY4rMpBjq",
];
const BOOTSTRAP_IP = process.env.BOOTSTRAP_IP || "127.0.0.1";

let RECORDS = new Map();
let ephemeralHandler = null;
let saveStateHandler = null;

const EPHEMERAL_TIMEOUT = 24 * 60 * 60 * 1000;
const EPHEMERAL_MAX_POSTS = 100;

const set_record = function (cid, record) {
    RECORDS.set(cid, {record: record, added: Date.now()});
};

const cleanEphemeral = function (node) {
    RECORDS.forEach((value, key, map) => {
        const elapsed = Date.now() - value.added;
        if (node.application.username === value.record.username) {
            return;
        }

        if (value.record.posts.length > EPHEMERAL_MAX_POSTS) {
            console.log("Removing ephemeral posts for:", value.record.username);
            value.record.posts = value.record.posts.slice(value.record.posts.length - EPHEMERAL_MAX_POSTS);
        }

        // 10 seconds
        if (elapsed >= EPHEMERAL_TIMEOUT) {
            console.log("Removing ephemeral record for:", value.record.username);
            map.delete(key);
        }
    });
};

exports.startEphemeral = function (node) {
    ephemeralHandler = setInterval(() => cleanEphemeral(node), 10000);
};

exports.stopEphemeral = function () {
    clearInterval(ephemeralHandler);
};

const saveState = function (node) {
    let data = JSON.stringify(Object.fromEntries(RECORDS), null, 2);

    fs.writeFile(`tmp/${node.application.username}.json`, data, (err) => {
        if (err) throw err;
    });
};

const read_state = async function (username) {
    return new Promise((resolve) => {
        fs.readFile(`tmp/${username}.json`, (err, data) => {
            if (err) {
                return resolve(null);
            }
            let obj = JSON.parse(data);
            return resolve(new Map(Object.entries(obj)));
        });
    });
};

exports.start_save_state = function (node, interval) {
    saveStateHandler = setInterval(() => saveState(node), interval);
};

exports.stop_save_state = function () {
    clearInterval(saveStateHandler);
};

const get_not_followers = async function (node, username) {
    return new Promise(async (resolve) => {
        const peerIdStr = await exports.get_peer_id_by_username(node, username);
        const peerId = await PeerId.createFromB58String(peerIdStr);

        node.dialProtocol(peerId, ["/followers/1.0.0"])
        .then(async ({stream}) => {
            await pipe([node.application.username], stream);
            await pipe(
                stream,
                async function (source) {
                    for await (const msg of source) {
                        if (msg.toString() === "NO") {
                            console.log("Removing follower:", username);
                            resolve(username);
                        }
                        return;
                    }
                }
            )
        }, () => resolve(null));
    })
}

const retrieve_followers = async function (node) {
    let toRemove = [];

    for (const username of node.application.subscribers) {
        const remove = await get_not_followers(node, username);
        if (remove) toRemove.push(remove);
    }

    toRemove.forEach((value) => {
        let index = node.application.subscribers.indexOf(value);
        if (index > -1) {
            node.application.subscribers.splice(index, 1);
        }
    });

    console.log(node.application.subscribers);

    if (node.pubsub.started)
        exports.put_record(node, node.application)
            .then(() => console.log("Updated after retrieving followers!"));
}

const trigger_update_record = async function (node, username) {
    const peerIdStr = await exports.get_peer_id_by_username(node, username);
    const peerId = await PeerId.createFromB58String(peerIdStr);

    console.log("Starting update trigger for:", username)
    node.dialProtocol(peerId, ["/update/1.0.0"])
    .then(async ({stream}) => {
        pipe([node.application.username], stream);
    }, (_) => console.log("Node not reachable for trigger update:", username));
}

const update_records = function (node) {
    node.application.subscribed.forEach((username) => trigger_update_record(node, username));
}

exports.create_node = async function create_node(username, peerIdJSON) {
    const peerId = await PeerId.createFromJSON(peerIdJSON);

    const node = await Libp2p.create({
        peerId,
        addresses: {
            listen: ["/ip4/0.0.0.0/tcp/0"],
        },
        modules: {
            transport: [TCP],
            connEncryption: [NOISE],
            streamMuxer: [MPLEX],
            peerDiscovery: [Bootstrap], // we can add other mechanisms such as bootstrap
            pubsub: Gossipsub,
            dht: DHT,
        },
        config: {
            peerDiscovery: {
                autoDial: true,
                [Bootstrap.tag]: {
                    list: [
                        `/ip4/${BOOTSTRAP_IP}/tcp/8997/p2p/${BOOTSTRAP_IDS[0]}`,
                        `/ip4/${BOOTSTRAP_IP}/tcp/8998/p2p/${BOOTSTRAP_IDS[1]}`,
                        `/ip4/${BOOTSTRAP_IP}/tcp/8999/p2p/${BOOTSTRAP_IDS[2]}`,
                    ],
                    interval: 10000,
                    enabled: true,
                },
            },
            dht: {
                enabled: true,
            }
        },
    });

    node.application = {
        posts: [],
        subscribed: [],
        subscribers: [],
        username: username,
        peerId: node.peerId.toB58String(),
        updated: Date.now(),
    };

    node.on("peer:discovery", (peer) => {
        console.log("peer:discovery", peer.toB58String());
    });

    let locked = false;

    node.connectionManager.on("peer:connect", async (connection) => {
        console.log("Connected to:", connection.remotePeer.toB58String());
        retrieve_followers(node);
        update_records(node);

        // if the connection was established to a Bootstrap Peer, then it should have
        // the public record available if it does exist for this user, then it should
        // update the record
        if (locked) return;
        locked = true;

        if (BOOTSTRAP_IDS.includes(connection.remotePeer.toB58String())) {
            await delay(2000);
            exports.start_save_state(node, 5000);

            const cid = await username_cid(node.application.username);

            // try to read data from cache
            console.log("Trying to read data from cache...");
            let read = await read_state(node.application.username);
            if (read == null) {
                console.log("Cached data not found!");
            } else {
                RECORDS = read;
                console.log("Cached data found");
                node.application = read.get(cid.toString()).record;
                await node.contentRouting
                    .provide(cid)
                    .catch((e) => console.warn("Providing own record:", e.code));
                console.log("> Providing own record");

                // for each subscribed user, add a new handler right?
                for (const username of node.application.subscribed) {
                    await node.pubsub.subscribe(username);
                    console.log("Subscribed to Topic:", username);
                    node.pubsub.on(username, async (msg) => {
                        console.log(`[PUBSUB] Record for:${username} updated!`);
                        let record = JSON.parse(new TextDecoder().decode(msg.data));
                        const cid = await username_cid(record.username);
                        set_record(cid.toString(), record);
                    });
                }
                retrieve_followers(node);
                return;
            }

            let providers;
            try {
                providers = await all(
                    node.contentRouting.findProviders(cid, {timeout: 5000})
                );
            } catch (_) {
                console.log("Could not find providers for own record");
                providers = [];
            }

            if (providers.length === 0) {
                console.log("Record not found! Creating...");
                set_record(cid.toString(), node.application);
                await node.contentRouting
                    .provide(cid)
                    .catch((e) => console.warn("Providing own record:", e.code));
                console.log("> Providing own record");
                retrieve_followers(node);
                return;
            }

            console.log(
                "Found",
                providers.length,
                "providers for own record:",
                providers.map((v) => v.id.toB58String())
            );

            let done = false;
            let record = null;
            let i = 0;
            while (!done && i < providers.length) {
                let dial = null;

                try {
                    dial = await node.dialProtocol(providers[i++].id, ["/record/1.0.0"]);
                } catch (e) {
                    continue;
                }

                const {stream} = dial;
                await pipe([cid.toString()], stream);
                await pipe(stream, async function (source) {
                    const allItems = [];
                    for await (const item of source) {
                        allItems.push(item.toString());
                    }

                    if (allItems[0] === "ERR_NOT_FOUND") {
                        return;
                    }

                    record = JSON.parse(allItems[0]);
                    set_record(cid.toString(), record);
                    node.application = record;
                    console.log(
                        "Retrieved own record from:",
                        providers[i - 1].id.toB58String()
                    );
                    await node.contentRouting.provide(cid);
                    console.log("> Providing own record");
                    done = true;
                });
            }

            if (record === null) {
                console.log("Record not found! Creating...");
                set_record(cid.toString(), node.application);
            }

            await node.contentRouting
                .provide(cid)
                .catch((e) => console.warn("Providing:", e.code));
            console.log("> Providing own record");

            // for each subscribed user, add a new handler right?
            for (const username of node.application.subscribed) {
                await node.pubsub.subscribe(username);
                console.log("Subscribed to Topic:", username);
                node.pubsub.on(username, async (msg) => {
                    console.log(`[PUBSUB] Record for:${username} updated!`);
                    let record = JSON.parse(new TextDecoder().decode(msg.data));
                    const cid = await username_cid(record.username);
                    set_record(cid.toString(), record);
                });
            }
            retrieve_followers(node);
        }

        node.peerStore.addressBook.add(connection.remotePeer, [
            connection.remoteAddr,
        ]);
    });

    node.handle("/username", ({stream}) => {
        pipe([node.application.username], stream);
    });

    node.handle("/subscribe/1.0.0", ({stream}) => {
        pipe(stream, async function (source) {
            for await (const msg of source) {
                // add new subscriber (idempotent)
                if (!collect(node.application.subscribers).contains(msg.toString())) {
                    node.application.subscribers.push(msg.toString());
                    // update record
                    await exports.put_record(node, node.application);
                }
            }
        });
    });

    node.handle("/unsubscribe/1.0.0", ({stream}) => {
        pipe(stream, async function (source) {
            for await (const msg of source) {
                // remove subscriber (idempotent)
                node.application.subscribers = node.application.subscribers.filter(
                    function (value) {
                        return value !== msg.toString();
                    }
                );
                await exports.put_record(node, node.application);
            }
        });
    });

    node.handle("/echo/1.0.0", ({stream}) => {
        pipe(["echo"], stream);
    });

    node.handle("/record/1.0.0", async ({stream}) => {
        // receive cid for the record
        let cid = null;
        await pipe(stream, async function (source) {
            for await (const msg of source) {
                cid = msg.toString();
                return;
            }
        });
        if (!cid) return;
        console.log("CID:", cid);
        if (!RECORDS.has(cid)) {
            console.log("CID not found!");
            pipe(["ERR_NOT_FOUND"], stream);
        } else {
            console.log("Sending Record:", RECORDS.get(cid).record.username);
            pipe([JSON.stringify(RECORDS.get(cid).record)], stream);
        }
    });

    node.handle("/followers/1.0.0", async ({stream}) => {
        console.log("Followers protocol started!")
        let username = null;
        await pipe(stream, async function (source) {
            for await (const msg of source) {
                username = msg.toString();
                return;
            }
        });
        if (!username) return;

        pipe([node.application.subscribed.includes(username) ? "YES" : "NO"], stream);

        exports.put_record(node, node.application);
    });

    node.handle("/update/1.0.0", async ({stream}) => {
        console.log("Update trigger started!");
        await pipe(stream, async function (source) {
            for await (const msg of source) {
                username = msg.toString();
                console.log("Trigger started by:", username);
                return;
            }
        });
        exports.put_record(node, node.application);
    })

    await node.start();
    console.log("libp2p has started");

    // subscribe own topic, so it can publish everytime there's a change on its own record
    node.pubsub.subscribe(node.application.username);

    node.pubsub.on(node.application.username, async (msg) => {
        console.log("Own node has been updated!");
        node.application = JSON.parse(new TextDecoder().decode(msg.data));
        let cid = await username_cid(node.application.username);
        node.pubsub.publish(
            node.application.username,
            new TextEncoder().encode(JSON.stringify(node.application))
        );
        set_record(cid.toString(), node.application);
    });

    const listenAddrs = node.transportManager.getAddrs();
    console.log("listen:", listenAddrs);

    const advertiseAddrs = node.multiaddrs;
    console.log("advertise:", advertiseAddrs);

    Ping.mount(node);

    return node;
};

exports.get_providers = async function (node, username) {
    let cid = await username_cid(username);

    let providers;
    try {
        providers = await all(
            node.contentRouting.findProviders(cid, {timeout: 5000})
        );
    } catch (_) {
        providers = [];
    }

    return providers.map((v) => v.id.toB58String());
};

const username_cid = async function (username) {
    // Encoded Uint8array representation of `value` using the plain JSON IPLD codec
    const bytes = json.encode(username);
    // Hash Uint8array representation
    const hash = await sha256.digest(bytes);
    // Create CID (default base32)
    return CID.create(1, json.code, hash);
};

function ping(node, peerId, timeout) {
    return new Promise((resolve) => {
        Ping(node, peerId).then(
            (latency) => resolve(latency),
            (err) => resolve(err.code)
        );
        setTimeout(() => resolve(null), timeout);
    });
}

async function check_alive(node, peerId, timeout) {
    const result = await ping(node, peerId, timeout);
    if (result == null) {
        console.log("Couldnt ping (-1):", "ERR_NOT_REACHABLE");
        return {status: -1, message: "ERR_NOT_REACHABLE"};
    }
    if (!isFinite(result)) {
        console.log("Couldnt ping (-2):", result);
        return {status: -2, message: result};
    }
    console.log("Ping:", result);
    return {status: 0, message: result};
}

async function _get_username(node, peerId) {
    return new Promise(async (resolve) => {
        // Check if the node is reachable (fml)
        const ping = await check_alive(node, peerId, 10000);
        if (ping.status === -1) {
            return resolve({message: "unreachable node", code: "ERR_NOT_FOUND"});
        }
        if (ping.status === -2) {
            return resolve({message: "unreachable node", code: ping.message});
        }

        node.dialProtocol(peerId, ["/username"]).then(
            async ({stream}) => {
                await pipe(stream, async function (source) {
                    for await (const msg of source) {
                        // first one since the other side just sends one value -> username
                        resolve({message: msg.toString(), code: "OK"});
                        return;
                    }
                });
            },
            (reason) => resolve({message: "unreachable node", code: reason.code})
        );
    });
}

exports.stop_node = async function (node) {
    await node.stop();
    RECORDS = new Map();
    console.log("Node Stopped!");
    return "OK";
};

exports.get_discovered = async function (node) {
    const discovered = [];

    node.peerStore.addressBook.data.forEach((v, k) => {
        let node = {
            id: k,
        };

        let addresses = [];
        v.addresses.forEach((address) => {
            addresses.push(address.multiaddr.toString());
        });
        node.addresses = addresses;

        discovered.push(node);
    });

    // usernames
    for (let discoveredElement of discovered) {
        let peerId = PeerId.createFromB58String(discoveredElement.id);

        if (BOOTSTRAP_IDS.includes(discoveredElement.id)) {
            discoveredElement.username = "bootstrap node";
            continue;
        }

        let {message, code} = await _get_username(node, peerId);

        switch (code) {
            case "ERR_DIALED_SELF":
                discoveredElement.username = node.application.username;
                break;
            case "ERR_UNSUPPORTED_PROTOCOL":
                discoveredElement.username = "bootstrap node";
                break;
            case "OK":
                discoveredElement.username = message;
                break;
            default:
                break;
        }
    }

    return discovered;
};

exports.get_username = async function (node, idStr) {
    try {
        let peerId = PeerId.createFromB58String(idStr);
        return await _get_username(peerId);
    } catch (e) {
        return {message: "ERR_PEERID"};
    }
};

exports.put_record = async function (node, record) {
    node.application = record;
    set_record((await username_cid(node.application.username)).toString(), record);

    node.application.updated = Date.now();

    return new Promise((resolve, reject) => {
        node.pubsub
            .publish(
                node.application.username,
                new TextEncoder().encode(JSON.stringify(record))
            )
            .then(
                (_) => {
                    console.log("> Record Updated and Published!");
                    resolve();
                },
                (reason) => {
                    console.log("> Could not update and publish record:", reason.message);
                    reject(reason);
                }
            );
    });
};

exports.get_peer_id_by_username = async function (node, username) {
    const user = await get_user_id_by_username(username);
    if (user === null) {
        return "ERR_NOT_FOUND";
    }
    return user.id;
};

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
            set_record(cid.toString(), record);
        });

        // somebody should have the user's record by CID, if not there's nothing we can do.
        const cid = await username_cid(username);

        let providers = [];
        try {
            providers = await all(
                node.contentRouting.findProviders(cid, {timeout: 5000})
            );
        } catch (e) {
            console.log("Could not find providers for:", username);
            return resolve("ERR_NOT_ONLINE");
        }

        if (providers.length === 0) {
            return resolve("ERR_NOT_FOUND");
        }

        console.log("Found", providers.length, "providers for", username);

        let done = false;
        let record = null;
        let i = 0;
        while (!done && i < providers.length) {
            let dial = null;

            const ping = await check_alive(node, peerId, 10000);
            if (ping.status !== 0) {
                i++;
                continue;
            }

            try {
                dial = await node.dialProtocol(providers[i++].id, ["/record/1.0.0"]);
            } catch (e) {
                continue;
            }

            const {stream} = dial;
            await pipe([cid.toString()], stream);
            await pipe(stream, async function (source) {
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

                    await node.pubsub.publish(
                        username,
                        new TextEncoder().encode(JSON.stringify(record))
                    );
                    console.log("[PUBSUB] Sent an update for:", username);
                }

                await node.contentRouting.provide(cid);
                set_record(cid.toString(), record);
                console.log("> Providing for:", username);
                done = true;
            });
        }
        return resolve(record);
    });
};

exports.unsubscribe = async function (node, peerId, username) {
    return new Promise(async (resolve) => {
        if (!collect(node.application.subscribed).contains(username)) {
            return resolve("ERR_NOT_SUBSCRIBED");
        }

        node.application.subscribed = node.application.subscribed.filter(function (
            value
        ) {
            return value !== username;
        });
        await exports.put_record(node, node.application);
        // signal we are not subscribing user anymore
        // somebody should have the user's record by CID, if not there's nothing we can do.
        const cid = await username_cid(username);

        let providers = [];
        try {
            providers = await all(
                node.contentRouting.findProviders(cid, {timeout: 5000})
            );
        } catch (e) {
            console.log("Could not find providers for:", username);
            return resolve("ERR_NOT_ONLINE");
        }

        if (providers.length === 0) {
            return resolve("ERR_NOT_FOUND");
        }

        console.log("Found", providers.length, "providers for", username);

        let done = false;
        let record = null;
        let i = 0;
        while (!done && i < providers.length) {
            let dial = null;

            const ping = await check_alive(node, peerId, 10000);
            if (ping.status !== 0) {
                i++;
                continue;
            }

            try {
                dial = await node.dialProtocol(providers[i++].id, ["/record/1.0.0"]);
            } catch (e) {
                continue;
            }

            const {stream} = dial;

            await pipe([cid.toString()], stream);
            await pipe(stream, async function (source) {
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

                    await node.pubsub.publish(
                        username,
                        new TextEncoder().encode(JSON.stringify(record))
                    );
                    console.log("[PUBSUB] Sent an update for:", username);
                }
                done = true;
            });
        }

        await node.pubsub.unsubscribe(username);
        RECORDS.delete(cid.toString());
        console.log("[PUBSUB] Unsubscribed", username);
        return resolve("OK");
    });
};

exports.echo = async function (node, peerId) {
    return new Promise(async (resolve) => {
        const ping = await check_alive(node, peerId, 10000);
        if (ping.status !== 0) {
            return resolve(false);
        }

        node.dialProtocol(peerId, ["/echo/1.0.0"]).then(
            async ({stream}) => {
                pipe(stream, async function (source) {
                    for await (const msg of source) {
                        if (msg.toString() === "echo") {
                            resolve(true);
                            return;
                        }
                    }
                });
            },
            (_) => resolve(false)
        );
    });
};

exports.get_record_if_subscribed = async function (node, username) {
    // check if its self
    if (username === node.application.username) {
        return {message: "ERR_SELF", content: node.application};
    }

    const cid = await username_cid(username);
    if (
        RECORDS.has(cid.toString()) &&
        collect(node.application.subscribed).contains(username)
    ) {
        return {message: "OK", content: RECORDS.get(cid.toString()).record};
    }

    if (collect(node.application.subscribed).contains(username)) {
        return {message: "ERR_NO_INFO", content: null};
    }

    // check if exists
    const peerId = await get_user_id_by_username(username);
    if (peerId == null) {
        return {message: "ERR_NOT_FOUND", content: null};
    }

    // otherwise not subscribed, can't get information
    return {message: "ERR_NOT_SUBSCRIBED", content: null};
};

exports.get_feed = function (node) {
    let posts = [];

    RECORDS.forEach((value) => {
        posts.push(...value.record.posts);
    });

    return posts.sort((a, b) => b.timestamp - a.timestamp);
};
