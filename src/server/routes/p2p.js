const p2p = require('../p2p');
const express = require("express");
const router = express.Router();
const {CID} = require('multiformats/cid')
const json = require('multiformats/codecs/json')
const {sha256} = require('multiformats/hashes/sha2')
const all = require('it-all')
const delay = require('delay')
const pipe = require("it-pipe");
const PeerId = require("peer-id");
const {reject} = require("delay");


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

    /*setTimeout(async () => {
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
router.get('/info', async (req, res) => {
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


module.exports = router;