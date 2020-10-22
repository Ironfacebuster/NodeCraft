/**
 * @param {string} hex - Hexadecimal string.
 */
function hexToDouble(hex) {
    if (hex.length > 16) throw Error(`hex is too big! ${hex.length} > 16`)

    hex = hex.split('')

    var binary = []

    hex.forEach(c => {
        if (parseInt(c) != c) {
            c = hexCharToBinary(c)
            binary.push(c)
        } else
            binary.push(getBinary(parseInt(c)))
    })

    binary = binary.join('')

    // is the double positive or negative?
    var sign = parseInt(binary[0]) == 0 ? 1 : -1

    var exponent = Math.pow(2, parseInt(binary.slice(1, 12), 2) - 1023)

    var mantissa = binaryToDecimal(`1.${binary.slice(12, binary.length)}`)

    var final = (sign * exponent * mantissa)
    if(isNaN(final) || final == Infinity || final == null || final.toString().indexOf('e') != -1) final = 0

    return final
}
/**
 * @param {string} hex - Hexadecimal string.
 */
function hexToFloat(hex) {
    if (hex.length > 8) throw Error(`hex is too big! ${hex.length} > 8`)

    hex = hex.split('')

    var binary = []

    hex.forEach(c => {
        if (parseInt(c) != c) {
            c = hexCharToBinary(c)
            binary.push(c)
        } else
            binary.push(getBinary(parseInt(c)))
    })

    binary = binary.join('')

    // is the double positive or negative?
    var sign = parseInt(binary[0]) == 0 ? 1 : -1

    var exponent = Math.pow(2, parseInt(binary.slice(1, 9), 2) - 127)

    var mantissa = binaryToDecimal(`1.${binary.slice(9, binary.length)}`)

    var final = (sign * exponent * mantissa)
    if(isNaN(final) || final == Infinity || final == null || final.toString().indexOf('e') != -1) final = 0

    return final
}
/**
 * @param {float} float - Single precision floating point number.
 */
function floatToHex(float) {
    if (Math.abs(float) == 0 || float == null || isNaN(float) || float.toString().indexOf('e') != -1) return ["00", "00", "00", "00"]
    // positive/negative  -   +
    var sign = float < 0 ? 1 : 0
    var exponent = Math.floor(Math.log(Math.abs(float)) / Math.LN2)
    var mantissa = (Math.abs(float) / Math.pow(2, exponent))

    const firstBit = sign,
        nexteight = dec2bin(exponent + 127),
        last24 = mantissa.toString().indexOf('.') >= 0 ? mantissa.toString(2).split('.')[1].padEnd(23, 0).slice(0, 23) : "0".padEnd(23, 0)

    const finalHex = splitIntoByteArry(parseInt(firstBit + nexteight + last24, 2).toString(16).slice(0, 8))
    return splitIntoByteArry(finalHex)
}
/**
 * @param {double} double - Double precision floating point number.
 */

function doubleToHex(double) {
    if (Math.abs(double) == 0 || double == null || isNaN(double) || double.toString().indexOf('e') != -1) return ["00", "00", "00", "00", "00", "00", "00", "00"]
    // positive/negative  -   +
    var sign = double < 0 ? 1 : 0
    var exponent = Math.floor(Math.log(Math.abs(double)) / Math.LN2)
    var mantissa = (Math.abs(double) / Math.pow(2, exponent))

    const firstBit = sign,
        nexteleven = dec2bin(exponent + 1023),
        last52 = mantissa.toString().indexOf('.') >= 0 ? mantissa.toString(2).split('.')[1].padEnd(52, 0).slice(0, 52) : "0".padEnd(52, 0)

    const finalHex = parseInt(firstBit + nexteleven + last52, 2).toString(16).slice(0, 16)
    return splitIntoByteArry(finalHex)
}

function splitIntoByteArry(d) {
    var array = []
    const s = d.toString()
    for (var i = 0; i < s.length; i += 2) {
        array.push("0x" + s.substr(i, 2))
    }
    return array
}

function getBinary(num) {
    return (num >>> 0).toString(2).padStart(4, '0');
}

function isHex(h) {
    var a = parseInt(h, 16);
    return (a.toString(16) === h)
}

function hexCharToBinary(hex) {
    const dict = {
        a: 1010,
        b: 1011,
        c: 1100,
        d: 1101,
        e: 1110,
        f: 1111
    }

    return dict[hex]
}

function binaryToDecimal(binary) {
    const length = binary.toString().length

    var radix = binary.indexOf('.')
    if (radix == -1) radix = length

    var intDecimal = 0,
        fractDecimal = 0,
        twos = 1

    for (var i = radix - 1; i >= 0; --i) {
        intDecimal += parseInt(binary[i]) * twos
        twos *= 2
    }

    twos = 2
    for (var i = radix + 1; i < length; ++i) {
        fractDecimal += parseInt(binary[i]) / twos
        twos *= 2
    }

    return intDecimal + fractDecimal
}

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

module.exports.hexToDouble = hexToDouble
module.exports.hexToFloat = hexToFloat
module.exports.floatToHex = floatToHex
module.exports.doubleToHex = doubleToHex