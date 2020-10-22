const transform = require('./transformDataType')

/**
 *   @param {string} id - The packet ID
 *   @param {Array} dataArray - An array of objects containing value and datatype
 **/

function createPacket(id, dataArray) {
    var packet = [`0x${id}`]

    dataArray.forEach(data => {
        const d = convertData(data)
        d.forEach(o => {
            packet.push(o)
        })
    })

    const buffer = Buffer.from(packet)

    return buffer
}

function convertData(obj) {
    return transform(obj.data, obj.type, true)
}

function isHex(d) {
    return d.indexOf('0x') == -1 ? false : true
}

module.exports = createPacket