chatColor = require('../../scripts/chatColor')

// REQUIRED
module.exports.data = {
    // The name/alias of the command. NOTE: filename does not have to be the same as the name.
    // REQUIRED
    name: "/example",
    // Usage example of the command.
    // Does not show if unprovided.
    usage: "/example {random|username}",
    // Description of the command
    // DEFAULTS to "No description."
    description: "An example command file, for templating.",
    // Require a user to be OP (trusted). (not very secure, since you can't verify usernames anymore)
    // DEFAULTS to FALSE
    op: true,
    // Require this command to be setup on load.
    // DEFAULTS to FALSE
    requireSetup: true,
    // Require this command to be cached. Caching can allow faster reloads, if you have many commands.
    // Any changes to the file if cached, post startup, will require a full restart.
    // DEFAULTS to FALSE
    // NOTE that even with caching disabled, you may have to reload multiple times.
    requireCache: false
}

// REQUIRED
module.exports.execute = (data) => {
    // This is the execute function.
    // This function is called when a user runs this command.
    // Do actual command things in here

    // console.log(data)
    // DATA contains various useful things, such as arguments, or functions.
    if (data.arguments.length == 0) data.functions.directMessage(`${chatColor.aqua("Example command.")} Try again with ${chatColor.green("'random'")} or ${chatColor.blue("'username'")} arguments!`)
    else if (data.arguments[0] == "random") data.functions.directMessage(`${chatColor.gold("The following value is randomly generated on load:")} ${randomValue}`)
    else if (data.arguments[0] == "username") data.functions.directMessage(`${chatColor.gray("Your username is:")} ${chatColor.gold(data.player.username)}`)
}

var randomValue = 0

module.exports.setup = () => {
    // This is the setup function
    // This function is called when the command is loaded.

    // do setup things in here.

    randomValue = Math.random()
}