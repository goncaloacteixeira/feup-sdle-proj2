const express = require('express');
const router = express.Router();
const p2p = require('../p2p');
const [_1, _2, get_node] = require('./p2p');

router.get('/record', async (req, res) => {
    let record = get_node().application;
    res.send(record);
})


module.exports = router;





