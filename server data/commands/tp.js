const createPacket = require("../../scripts/createPacket"),
    chatColor = require('../../scripts/chatColor'),
    playerManager = require("../../scripts/playerManager")

module.exports.data = {
    name: "/tp",
    description: "Teleport you to a player or coordinates.",
    usage: "/tp {username|xpos} {ypos} {zpos}",
    op: true
}

module.exports.execute = (data) => {
    const args = data.arguments

    if (parseFloat(args[0]).toString() == args[0]) {
        var x = parseFloat(args[0]) || 0,
            y = (parseFloat(args[1]) || 0) + 1.6,
            z = parseFloat(args[2]) || 0

        data.functions.directMessage(chatColor.gray(`Teleporting you to ${chatColor.gold(`${x} ${y} ${z}`)}`))

        data.user.connection.socket.write(createPacket('0b', [{
            data: x,
            type: "double"
        }, {
            data: y,
            type: "double"
        }, {
            data: y,
            type: "double"
        }, {
            data: z,
            type: "double"
        }, {
            data: false,
            type: "boolean"
        }]))
    } else {
        const username = args[0]
        if (!username || username.length == 0)
            return data.functions.directMessage(chatColor.red(`A username is required for this command!`))
        if (!playerManager.playerExists(username))
            return data.functions.directMessage(chatColor.red(`${username} is not an online player!`))

        const player = playerManager.getPlayer(username)

        data.user.connection.socket.write(createPacket('0b', [{
            data: player.position.x,
            type: "double"
        }, {
            data: player.position.stance,
            type: "double"
        }, {
            data: player.position.y,
            type: "double"
        }, {
            data: player.position.z,
            type: "double"
        }, {
            data: false,
            type: "boolean"
        }]))

        data.functions.directMessage(chatColor.gray(`Teleporting you to ${chatColor.gold(username)}`))
    }
}