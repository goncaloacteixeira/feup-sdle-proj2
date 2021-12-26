const p2p = require('../p2p');
const express = require("express");
const router = express.Router();
const {CID} = require('multiformats/cid')
const json = require('multiformats/codecs/json')
const {sha256} = require('multiformats/hashes/sha2')
const pipe = require("it-pipe");
const PeerId = require("peer-id");

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

    // usernames
    for (let discoveredElement of discovered) {
        let peerId = PeerId.createFromB58String(discoveredElement.id);
        let {message, code} = await _get_username(peerId);

        switch (code) {
            case 'ERR_DIALED_SELF':
                discoveredElement.username = node.application.username;
                break;
            default:
                discoveredElement.username = message;
        }
    }

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
    console.log(req.params);

    // needs try/catch
    let peerId = PeerId.createFromB58String(req.params.peerid);
    _get_username(peerId).then((response) => res.send(response));
})


async function _get_username(peerId) {
    return new Promise(resolve => {
        node.dialProtocol(peerId, ['/username'])
            .then(async ({stream}) => {
                await pipe(
                    stream,
                    async function (source) {
                        for await (const msg of source) {
                            // first one since the other side just sends one value -> username
                            resolve({message: msg.toString(), code: 'OK'});
                            return;
                        }
                    }
                )
            }, reason => resolve({message: "unreachable node", code: reason.code}));
    });
}

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
        node.application = record;
        node.application.updated = Date.now();

        node.contentRouting.put(new TextEncoder().encode(node.application.username), new TextEncoder().encode(JSON.stringify(record)),
            {minPeers: 4})
            .then(
                _ => res.send({message: 'success', record: record}),
                reason => res.send({message: reason.code, record: record})
            );
    }

    node.contentRouting.get(new TextEncoder().encode(node.application.username))
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

router.get('/records/:username', (req, res) => {
    if (!node) {
        return res.status(400).send({
            message: "Node not Started!"
        });
    }

    node.contentRouting.get(new TextEncoder().encode(req.params.username))
        .then(
            message => {
                // Get the record and add the new post
                let msgStr = new TextDecoder().decode(message.val);
                let record = JSON.parse(msgStr);

                res.send({message: record});
            },
            reason => {
                res.send({message: reason.code})
            }
        );
})


module.exports = [router, create];