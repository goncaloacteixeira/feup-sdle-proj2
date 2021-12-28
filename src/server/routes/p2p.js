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

/**
 * GET username from peerId
 */
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

    node.application.posts.push(post);

    p2p.put_record(node, node.application)
        .then(
            _ => res.send({message: 'success', record: node.application}),
            reason => res.send({message: reason.code, record: node.application})
        );
})

/**
 * GET method for current user's public record
 */
router.get('/record', (req, res) => {
    if (!node) {
        return res.status(400).send({
            message: "Node not Started!"
        });
    }

    res.send({message: node.application});
});

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

/**
 * GET current subscribers
 */
router.get('/subscribers', async (req, res) => {
    if (!node) {
        return res.status(400).send({
            message: "Node not Started!"
        });
    }

    const data = [];

    for (const subscriber of node.application.subscribers) {
        const peerIdStr = await p2p.get_peer_id_by_username(node, subscriber);
        if (peerIdStr === "ERR_NOT_FOUND") {
            data.push({username: subscriber, online: false});
            continue;
        }

        const peerId = await PeerId.createFromB58String(peerIdStr);
        const online = await p2p.echo(node, peerId);

        data.push({username: subscriber, online: online});
    }

    res.send({message: data});
})

/**
 * GET current subscribed users
 */
router.get('/subscribed', async (req, res) => {
    if (!node) {
        return res.status(400).send({
            message: "Node not Started!"
        });
    }

    const data = [];

    for (const sub of node.application.subscribed) {
        const peerIdStr = await p2p.get_peer_id_by_username(node, sub);
        if (peerIdStr === "ERR_NOT_FOUND") {
            data.push({username: sub, online: false});
            continue;
        }

        const peerId = await PeerId.createFromB58String(peerIdStr);
        const online = await p2p.echo(node, peerId);

        data.push({username: sub, online: online});
    }

    res.send({message: data});
});


router.post('/test', async (req, res) => {
    if (!node) {
        return res.status(400).send({
            message: "Node not Started!"
        });
    }

    let username = req.body.username;
    let message = req.body.message;

    await node.pubsub.subscribe(username);
    await node.pubsub.publish(username, new TextEncoder().encode(message));

    res.send({result: "OK", username: username, message: message});
})

router.get('/providers/:username', async (req, res) => {
    if (!node) {
        return res.status(400).send({
            message: "Node not Started!"
        });
    }

    res.send({message: await p2p.get_providers(node, req.params.username)});
})


function get_node() {
    return node;
}


module.exports = [router, create, get_node];