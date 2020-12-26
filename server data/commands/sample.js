chatColor = require('../../scripts/chatColor')

// REQUIRED
module.exports.data = {
    name: "/sample",
    usage: "/sample {ticks} {milliseconds}",
    description: "Sample various aspects of the server.",
    op: true,
    requireCache: false
}

module.exports.execute = (data) => {
    if (data.arguments.length == 0) return

    switch (data.arguments[0].toLowerCase()) {
        case "ticks":
            tpsTimer(data)
    }
}

function tpsTimer(data) {
    const time = data.arguments[1]
    const dm = data.functions.directMessage,
        con = data.user.connection
    var startTicks = serverData.ticks

    if (parseInt(time) != time) return dm(cchatColor.red(`${time} is not a valid number!`))

    dm(chatColor.gray(`Sampling...`))

    setTimeout(() => {
        const diff = chatColor.gold(serverData.ticks - startTicks),
            time = chatColor.gold(data.arguments[1])

        dm(diff + chatColor.gray(` ticks in `) + time + chatColor.gray(` ms.`))
    }, parseInt(data.arguments[1]))
}