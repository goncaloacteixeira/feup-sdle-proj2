const p2p = require('../p2p');
const express = require("express");
const router = express.Router();
const {CID} = require('multiformats/cid')
const json = require('multiformats/codecs/json')
const {sha256} = require('multiformats/hashes/sha2')
const all = require('it-all')
const delay = require('delay')


let node = null;

router.get('/start', (async (req, res) => {
    node = !node ? await p2p.create_node() : node;
    res.json({
        message: 'success start node',
        listening: node.multiaddrs,
        peerId: node.peerId.toB58String(),
        peerStoreData: node.peerStore.addressBook.data
    });

    const bytes = json.encode({hello: 'world'})

    const hash = await sha256.digest(bytes)
    const cid = CID.create(1, json.code, hash)

/*    setTimeout(async () => {
        await node.contentRouting.put(new TextEncoder().encode('message1'), new TextEncoder().encode('nice'),
            {
                minPeers: 1
            }
        ).catch((e) => {
            console.error(e.message)
        });

        await delay(5000);
        const message = await node.contentRouting.get(new TextEncoder().encode('message1'));

        await delay(2000);
        console.log(message.from)
        console.log(new TextDecoder().decode(message.val))
    }, 2000);*/

}));

/**
 * GET information for node
 * returns discovered Peers
 */
router.get('/info', (req, res) => {
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

    res.send({discovered: discovered});
})

router.get('/discovered', (req, res) => {
    res.json({discovered: node.discovered});
});

module.exports = router;