const createPacket = require("../../scripts/createPacket"),
    chatColor = require('../../scripts/chatColor')

module.exports.data = {
    name: "/time",
    description: "Get or Set the time",
    usage: "/time {set|get} {opt. time}",
    op: true
}

const times = {
    day: 1000,
    night: 13000,
    noon: 6000,
    midday: 6000,
    midnight: 18000,
    sunrise: 23000,
    sunset: 12000
}

module.exports.execute = (data) => {

    var comm = data.arguments[0] || "get"
    var time = data.arguments[1] || 0

    if (comm == "set") {
        if (parseInt(time) == time) {
            // If time is a parseable number  
            sendTime(Math.min(24000, Math.max(0, time)), data)
        } else {
            // If time is a word
            if (!times.hasOwnProperty(time)) return data.functions.directMessage(chatColor.red(`"${time}" is not a valid time!`))

            sendTime(times[time], data)
        }
    } else if (comm == "get") {
        data.functions.directMessage(chatColor.gray(`The time is: ${chatColor.gold(serverData.time)} `) + chatColor.gray(`ticks, day ${chatColor.gold(serverData.days)}`))
    }
}

function sendTime(time, data) {
    serverData.time = time
    const arr = [{
        data: time,
        type: "long"
    }]

    data.functions.broadcastPacket(createPacket("04", arr))
    data.functions.broadcastMessage(chatColor.gray(`${data.user.username} set the time to ${chatColor.gold(time)} ${chatColor.gray("ticks")}`))
}