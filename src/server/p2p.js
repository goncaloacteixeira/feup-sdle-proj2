const Libp2p = require('libp2p');
const TCP = require('libp2p-tcp');
const {NOISE} = require('libp2p-noise');
const MPLEX = require('libp2p-mplex');
const MulticastDNS = require('libp2p-mdns');
const Gossipsub = require('libp2p-gossipsub');
const DHT = require('libp2p-kad-dht');
const pipe = require('it-pipe')
const {map} = require('streaming-iterables')
const {toBuffer} = require('it-buffer')

exports.create_node = async function create_node() {
    const node = await Libp2p.create({
        addresses: {
            listen: ['/ip4/0.0.0.0/tcp/0']
        }, modules: {
            transport: [TCP],
            connEncryption: [NOISE],
            streamMuxer: [MPLEX],
            peerDiscovery: [MulticastDNS], // we can add other mechanisms such as bootstrap
            pubsub: Gossipsub,
            dht: DHT,
        }, config: {
            peerDiscovery: {
                autoDial: true, [MulticastDNS.tag]: {
                    interval: 1000, enabled: true
                }, // other discovery module options (for bootstrap for instance)
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

    let latest = false;

    node.connectionManager.on('peer:connect', (connection) => {
        console.log('Connected to:', connection.remotePeer.toB58String());


        if (!latest) {
            // Search for the record, if it exists then do nothing, if not invoke a PUT operation
            node.contentRouting.get(new TextEncoder().encode(node.application.username))
                .then(message => {
                    // Get the record and add the new post
                    let msgStr = new TextDecoder().decode(message.val);
                    let record = JSON.parse(msgStr);

                    if (record.updated <= node.application.updated) {
                        console.log({message: "OK", description: 'WILL NOT UPDATE'});
                        latest = true;
                        return;
                    }

                    node.application = record;
                    node.application.peerId = node.peerId.toB58String();
                    latest = true;

                    console.log({message: 'OK', description: 'RETRIEVED'});
                }, _ => {
                    node.application.updated = Date.now();

                    node.contentRouting.put(new TextEncoder().encode(node.application.username),
                        new TextEncoder().encode(JSON.stringify(node.application)),
                        {minPeers: 1})
                        .then(_ => console.log({message: 'OK', description: 'CREATED'}), reason => console.log({
                            message: reason.code, description: reason.message,
                        }));
                });
        }
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
