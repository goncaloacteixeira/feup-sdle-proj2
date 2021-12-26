const Libp2p = require('libp2p');
const TCP = require('libp2p-tcp');
const {NOISE} = require('libp2p-noise');
const MPLEX = require('libp2p-mplex');
const Gossipsub = require('libp2p-gossipsub');
const Bootstrap = require('libp2p-bootstrap');
const DHT = require('libp2p-kad-dht');
const pipe = require('it-pipe')
const PeerId = require("peer-id");

exports.create_node = async function create_node() {
    const node = await Libp2p.create({
        addresses: {
            listen: ['/ip4/0.0.0.0/tcp/0']
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
            }, dht: {
                enabled: true
            }
        }
    });

    node.application = {
        posts: [],
        subscribed: [],
        subscribers: [],
        username: node.peerId.toB58String(),
        peerId: node.peerId.toB58String(),
        updated: 0,
    };

    node.on('peer:discovery', (peer) => {
        console.log('peer:discovery', peer.toB58String());
    });

    node.connectionManager.on('peer:connect', async (connection) => {
        console.log('Connected to:', connection.remotePeer.toB58String());
    })

    node.handle('/username', ({stream}) => {
        pipe([node.application.username], stream)
    })

    await node.start();
    console.log('libp2p has started');

    const listenAddrs = node.transportManager.getAddrs();
    console.log('listen:', listenAddrs);

    const advertiseAddrs = node.multiaddrs;
    console.log('advertise:', advertiseAddrs);

    return node;
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

        switch (code) {
            case 'ERR_DIALED_SELF':
                discoveredElement.username = node.application.username;
                break;
            default:
                discoveredElement.username = message;
        }
    }

    return discovered;
}

exports.get_username = async function (node, idStr) {
    // needs try/catch
    let peerId = PeerId.createFromB58String(idStr);
    return await _get_username(peerId);
}

exports.put_record = async function (node, record) {
    node.application = record;
    node.application.updated = Date.now();

    return await node.contentRouting.put(new TextEncoder().encode(node.application.username), new TextEncoder().encode(JSON.stringify(record)));
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

