const p2p = require('./p2p')

async function main() {
    const node = await p2p.create_node();

    node.pubsub.on('topic', (msg) => {
        console.log('received:', new TextDecoder().decode(msg.data))
    })
    node.pubsub.subscribe('topic');
}

main()