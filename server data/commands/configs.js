module.exports.data = {
    name: "/configs",
    description: "Show all loaded configuration keys.",
    op: true,
    requireCache: true
}

module.exports.execute = (data) => {
    data.functions.directMessage(data.user.connection, "=== Server Config Keys ===`")
    sendObject(data,configuration)
}

function sendObject(data,object) {
    const keys = Object.keys(object)
    
    keys.forEach(key => {
        var isString = typeof object[key] == "string" ? true : false
        data.functions.directMessage(data.user.connection,`${key}: ${isString ? '"' + object[key] + '"' : object[key]}`)
    })
}