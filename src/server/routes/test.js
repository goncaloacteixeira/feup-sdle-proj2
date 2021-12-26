const express = require('express');
const {json} = require("express");
const router = express.Router();

router.get('/', (req, res, next) => {
    res.json('hello from server');
});

module.exports = router;