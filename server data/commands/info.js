chatColor = require('../../scripts/chatColor')

module.exports.data = {
    name: "/info",
    description: "Get information about your current session."
}

module.exports.execute = (data) => {
    const connection = data.user.connection
    const player = data.player
    const position = player.position,
        rotation = player.rotation

    data.functions.directMessage(`=== Your Info ===`)
    data.functions.directMessage(chatColor.gray(`Health: ${chatColor.gold(player.data.health)}`))
    data.functions.directMessage(`== Player Position ==`)
    data.functions.directMessage(chatColor.gray(`Position: ${chatColor.gold(`${position.x}x ${position.y}y ${position.z}z`)}`))
    data.functions.directMessage(chatColor.gray(`Position: ${chatColor.gold(`yaw ${rotation.yaw} pitch ${rotation.pitch}`)}`))

    data.functions.directMessage(`== Player Flags ==`)
    data.functions.directMessage(chatColor.gray(`Flying: ${chatColor.gold(player.data.flags.fly)}`))
}