const p2p = require('../p2p');
const express = require("express");
const router = express.Router();
const { CID } = require('multiformats/cid')

let node = null;

router.get('/start', (async (req, res) => {
    node = !node ? await p2p.create_node() : node;
    res.json({message: 'success start node',
        listening: node.multiaddrs,
        peerId: node.peerId.toB58String(),
        peerStoreData: node.peerStore.addressBook.data
    });

    // not working yet
    const cid = CID.parse('QmTp9VkYvnHyrqKQuFPiuZkiX9gPcqj6x5LJ1rmWuSySnL')

    setTimeout(() => {
        console.log(node.contentRouting.provide(cid));
    }, 2000);

}));

router.get('/discovered', (req, res) => {
    res.json({discovered: node.discovered});
});

module.exports = router;