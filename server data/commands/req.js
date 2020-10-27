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

const tempChunk = new Chunk(-32, 0)

for (var y = 16; y < 17; y++) {
    for (var x = 0; x < 32; x++) {
        for (var z = 0; z < 32; z++) {
            const b = new Block(2, 0, x, y, z)
            tempChunk.setBlock(x, y, z, b)
        }
    }
}

const b = new Block(1, 0, -32, 18, 0)
tempChunk.setBlock(x, y, z, b)

const fs = require('fs')

var chunkBuffer1

tempChunk.toPacket((data) => {
    // console.log(data)
    chunkBuffer1 = data
    fs.writeFile(configuration.worldFolder + "/test chunk.txt", data.toString("hex"), () => {})
}, "33")

var chunkBuffer2 = Buffer.from(fs.readFileSync(configuration.worldFolder + "/tempchunk.txt").toString(), "hex")

module.exports.execute = (data) => {
    // console.log(data)
    // console.log(chunkBuffer1)
    // console.log(chunkBuffer2)
    const arg = data.arguments ? data.arguments[0] : "0"

    if (arg == "1") {
        data.functions.directMessage(data.user.connection, "Sending a server generated chunk. " + chatColor.gray(`(${chunkBuffer1.byteLength} bytes.)`))
        data.user.connection.socket.write(chunkBuffer1)
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
    } else if (arg == "reload") {
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