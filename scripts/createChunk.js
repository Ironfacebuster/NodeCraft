const {
    fstat
} = require('fs')
const zlib = require('zlib'),
    createPacket = require("./createPacket.js"),
    TwosComplementBuffer = require('twos-complement-buffer')

const chunkPacketID = "33"

class Chunk {
    position = {
        x: 0,
        z: 0
    }
    width = 16
    height = 128
    blocks = []

    constructor(x, z) {
        x = Math.round(x) || 0
        z = Math.round(z) || 0

        this.position = {
            x: x,
            z: z
        }

        for (let y = 0; y < this.height; y++) {
            this.blocks.push([])
            for (let x = 0; x < this.width; x++) {
                for (let z = 0; z < this.width; z++) {
                    this.blocks[y].push({})
                }
            }
        }
    }

    /** @param {Block} block 
     * @param {number} x - Local x position
     * @param {number} y - Local y position
     * @param {number} z - Local z position
     */
    setBlock(x, y, z, block) {
        this.blocks[y][x + z * this.width] = block
    }
    /** @param {Array} blocks */
    setBlocks(blocks) {
        if (!Array.isArray(blocks)) throw new Error("Blocks provided is not an Array!")
        blocks.forEach(block => {
            this.setBlock(block.position.local.x, block.position.local.y, block.position.local.z, block)
        })
    }

    getBlock(x, y, z) {
        return this.blocks[y][x + z * this.width]
    }

    getBlockBytes() {
        var type = [],
            metadata = [],
            light = [],
            sky = [],
            add = [],
            biome = []

        // presetting biome array
        for (var i = 0; i < 256; i++) {
            biome.push("00")
        }

        this.blocks.forEach(section => {
            section.forEach(block => {
                if (Object.keys(block).length > 0) {
                    const b = block.bytes;
                    type.push(b.id)
                    metadata.push(b.metadata)
                    light.push("F")
                    sky.push("F")
                    add.push("0")
                    // biome.push("00")
                }
            })
        })

        var final = type.concat(metadata, light, sky, add)
        if (this.isGroundUp()) final.concat(biome)

        const buff = Buffer.from(final, "hex")

        return buff
    }

    getSlice(y) {
        return this.blocks[y]
    }

    /**
     * @param {function callback(data)} callback - Callback function, called when completed.
     * @param {string} packetID - (Optional) Single byte packet ID
     */
    toPacket(callback) {
        // packetID = packetID || chunkPacketID

        zlib.deflate(this.getBlockBytes(), (err, res) => {
            const arr = this.getArray(res)

            const buffer = createPacket(chunkPacketID, arr)

            callback(buffer)
        })
    }

    /**
     * @param {string} packetID - (Optional) Single byte packet ID
     */
    toPacketSync() {
        // packetID = packetID || chunkPacketID
        const deflatedBlocks = zlib.deflateSync(this.getBlockBytes())
        const arr = this.getArray(deflatedBlocks)
        const packet = createPacket(chunkPacketID, arr)

        return packet
    }

    getArray(deflatedBlocks) {
        var arr = [{
            // Chunk X position
            data: this.position.x,
            type: "tc32bit"
        }, {
            // Chunk Z position
            data: this.position.z,
            type: "tc32bit"
        }, {
            // Ground-Up continuous (is every block accounted for?)
            data: this.isGroundUp(),
            type: "boolean"
        }, {
            // Primary bitmap
            data: this.getBitmap(),
            type: "ushort"
        }, {
            // "Add" bitmap
            data: 0,
            type: "ushort"
        }, {
            // Size of compressed chunk data
            data: deflatedBlocks.length,
            type: "int"
        }, {
            data: 0,
            type: "int"
        }]

        // console.log(JSON.stringify(arr))

        const blockBytes = deflatedBlocks

        if (blockBytes.length > 1)
            arr.push({
                // Compressed chunk data
                data: blockBytes,
                type: "nop"
            })

        // console.log(deflatedBlocks)
        return arr
    }

    getBitmap() {
        var binary = new Array(this.height / 16)
        for (var i = 0; i < 16; i++) {

            // if (binary[i] == 0)
            binary[i] = 0
            for (var y = i; y < i + 16; ++y) {
                for (var x = 0; x < 16; ++x) {
                    for (var z = 0; z < 16; ++z) {
                        const thisBlock = this.getBlock(x, y, z)
                        if (Object.keys(thisBlock).length > 0) binary[i] = 1
                    }
                }
            }
        }

        console.log(binary)
        // console.log(parseInt(binary.join(''), 2))
        return parseInt(binary.join(''), 2)
    }

    isGroundUp() {
        var allData = true
        for (var y = 0; y < this.height; ++y) {
            for (var x = 0; x < 16; ++x) {
                for (var z = 0; z < 16; ++z) {
                    const thisBlock = this.getBlock(x, y, z)

                    if (Object.keys(thisBlock).length == 0) allData = false
                }
            }
        }

        return allData
    }
}

Buffer.prototype.toArray = function () {
    var arr = new Array(this.length)
    for (var i = 0; i < this.length; ++i) {
        arr[i] = this[i]
    }
    return arr
}

class Block {
    metadata = 0
    id = 0
    isAir = false
    position = {
        local: {
            x: 0,
            y: 0,
            z: 0
        },
        global: {
            x: 0,
            y: 0,
            z: 0
        }
    }

    /**
     * @param {number} id - The block ID
     * @param {number} metadata - Extra data, such as orientation
     * @param {number} x - Global x position
     * @param {number} y - Global y position
     * @param {number} z - Global z position
     */
    constructor(id, metadata, x, y, z) {
        x = Math.round(x) || 0
        y = Math.round(y) || 0
        z = Math.round(z) || 0

        this.setID(id)
        if (id == 0) isAir = true

        this.setMetadata(metadata)

        const position = {
            x: x,
            y: y,
            z: z
        }
        this.position.global = position
        this.position.local = position
    }

    /**
     * @param {number} id - The block ID
     */
    setID(id) {
        id = Math.min(256, Math.max(0, Math.round(id))) || 0

        this.ID = id
    }

    /**
     * @param {number} metadata - Extra data, such as orientation
     */
    setMetadata(metadata) {
        metadata = Math.min(16, Math.max(0, Math.round(metadata))) || 0

        this.metadata = metadata
    }

    /**
     * @param {number} x - Global x position
     * @param {number} y - Global y position
     * @param {number} z - Global z position
     */
    setGlobalPosition(x, y, z) {
        x = Math.round(x) || 0
        y = Math.round(y) || 0
        z = Math.round(z) || 0

        this.position.global = {
            x: x,
            y: y,
            z: z
        }
    }
    get globalPosition() {
        return this.position.global
    }

    /**
     * @param {Chunk} chunk
     */
    setLocalPosition(chunk) {
        this.position.local = {
            x: x - chunk.position.x,
            y: y,
            z: z - chunk.position.z
        }
    }
    get localPosition() {
        return this.position.local
    }

    get bytes() {
        var metadata = this.metadata.toString(16),
            id = this.id.toString(16).padStart(2, '0'),
            y = this.position.local.y.toString(16).padStart(2, '0'),
            z = this.position.local.z.toString(16),
            x = this.position.local.x.toString(16)

        return {
            id: id,
            metadata: metadata,
            position: {
                x: x,
                y: y,
                z: z
            }
        }

        // var b = metadata + id + y + z + x
        // return b.padStart(8, '0')
    }

    // get bytes() {

    // }
}

module.exports.Chunk = Chunk
module.exports.Block = Block