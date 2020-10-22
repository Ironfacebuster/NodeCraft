const createPacket = require("../../scripts/createPacket"),
    chatColor = require('../../scripts/chatColor')

module.exports.data = {
    name: "/set",
    description: "Set an inventory slot to a specified item.",
    usage: "/set {inventory section} {slot} {item id} {count}",
    op: true
}

const sections = {
    // All values are slot "1" of their respective elements.
    // So you would write to "slot 1" of "main" (which would equal slot 10), or "slot 0" of "crafting.result" (slot 0)
    "main": 9,
    "hotbar": 36,
    "armor": 5,
    "crafting.grid": 1,
    "crafting.result": 0
}

module.exports.execute = (data) => {
    // main
    // hotbar
    // armor
    // crafting.grid
    // crafting.result
    const inv = data.arguments[0] || "null",
        slot = data.arguments[1] || 0,
        id = Math.min(2257, Math.max(1, data.arguments[2])) || 1,
        count = Math.min(64, Math.max(0, data.arguments[3])) || 64

    if (!sections.hasOwnProperty(inv)) return data.functions.directMessage(data.user.connection, chatColor.red(`Invalid parameter for {inventory section}`))

    const arr = [{
        data: ["0x00", "0x00", `0x${Math.min(44, Math.max(sections[inv] + slot, 0)).toString(16).padStart(2,0)}`],
        type: "nop"
    }, {
        data: ["0x00", "0x00", "0x00"],
        type: "nop"
    }, {
        data: ["0x00", "0x00", `0x${id.toString(16).padStart(2,0)}`],
        type: "nop"
    }, {
        data: count.toString(16).padStart(2, 0),
        type: "byte"
    }, {
        data: ["0x00", "0x00"],
        type: "nop"
    }]

    // 66 00 00 24 00 00 07 00 ff ff 0a 01
    // 66 00 00 2c 00 00 00 00 00 01 01 00 00

    const packet = createPacket("66", arr)

    console.log(packet)
    // data.user.connection.socket.write(packet)

    data.player.setInventorySlot(data.arguments[0], data.arguments[1], data.arguments[1], data.arguments[2])
    data.functions.directMessage(data.user.connection, `Setting slot ${slot} of ${inv} to be ${count} of ID ${id}.`)
}

// 66 - ID 
// 00 00 24 - Slot number
// 00 00 27 - Click count?
// 00 00 02 - Item ID
// 38 - Item count
// 00 
// 00 
// 0a 01 - No idea