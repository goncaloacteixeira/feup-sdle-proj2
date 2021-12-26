const p2p = require('./p2p')

async function main() {
    const node = await p2p.create_node();

    setInterval(() => {
        node.pubsub.publish('topic', new TextEncoder().encode('message 1'));
        console.log('sent message')
    }, 1000)
}

main()