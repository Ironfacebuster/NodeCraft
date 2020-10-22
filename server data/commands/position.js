const playerManager = require("../../scripts/playerManager"),
    chatColor = require('../../scripts/chatColor')

module.exports.data = {
    name: "/position",
    description: "Show your current position.",
    requireCache: true
}

module.exports.execute = (data) => {
    const pos = playerManager.getPlayer(data.user.connection.username).position
    data.functions.directMessage(data.user.connection, chatColor.gray(`x: ${Math.round(pos.x*100)/100}`))
    data.functions.directMessage(data.user.connection, chatColor.gray(`y: ${Math.round(pos.y*100)/100}`))
    data.functions.directMessage(data.user.connection, chatColor.gray(`z: ${Math.round(pos.z*100)/100}`))
}