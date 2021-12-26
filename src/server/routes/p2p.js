const p2p = require('../p2p');
const express = require("express");
const PeerId = require("peer-id");
const router = express.Router();

let node = null;

/**
 * When node is started it should update the username variable
 * then it should start a PUT operation for its record on the network
 * @param username username linked to the user
 * @returns {Promise<unknown>}
 */
async function create(username) {
    node = await p2p.create_node();
    node.application.username = username;
    return node;
}

/**
 * GET information for node
 * returns discovered Peers
 */
router.get('/info', async (req, res) => {
    if (!node) {
        return res.status(400).send({
            message: "Node not Started!"
        });
    }

    const discovered = await p2p.get_discovered(node);

    res.send({discovered: discovered, data: node.application});
})

router.post('/info', (req, res) => {
    if (!node) {
        return res.status(400).send({
            message: "Node not Started!"
        });
    }

    if (!req.body.username) {
        return res.status(400).send({
            message: "Username provided is not valid!"
        });
    }

    node.application.username = req.body.username;
    console.info("Username changed to:", node.application.username);
    res.send({message: "success"});
})

router.get('/username/:peerid', (req, res) => {
    if (!node) {
        return res.status(400).send({
            message: "Node not Started!"
        });
    }

    p2p.get_username(node, req.params.peerid)
        .then((data) => res.send(data));
})


/**
 * POST method to update/create the public record for the user with a new post
 */
router.post('/posts', (req, res) => {
    if (!node) {
        return res.status(400).send({
            message: "Node not Started!"
        });
    }

    if (req.body.post.length > 240) {
        return res.status(400).send({message: 'ERR_DATA_LENGTH'});
    }

    const post = {
        data: req.body.post,
        author: node.application.username,
        timestamp: Date.now()
    };

    const putRecord = (record) => {
        p2p.put_record(node, record)
            .then(
                _ => res.send({message: 'success', record: record}),
                reason => res.send({message: reason.code, record: record})
            );
    }

    p2p.get_or_create_record(node)
        .then(
            message => {
                // Get the record and add the new post
                let msgStr = new TextDecoder().decode(message.val);
                let record = JSON.parse(msgStr);

                record.posts.push(post);

                putRecord(record);
            },
            _ => {
                // Get the record and add the new post
                let record = {
                    posts: [post],
                    subscribers: [],
                    subscribed: [],
                    username: node.application.username,
                    peerId: node.peerId.toB58String()
                };

                putRecord(record);
            }
        );
})

router.get('/record', (req, res) => {
    if (!node) {
        return res.status(400).send({
            message: "Node not Started!"
        });
    }

    res.send({message: node.application});
})

/**
 * GET Method to retrieve a user's public record
 */
router.get('/records/:username', (req, res) => {
    if (!node) {
        return res.status(400).send({
            message: "Node not Started!"
        });
    }

    p2p.get_record(node, req.params.username)
        .then((message) => res.send({message: message}))
})

/**
 * POST Method to Subscribe a user
 * Body:
 *  - username: string
 */
router.post('/subscribe', async (req, res) => {
    if (!node) {
        return res.status(400).send({
            message: "Node not Started!"
        });
    }

    if (!req.body.username) {
        return res.status(400).send({
            message: "Invalid Body!"
        })
    }

    // subscribe peer
    let peerIdStr = await p2p.get_peer_id_by_username(node, req.body.username);
    if (peerIdStr === "ERR_NOT_FOUND") {
        res.send({message: "ERR_NOT_FOUND"});
        return;
    }

    const peerId = await PeerId.createFromB58String(peerIdStr);

    let response = await p2p.subscribe(node, peerId, req.body.username);

    res.send({message: response})
})

/**
 * POST Method to Unsubscribe a user
 * Body:
 *  - username: string
 */
router.post('/unsubscribe', async (req, res) => {
    if (!node) {
        return res.status(400).send({
            message: "Node not Started!"
        });
    }

    if (!req.body.username) {
        return res.status(400).send({
            message: "Invalid Body!"
        })
    }

    // subscribe peer
    let peerIdStr = await p2p.get_peer_id_by_username(node, req.body.username);
    if (peerIdStr === "ERR_NOT_FOUND") {
        res.send({message: "ERR_NOT_FOUND"});
        return;
    }

    const peerId = await PeerId.createFromB58String(peerIdStr);

    let response = await p2p.unsubscribe(node, peerId, req.body.username);

    res.send({message: response})
})


module.exports = [router, create];