chatColor = require('../../scripts/chatColor')

// REQUIRED
module.exports.data = {
    name: "/temp",
    // The name/alias of the command. NOTE: filename does not have to be the same as the name.
    // REQUIRED
    description: "A temporary command file.",
    // Description of the command
    // DEFAULTS to "No description."
    op: true,
    // Require a user to be OP (trusted). (not very secure, since you can't verify usernames anymore)
    // DEFAULTS to FALSE
    requireSetup: true,
    // Require this command to be setup on load.
    // DEFAULTS to FALSE
    requireCache: false
    // Require this command to be cached. Caching can allow faster reloads, if you have many commands.
    // Any changes to the file if cached, post startup, will require a full restart.
    // DEFAULTS to FALSE
    // NOTE that even with caching disabled, you may have to reload multiple times.
}

// REQUIRED
module.exports.execute = (data) => {
    data.functions.directMessage(data.user.connection, `${chatColor.aqua("Temp command.")}`)
    data.functions.directMessage(data.user.connection, "This command is for testing server events.")
}

var randomValue = 0

module.exports.setup = (data) => {
    data.server.on('join', (user) => {
        // data.functions.broadcastMessage(`${user.username} has joined!`)
    })
    data.server.on('leave', (user) => {
        // data.functions.broadcastMessage(`${user.username} has left!`)
    })
    data.server.on('chat', (user) => {
        // data.functions.broadcastMessage(`${user.username} just said something!`)
    })
}