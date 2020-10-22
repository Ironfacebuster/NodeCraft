const chatColor = require('../../scripts/chatColor'),
    playerManager = require("../../scripts/playerManager")

module.exports.data = {
    name: "/fly",
    description: "Toggle between flying and... not flying...",
    op: true
}

module.exports.execute = (data) => {
    const p = playerManager.getPlayer(data.user.connection.socket.username)

    p.data.flags["fly"] = !p.data.flags["fly"]

    data.functions.directMessage(data.user.connection, chatColor.gray(`Flying is now ${chatColor.gold(p.data.flags["fly"] ? "enabled": "disabled")}.`))
}