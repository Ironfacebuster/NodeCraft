chatColor = require('../../scripts/chatColor')

module.exports.data = {
    name: "/broadcast",
    description: "Broadcast a message to all online players.",
    op: true,
    requireCache: true
}

module.exports.execute = (data) => {
    data.functions.broadcastMessage(`* ${chatColor.aqua(data.arguments.join(' '))}`)
}