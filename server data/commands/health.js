const createPacket = require("../../scripts/createPacket"),
    chatColor = require('../../scripts/chatColor'),
    playerManager = require("../../scripts/playerManager")

module.exports.data = {
    name: "/health",
    description: "Set a user's health.",
    usage: "/health {username} {amount}",
    op: true
}

module.exports.execute = (data) => {
    const user = data.arguments[0],
        amount = Math.max(0, Math.min(20, parseInt(data.arguments[1]))),
        num2 = Math.max(0, Math.min(20, parseInt(data.arguments[2])))

    if (!user || user.length == 0)
        return data.functions.directMessage(chatColor.red(`A username is required for this command!`))
    if (!playerManager.playerExists(user))
        return data.functions.directMessage(chatColor.red(`${user} is not an online player!`))

    // const arr = [{
    //         data: amount,
    //         type: "ushort"
    //     },
    //     {
    //         data: num2,
    //         type: "ushort"
    //     }
    // ]

    const arr = [{
        data: amount,
        type: "int"
    }]

    data.functions.sendPacket(user, createPacket("08", arr))
}