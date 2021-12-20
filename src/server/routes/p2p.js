const p2p = require('../p2p');
const express = require("express");
const router = express.Router();

let node = null;

router.get('/start', (async (req, res) => {
    node = !node ? await p2p.create_node() : node;
    res.json({message: 'success start node',
        listening: node.multiaddrs,
        peerId: node.peerId.toB58String(),
        discovered: node.discovered
    });
}));

router.get('/discovered', (req, res) => {
    res.json({discovered: node.discovered});
});

module.exports = router;