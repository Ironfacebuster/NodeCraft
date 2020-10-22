const createPacket = require("../../scripts/createPacket"),
    chatColor = require('../../scripts/chatColor')

module.exports.data = {
    name: "/req",
    description: "Request a chunk. (remove when I can gen them)"
}

var chunks = {}

const createChunk = require('../../scripts/createChunk.js')
const Chunk = createChunk.Chunk,
    Block = createChunk.Block

const tempChunk = new Chunk(0, 0)

for (var y = 0; y < 16; y++) {
    for (var x = 0; x < 32; x++) {
        for (var z = 0; z < 32; z++) {
            const b = new Block(1, 0, x, y, z)
            tempChunk.setBlock(x, y, z, b)
        }
    }
}

const fs = require('fs')

var chunkBuffer1

tempChunk.toPacket((data) => {
    // console.log(data)
    chunkBuffer1 = data
}, "33")

var chunkBuffer2 = Buffer.from(fs.readFileSync(configuration.worldFolder + "/tempchunk.txt").toString(), "hex")

module.exports.execute = (data) => {
    // console.log(data)
    // console.log(chunkBuffer1)
    // console.log(chunkBuffer2)
    const arg = data.arguments ? data.arguments[0] : "0"

    if (arg == "1")
        data.user.connection.socket.write(chunkBuffer1)
    else if (arg == "reload") {
        data.functions.directMessage(data.user.connection, "Reloading tempchunk...")
        chunkBuffer2 = Buffer.from(fs.readFileSync(configuration.worldFolder + "/tempchunk.txt").toString(), "hex")
    } else {
        data.user.connection.socket.write(chunkBuffer2)
        data.user.connection.socket.write(createPacket('0b', [{
            data: data.player.position.x,
            type: "double"
        }, {
            data: 130,
            type: "double"
        }, {
            data: 130,
            type: "double"
        }, {
            data: data.player.position.z,
            type: "double"
        }, {
            data: data.player.position.onground,
            type: "boolean"
        }]))
    }
}