const fs = require('fs')

module.exports.data = {
    name: "/help",
    description: "List all commands, or get help with a specific command.",
    usage: "/help {optional command}"
}

const commands = getCommands()

module.exports.execute = (data) => {
    var commandName = data.arguments[0] || ""

    if (commandName.length == 0) {
        data.functions.directMessage(data.user.connection, `=== Commands List ===`)
        data.functions.directMessage(data.user.connection, commands.aliases.join(", "))
    } else {
        const c = commands[commandName]
        if (typeof c != "undefined") {
            data.functions.directMessage(data.user.connection, `=== Command Help ===`)
            data.functions.directMessage(data.user.connection, `Command Alias: §6/${c.alias}`)
            if (c.usage) data.functions.directMessage(data.user.connection, `Usage: §6${c.usage}`)
            if (c.desc) data.functions.directMessage(data.user.connection, `Description: §6${c.desc}`)
            if (c.op) data.functions.directMessage(data.user.connection, `§4TRUSTED only!`)
        } else data.functions.directMessage(data.user.connection, `Unknown command.`)
    }
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
    })
    return commands
}