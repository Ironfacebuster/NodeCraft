module.exports.data = {
    name: "/trusted",
    description: "List all TRUSTED users.",
    op: true,
    requireCache: true
}

module.exports.execute = (data) => {
    data.functions.directMessage("=== Trusted Users ===")
    data.functions.directMessage(Object.keys(configuration.trusted).join(', '))
}