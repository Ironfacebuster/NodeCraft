module.exports.data = {
    name: "/trusted",
    description: "List all TRUSTED IP addresses.",
    op: true,
    requireCache: true
}

module.exports.execute = (data) => {
    data.functions.directMessage(data.user.connection, "=== Trusted Users ===`")
    data.functions.directMessage(data.user.connection, Object.keys(configuration.trusted).join(', '))
}