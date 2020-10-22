const playerManager = require("../../scripts/playerManager"),
    chatColor = require('../../scripts/chatColor'),
    fs = require('fs')

module.exports.data = {
    name: "/untrust",
    description: "Remove a user from the TRUSTED list.",
    usage: "/untrust {username}",
    op: true
}

module.exports.execute = (data) => {
    const connection = data.user.connection,
        username = data.arguments[0]

    if (!username || username.length == 0)
        return data.functions.directMessage(connection, chatColor.red(`A username is required for this command!`))
    if (!configuration.trusted.hasOwnProperty(username))
        return data.functions.directMessage(connection, chatColor.red(`${username} is not a trusted player!`))

    delete(configuration.trusted[username])

    fs.writeFile(configuration.trusts, JSON.stringify(configuration.trusted), () => {
        data.functions.directMessage(connection, `${username} has been untrusted.`)
    })
}