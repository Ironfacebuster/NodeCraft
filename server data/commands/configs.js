module.exports.data = {
    name: "/configs",
    description: "Show all loaded configuration keys.",
    op: true,
    requireCache: false
}

module.exports.execute = (data) => {
    data.functions.directMessage("=== Server Config Keys ===`")
    sendObject(data, configuration)
}

function sendObject(data, object) {
    const keys = Object.keys(object)

    keys.forEach(key => {
        if (typeof object[key] == "object") {
            data.functions.directMessage(`${key}: [${typeof object[key]}]`)
            // sendObject(data, object[key])
        } else {
            var isString = typeof object[key] == "string" ? true : false
            data.functions.directMessage(`${key}: ${isString ? '"' + object[key] + '"' : object[key]}`)
        }
    })
}