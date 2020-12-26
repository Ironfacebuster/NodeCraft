const createPacket = require("../../scripts/createPacket"),
    chatColor = require('../../scripts/chatColor'),
    playerManager = require("../../scripts/playerManager")

module.exports.data = {
    name: "/stop",
    description: "Shut down the server.",
    usage: "/stop",
    op: true
}

module.exports.execute = (data) => {

    data.functions.broadcastMessage(chatColor.gray("Shutting down the server..."))
    data.functions.broadcastPacket(createPacket("ff", [{
        data: "Server shutting down.",
        type: "string"
    }]))

    // save the world
    // save player data?

    setTimeout(() => {
        process.exit(0)
    }, 500)
}