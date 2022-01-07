const PeerId = require('peer-id');
const fs = require('fs');

const myArgs = process.argv.slice(2);

async function create_peer_id(filename) {
    const id = await PeerId.create({ bits: 1024, keyType: 'RSA' })
    let data = JSON.stringify(id.toJSON(), null, 2);
    fs.writeFileSync(filename + '.json', data);
}

create_peer_id(myArgs[0]).then(_ => console.log("Done"));
