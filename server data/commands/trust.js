const playerManager = require("../../scripts/playerManager"),
    chatColor = require('../../scripts/chatColor'),
    fs = require('fs')

module.exports.data = {
    name: "/trust",
    description: "Add a user to the TRUSTED list.",
    usage: "/trust {username}",
    op: true
}

module.exports.execute = (data) => {
    const connection = data.user.connection,
        username = data.arguments[0]

    if (!username || username.length == 0)
        return data.functions.directMessage(connection, chatColor.red(`A username is required for this command!`))
    if (!playerManager.playerExists(username))
        return data.functions.directMessage(connection, chatColor.red(`${username} is not an online player!`))

    var keys = Object.keys(data.connections)

    keys.forEach(key => {
        const conn = data.connections[key]
        const ip = conn.socket.remoteAddress

        if (conn.username != username) return
        if (configuration.trusted.hasOwnProperty(username) && configuration.trusted[username].indexOf(ip) >= 0)
            return data.functions.directMessage(connection, chatColor.red(`${username} is already trusted on this IP address!`))

        // configuration.trusted.push(ip)
        if (configuration.trusted.hasOwnProperty(username))
            configuration.trusted[username].push(ip)
        else
            configuration.trusted[username] = [ip]

        fs.writeFile(configuration.trusts, JSON.stringify(configuration.trusted), () => {
            data.functions.directMessage(connection, `${username} is now trusted on their current IP address.`)
        })
    })
}