const fs = require('fs'),
    chatColor = require('../../scripts/chatColor')
const {
    start
} = require('repl')

module.exports.data = {
    name: "/help",
    description: "List all commands, or get help with a specific command.",
    usage: "/help {optional command}"
}

const commands = getCommands()
const totalPages = Math.ceil(commands.aliases.length / 19)

module.exports.execute = (data) => {
    var commandName = data.arguments[0] || ""

    if (parseInt(commandName) == commandName || commandName.length == 0) {
        // console.log(getList())
        var page = Math.max(1, Math.min(parseInt(commandName), totalPages)) || 1

        // data.functions.directMessage(chatColor.gray(`=== Commands List (Page ${page}/${totalPages}) ===`))

        // var list = getList(page)
        // list.forEach(c => {
        // data.functions.directMessage(c)
        // })

        data.functions.directMessage(chatColor.gray(`=== Commands List ===`))
        data.functions.directMessage(commands.aliases.join(", "))
    } else {
        const c = commands[commandName]
        if (typeof c != "undefined") {
            data.functions.directMessage(`=== Command Help ===`)
            data.functions.directMessage(`Command Alias: §6/${c.alias}`)
            if (c.usage) data.functions.directMessage(`Usage: §6${c.usage}`)
            if (c.desc) data.functions.directMessage(`Description: §6${c.desc}`)
            if (c.op) data.functions.directMessage(`§4TRUSTED only!`)
        } else data.functions.directMessage(`Unknown command.`)
    }
}

function getList(page) {
    const l = commands.aliases.length,
        maxLength = 19

    const startNum = (page - 1) * maxLength,
        endNum = Math.min(l, page * maxLength)

    // console.log(startNum, endNum)

    var list = []

    for (var i = startNum; i < endNum; i++) {
        list.push(commands.aliases[i])
    }

    return list
    // console.log(maxLength)
}

function getCommands() {
    var commands = {
        aliases: []
    }
    fs.readdirSync(configuration.commands).forEach(filename => {
        const command = require(`./${filename}`)
        commands[command.data.name.substr(1, command.data.name.length)] = {
            alias: command.data.name.substr(1, command.data.name.length)
        }
        const thiscommand = commands[command.data.name.substr(1, command.data.name.length)]
        if (command.data.usage) thiscommand.usage = command.data.usage
        if (command.data.description) thiscommand.desc = command.data.description
        if (command.data.op && command.data.op == true) thiscommand.op = true

        commands.aliases.push(thiscommand.alias)
        // commands.examples.push()
    })
    return commands
}