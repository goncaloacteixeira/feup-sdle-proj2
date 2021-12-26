const PeerId = require('peer-id');
const Libp2p = require('libp2p');
const TCP = require('libp2p-tcp');
const {NOISE} = require('libp2p-noise');
const MPLEX = require('libp2p-mplex');
const MulticastDNS = require('libp2p-mdns');
const DHT = require('libp2p-kad-dht');

const KEY = process.env.KEY || 'bootstrap1.json';
const KEY_JSON = require('./keys/' + KEY);

/*
 * » BOOTSTRAP NODE «
 *
 * This is still a work in progress!!
 *
 * Bootstrap nodes should keep the records for all users, so that when every user fails there's
 * a safe option to retrieve documents.
 *
 * Bootstrap nodes also have a connection to the database so that the system can use authentication.
 */


async function create_node() {
    const peerId = await PeerId.createFromJSON(KEY_JSON);

    const node = await Libp2p.create({
        peerId,
        addresses: {
            listen: ['/ip4/0.0.0.0/tcp/' + process.env.PORT]
        }, modules: {
            transport: [TCP],
            connEncryption: [NOISE],
            streamMuxer: [MPLEX],
            peerDiscovery: [MulticastDNS],
            dht: DHT,
        }, config: {
            peerDiscovery: {
                autoDial: true,
                [MulticastDNS.tag]: {
                    interval: 1000,
                    enabled: true
                },
            },
            dht: {
                enabled: true
            }
        }
    });

    node.on('peer:discovery', (peer) => {
        console.log('peer:discovery', peer.toB58String());
    });

    node.connectionManager.on('peer:connect', async (connection) => {
        console.log('Connected to:', connection.remotePeer.toB58String());
    })

    await node.start();
    console.log('libp2p has started');

    const listenAddrs = node.transportManager.getAddrs();
    console.log('listen:', listenAddrs);

    const advertiseAddrs = node.multiaddrs;
    console.log('advertise:', advertiseAddrs);

    return node;
}

create_node()
    .then(node => console.log("Node Started!", node.peerId.toB58String()));