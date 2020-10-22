const decode = require('./convertVar.js'),
    transformDataType = require('./transformDataType.js'),
    TwosComplementBuffer = require('twos-complement-buffer')

/**
 * @param {Buffer} packet - The packet you want decoded, as a Buffer.
 * @param {Buffer} fullPacket - The full packet, if "packet" was a chunk of it.
 * @returns {Object} - The decoded data, appropriately named and grouped.
 **/
module.exports = function (packet, fullPacket) {
    const packetID = "0x" + packet[0].toString(16).padStart(2, '0')
    switch (packetID) {
        case "0x01":
            return loginPacket(packet)
        case "0x02":
            return decodeString(packet)
        case "0x03":
            return chatPacket(packet)
        case "0x0b":
            return positionPacket(packet)
        case "0x0c":
            return rotationPacket(packet)
        case "0x0d":
            return positionRotationPacket(packet)
        case "0x0f":
            return blockInteract(packet)
        case "0x10":
            return heldItemChange(packet)
        case "0x12":
            return playAnimation(packet)
        case "0x0e":
            return startBreak(packet)
        case "0x66":
            return modifyinventory(packet)
        default:
            return {
                id: packetID,
                    data: {}
            }
    }
}

function loginPacket(p) {
    // Packet contains MORE than just username, but I don't know what it's for.
    return {
        id: "0x" + p[0].toString(16).padStart(2, '0'),
        data: {
            unknown: parseInt(p[2], 16),
            username: p.toString().replace(/\x00/g, '').slice(3, 3 + parseInt(p[6], 16))
        }
    }
}

function chatPacket(p) {
    var arr = p.toString().split('')
    // Chat messages are pure message content, prefixed with the length of the message.
    const length = arr[2].charCodeAt(0)
    // The content is spaced with "0x00" characters, for some reason.
    // So, I remove the "0x00" characters, and then slice the content out of the packet. 
    const content = arr.join('').replace(/\x00/g, '').slice(2, 2 + length)

    // Return the message content in an object.
    return {
        id: "0x" + p[0].toString(16).padStart(2, '0'),
        data: {
            text: content
        }
    }
}

function positionPacket(p) {
    return {
        id: "0x" + p[0].toString(16).padStart(2, '0'),
        data: {
            position: {
                x: decode.hexToDouble(p.slice(1, 9).toString('hex')),
                y: decode.hexToDouble(p.slice(9, 17).toString('hex')),
                stance: decode.hexToDouble(p.slice(17, 25).toString('hex')),
                z: decode.hexToDouble(p.slice(25, 33).toString('hex')),
                onground: p[p.length - 1].toString().padStart(2, '0') == "01" ? true : false
            }
        }
    }
}

function rotationPacket(p) {
    return {
        id: "0x" + p[0].toString(16).padStart(2, '0'),
        data: {
            rotation: {
                yaw: Math.abs(decode.hexToFloat(p.slice(1, 4).toString('hex'))),
                pitch: Math.abs(decode.hexToFloat(p.slice(5, 9).toString('hex')))
            }
        }

    }
}

function positionRotationPacket(p) {
    // console.log(p)
    return {
        id: "0x" + p[0].toString(16).padStart(2, '0'),
        data: {
            position: {
                x: decode.hexToDouble(p.slice(1, 9).toString('hex')),
                y: decode.hexToDouble(p.slice(9, 17).toString('hex')),
                stance: decode.hexToDouble(p.slice(17, 25).toString('hex')),
                z: decode.hexToDouble(p.slice(25, 33).toString('hex')),
                onground: p[41] == 0x00 ? false : true
            },
            rotation: {
                yaw: Math.abs(decode.hexToFloat(p.slice(33, 37).toString('hex'))),
                pitch: Math.abs(decode.hexToFloat(p.slice(37, 41).toString('hex')))
            }
        }
    }
}

function blockInteract(p) {
    var obj = {
        id: "0x" + p[0].toString(16).padStart(2, '0')
    }



    return obj
}

function decodeString(p) {
    // Yep, decodeString is the same as chatPacket.
    // I kept chatPacket because the comments are nice explanations of the chat.
    var arr = p.toString().split('')
    const length = p[3].toString().charCodeAt(0)

    const content = arr.join('').replace(/\x00/g, '').slice(2, 2 + length)

    return {
        id: "0x" + p[0].toString(16).padStart(2, '0'),
        data: {
            text: content
        }
    }
}

function heldItemChange(p) {
    // EXAMPLE WITH MOVEMENT
    // 10 00 00 0b 40 b3 88 00 00 00 00 00 41 cd cd 53 47 be e6 d0 41 cd cd 53 48 8e 42 f9 40 b3 88 00 00 00 00 00 00
    //        ^ current item. The rest seems to be a position update.
    // EXAMPLE WITH MOVEMENT & ROTATION
    // 10 00 04 0d 40 b3 88 00 00 00 00 00 41 cd cd 31 a5 75 19 c9 41 cd cd 31 a6 44 75 f2 40 b3 88 00 00 00 00 00 42 18 ff 5c 41 10 00 8f 00
    // Presumably, a version for rotating and changing items exists, as well as a stationary version.
    return {
        id: "0x" + p[0].toString(16).padStart(2, '0'),
        data: {
            slot: parseInt(p[2], 16)
        }
    }
}

function playAnimation(p) {
    // Always contains animation ID
    // Can contain rotation update, position update, or both.

    var obj = {
        id: "0x" + p[0].toString(16).padStart(2, '0')
    }

    // if(rot) {
    //     obj.rotation = rot
    // }
    // if(pos) {
    //     obj.position = pos
    // }

    return obj
}

function startBreak(p) {
    const id = "0x" + p[0].toString(16).padStart(2, '0')
    //    bxpos bypos 
    //  e d     3e    00 00 00 a1 02 0b c0 32 fe 35 b2 16 b2 5f 40 50 00 00 00 00 00 00 40 50 62 8f 5c 28 00 00 40 64 16 66 67 12 13 46 01
    //  e d     3f    00 00 00 a1 02 0b c0 32 fe 35 ad 63 2f b5 40 50 00 00 00 00 00 00 40 50 62 8f 5c 28 00 00 40 64 16 66 66 60 03 53 01

    const blockPosition = {
        x: p.slice(2, 6).toString("hex"),
        y: parseInt(p[6].toString(16), 16),
        z: p.slice(7, 12).toString("hex")
    }

    if (p.length > 10) {

    } else {
        console.log({
            id: id,
            block: blockPosition
        })
    }

    return {
        id: id
    }
}

function modifyinventory(p) {
    const id = "0x" + p[0].toString(16).padStart(2, '0')

    const action = parseInt(p[2].toString(16), 16)
    const slot = parseInt(p[3].toString(16), 16)

    console.log(slot)

    return {
        id: id,
        data: {
            action: action,
            slot: slot
        }
    }
}

function decode2Comp(buffer) {
    const hexString = buffer.toString("hex")
    const binString = hexString.toString(2)
}