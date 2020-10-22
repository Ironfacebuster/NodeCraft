const chatColor = require('../../scripts/chatColor')

module.exports.data = {
    name: "/reload",
    description: "Reload the server files.",
    op: true,
    requireCache: true
}

module.exports.execute = (data) => {
    const startTime = Date.now()
    data.functions.broadcastMessage("Reloading server files...")
    data.functions.reload()
    data.functions.broadcastMessage("Reload finished. " + chatColor.gray(`(Took ${Date.now()-startTime}ms)`))
    // data.functions.directMessage(data.user.connection, ))
}