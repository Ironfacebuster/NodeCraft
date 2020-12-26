const createPacket = require("../../scripts/createPacket"),
    chatColor = require('../../scripts/chatColor'),
    playerManager = require("../../scripts/playerManager")

module.exports.data = {
    name: "/weather",
    description: "Set the current weather state.",
    usage: "/weather {clear|rain}",
    op: true
}

const states = {
    "rain": true,
    "clear": false
}

module.exports.execute = (data) => {
    const set = data.arguments[0].toLowerCase()

    if (!states.hasOwnProperty(set)) return data.functions.directMessage(chatColor.red(`${data.arguments[0]} is not a valid weather state!`))

    var en = states[set]

    const arr = [{
        data: en ? "01" : "02",
        type: "byte"
    }]

    serverData.weather.isRaining = en

    data.functions.directMessage(chatColor.gray(`Weather set to ${chatColor.gold(set)}`) + chatColor.gray("."))
    data.functions.broadcastPacket(createPacket("46", arr))
}