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
        },
        modules: {
            transport: [TCP],
            connEncryption: [NOISE],
            streamMuxer: [MPLEX],
            peerDiscovery: [MulticastDNS], // we can add other mechanisms such as bootstrap
            pubsub: Gossipsub,
            dht: DHT,
        },
        config: {
            peerDiscovery: {
                autoDial: true,
                [MulticastDNS.tag]: {
                    interval: 1000,
                    enabled: true
                },
                // other discovery module options (for bootstrap for instance)
            },
            dht: {
                enabled: true
            }
        }
    });

    node.application = {
        username: node.peerId.toB58String(),
    };

    node.on('peer:discovery', (peer) => {
        console.log('peer:discovery', peer.toB58String());
    });

    node.connectionManager.on('peer:connect', (connection) => {
        console.log('Connected to:', connection.remotePeer.toB58String());
    })

    node.handle('/username', ({stream}) => {
        pipe(
            [node.application.username],
            stream
        )
    })

    await node.start();
    console.log('libp2p has started');

    const listenAddrs = node.transportManager.getAddrs();
    console.log('listen:', listenAddrs);

    const advertiseAddrs = node.multiaddrs;
    console.log('advertise:', advertiseAddrs);

    return node;
}
