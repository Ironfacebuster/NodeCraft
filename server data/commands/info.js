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

    data.functions.directMessage(connection, `=== Your Info ===`)
    data.functions.directMessage(connection, chatColor.gray(`Health: ${chatColor.gold(player.data.health)}`))
    data.functions.directMessage(connection, `== Player Position ==`)
    data.functions.directMessage(connection, chatColor.gray(`Position: ${chatColor.gold(`x${position.x} y${position.y} z${position.z}`)}`))
    data.functions.directMessage(connection, chatColor.gray(`Position: ${chatColor.gold(`yaw ${rotation.yaw} pitch ${rotation.pitch}`)}`))

    data.functions.directMessage(connection, `== Player Flags ==`)
    data.functions.directMessage(connection, chatColor.gray(`Flying: ${chatColor.gold(player.data.flags.fly)}`))
}