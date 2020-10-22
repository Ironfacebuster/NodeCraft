const convert = require('./convertVar.js'),
    tcb = require('twos-complement-buffer').TwosComplementBuffer

const tcbParser = new tcb(32)

/**
 * @param {any} data - Any value.
 * @param {string} type - varint, string, byte, unsigngedbyte, int, short, long, boolean, double
 * @param {boolean} toHex - Boolean dictating if you're converting to (true) or from (false) Hexadecimal
 */

module.exports = function (data, type, toHex) {
    if (!toHex) console.log(data, type)
    if (typeof type == "undefined") return data
    if (toHex) {
        switch (type) {
            case 'varint':
                return varinttohex(data)
            case 'string':
                return stringtohex(data)
            case 'unsignedbyte':
                return unsignedtohex(data)
            case 'int':
                return splitIntoBytes(data.toString(16).padStart(8, '0'))
            case 'ushort':
                return [ushorttohex(data)]
            case 'long':
                return splitIntoBytes(data.toString(16).padStart(16, '0'))
            case 'boolean':
                return booltohex(data)
            case 'float':
                var d = convert.floatToHex(data)
                return d
            case 'double':
                var d = convert.doubleToHex(data)
                return d
            case 'byte':
                return [`0x${data}`]
            case 'nop':
                return data
            case 'tc32bit':
                var buf = []
                tcbParser.pack(buf, parseFloat(data))
                return buf
        }
    } else {
        switch (type) {
            case 'varint':
                return varint(data)
            case 'string':
                return parseInt(data, 16)
            case 'byte':
                return byte(data)
            case 'unsignedbyte':
                return unsigned(data)
            case 'int':
                return int(data)
            case 'short':
                return short(data)
            case 'long':
                return long(data)
            case 'boolean':
                return bool(data)
            case 'double':
                return convert.hexToDouble(data)
        }
    }
}

function splitIntoBytes(string) {
    var buf = []
    for (var i = 0; i < string.length; i += 2) {
        buf.push("0x" + string.substr(i, 2))
    }
    return buf
}

function ushorttohex(data) {
    return (Math.min(65535, Math.max(parseInt(data), 0)).toString(16).padStart(4, "0"))
}

function stringtohex(string) {
    var arr = ["0x00", "0x" + string.length.toString(16).padStart(2, '0')]
    string.split('').forEach(o => {
        arr.push("0x00")
        arr.push("0x" + Buffer.from(o).toString('hex'))
    })
    return arr
}

function byte(data) {
    data = Math.max(-128, Math.min(data, 127))

    const toInt8 = createToInt(8)

    const converted = toInt8(data).toString(16)

    return '\x5cx' + value.padStart(2, 0)
}

function unsignedtohex(data) {
    data = Math.max(0, Math.min(data, 255))

    const converted = data.toString(16)

    var value = '00'

    if (converted.length == 1) value = '0' + converted

    return [`0x${value}`]
}

function booltohex(bool) {
    return [bool == true ? "0x01" : "0x00"]
}

function bool(data) {
    data = data.toString().padStart(2, '0')
    return data == "01" ? true : false
}

// Fixed, now depreciated.
// HEX_TO_ASCII ADDS EXTRA BYTES SOMEHOW. THIS IS CAUSING NEGATIVE DOUBLES (and large numbers) TO CRASH THE CLIENT.
function hex_to_ascii(str1) {
    var hex = str1.toString()
    var arr = []
    for (var n = 0; n < hex.length; n += 2) {
        // console.log(hex.substr(n, 2),parseInt(hex.substr(n, 2), 16))
        arr.push(String.fromCharCode(parseInt(hex.substr(n, 2), 16)))
    }
    // console.log(arr)
    // console.log(arr)
    return arr
}

function createToInt(size) {
    if (size < 2) {
        throw new Error('Minimum size is 2');
    } else if (size > 64) {
        throw new Error('Maximum size is 64');
    }

    // Determine value range
    const maxValue = (1 << (size - 1)) - 1;
    const minValue = -maxValue - 1;

    return (value) => {
        if (value > maxValue || value < minValue) {
            throw new Error(`Int${size} overflow`);
        }

        if (value < 0) {
            return (1 << size) + value;
        } else {
            return value;
        }
    };
}