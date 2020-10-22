const createPacket = require("../../scripts/createPacket"),
    chatColor = require('../../scripts/chatColor'),
    playerManager = require("../../scripts/playerManager")

module.exports.data = {
    name: "/kick",
    usage: "/kick {username} {opt. reason}",
    op: true
}

module.exports.execute = (data) => {
    const connection = data.user.connection,
        user = data.arguments.shift()

    if (!user || user.length == 0)
        return data.functions.directMessage(connection, chatColor.red(`A username is required for this command!`))
    if (!playerManager.playerExists(user))
        return data.functions.directMessage(data.user.connection, chatColor.red(`${user} is not an online player!`))

    var reason = data.arguments.join(' ')
    if (reason.length == 0) reason = "You have been kicked."

    const arr = [{
        data: reason,
        type: "string"
    }]

    data.functions.sendPacket(user, createPacket("ff", arr))
}