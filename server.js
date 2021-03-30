const path = require('path'),
    net = require('net'),
    fs = require('fs'),
    zlib = require('zlib'),
    createPacket = require('./scripts/createPacket.js'),
    sha256 = require('sha256'),
    decodePacket = require('./scripts/decodePacket.js'),
    playerManager = require('./scripts/playerManager.js'),
    logging = require('./scripts/logging'),
    EventEmitter = require('events').EventEmitter,
    { PacketManager, Chunk, Block } = require("./scripts/serverClasses")

const setup = require("./scripts/setup")

setup()

const packetManager = new PacketManager

var emitter = new EventEmitter()

var commands = {}

console.log("Starting server...")
configuration = loadconfig()

// An object containing all the currently connected players (keyed by their username)
// This might need to be changed later
connections = {}

// This should be saved and loaded from the world file.
serverData = {
    time: 0,
    days: 0,
    ticks: 0,
    lastTick: Date.now(),
    lastTimeUpdate: Date.now(),
    weather: {
        isRaining: false
    }
}

const server = net.createServer(),
    anticheat = require("./scripts/antiCheat.js")

function loadconfig() {
    logging.setCheckCommand(checkCommand)
    emitter.removeAllListeners()
    // console.log("=========================")
    console.log("Loading server.properties...")
    const prop = fs.readFileSync('./server.properties').toString()
    let txt = prop.split(/[\r\n]/g)
    let conf = {}

    txt.forEach(c => {
        if (c[0] == "#") return
        if (c.length < 3) return
        const dat = c.split('=')

        var finalData

        switch (dat[1]) {
            case "true":
                finalData = true
                break
            case "false":
                finalData = false
                break
            default:
                finalData = dat[1]
        }

        conf[dat[0]] = finalData
    })

    conf.nolog = conf.nolog.split(/,/g)
    conf.trusted = JSON.parse(fs.readFileSync(conf.trusts).toString())

    console.log("Setting configuration...")
    configuration = conf

    console.log("Updating PlayerManager...")
    playerManager.setup()

    console.log("=========================")

    const setupData = {
        functions: {
            broadcastMessage: broadcastMessage,
            sendPacket: sendPacket,
            broadcastPacket: broadcastPacket
        },
        server: emitter
    }

    console.log("Loading commands...")
    commands = {}
    fs.readdirSync(conf.commands).forEach(filename => {
        try {
            console.log(`${filename}...`)

            const command = require(`${conf.commands}/${filename}`)

            if (!command.hasOwnProperty("data")) throw new Error("Command does not have data in exports!")
            if (!command.data.hasOwnProperty("name")) throw new Error("Command does not have name in data!")

            command.data.op = command.data.op || false
            command.data.requireSetup = command.data.requireSetup || false
            command.data.requireCache = command.data.requireCache || false

            commands[command.data.name] = command

            if (command.data.requireSetup)
                commands[command.data.name].setup(setupData)

            if (!command.data.requireCache)
                delete require.cache[path.join(__dirname, `${conf.commands}/${filename}`)]
            else console.append("Cached...")

            console.append("Done")


        } catch (err) {
            console.error(`Error loading ${filename}`)
            console.log(err)
        }
    })

    console.log("=========================")

    console.log("Done!")

    logging.start(broadcastMessage)

    return conf
}

function logBuffer(buffer, skipID) {
    const buf = buffer.toString('hex')
    var s = ""
    for (var i = skipID ? 2 : 0; i < buf.length; i += 2) {
        s = s + buf.substr(i, 2) + " "
    }
    // console.log(s)
}

server.listen(configuration.port, function () {
    console.log(`Server listening for connection requests on port: ${configuration.port}`);
})

server.on('connection', function (socket) {
    socket.id = sha256(`${(Math.random() * 15)}#${Math.random() * 1000}`)
    socket.created = Date.now()
    console.log(`New connection (ID: ${socket.id})`)

    socket.on('data', function (packet) {

        const packetArray = splitPacket(packet, "ffff")

        packetArray.forEach(p => {
            const decoded = decodePacket(p, packet)
            const packetID = decoded.id

            if (configuration.logid && configuration.nolog.indexOf(packetID) == -1) console.log("incoming packet id:", packetID)
            if (configuration.logpackets && configuration.nolog.indexOf(packetID) == -1) logBuffer(p)

            try {
                handlePacket(socket, p, packetID, decoded)
            } catch (err) {
                console.error("ERROR handling packet!")
                throw err
            }
        })
    })

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('end', function () {
        delete (connections[socket.id])
        playerManager.removePlayer(socket.username)

        if (socket.username && socket.destroyed == false)
            broadcastMessage(`§e${socket.username} has left.`)
        console.log(`Closing connection with socket (ID: ${socket.id})`)
    })

    // Don't forget to catch error, for your own sake.
    socket.on('error', function (err) {
        if (socket.username && socket.destroyed == false)
            broadcastMessage(`§e${socket.username} has left.`)

        console.error(err)
    })
})

function splitPacket(packet, seperator) {
    var buffArray = []
    var seperator = seperator.toString(16)

    const splitPacket = packet.toString('hex').split(seperator)
    // console.log(splitPacket)
    splitPacket.forEach(p => {
        if ((p.slice(0, 2) == "ff" || p.slice(0, 2) == "00") && splitPacket.length > 1)
            buffArray.push(Buffer.from("69" + seperator + p, 'hex'))
        else
            buffArray.push(Buffer.from(p, 'hex'))
    })

    // return buffArray
    return [packet]
}

function handlePacket(socket, packet, packetID, decoded) {
    // const arr = packet.toString().split('')
    if (packetID == '0x00') {
        // Keep Alive
        // Apparently sends out a "keep alive" ID

        // Byte 2 seems to be the position update packet ID (0x0b)
        // It sometimes sends what seems to be a position update. (x:8.5 y:52.998404178607224 stance:54.618404183375596 z:8.5 onground:false)

        const player = playerManager.getPlayer(socket.username)

        if (player && player.status.state == "loading") {

            const array = [{
                data: player.position.x,
                type: "double"
            }, {
                data: Math.max(1.6, player.position.y),
                type: "double"
            }, {
                data: Math.max(0, player.position.stance),
                type: "double"
            }, {
                data: player.position.z,
                type: "double"
            }, {
                data: player.position.onground,
                type: "boolean"
            }]

            const newpacket = createPacket("0b", array)

            const id = packet.toString()
            // "keepaliveid" doesn't really seem like an ID.
            connections[socket.id].keepaliveid = id
            connections[socket.id].ready = true

            player.status = {
                state: "loaded",
                loaded: true
            }

            packetManager.queuePacket(socket.id, packet)
            // socket.write(packet)
            packetManager.queuePacket(socket.id, Buffer.from(fs.readFileSync(configuration.worldFolder + "/tempchunk.txt").toString(), "hex"))
            // socket.write(Buffer.from(fs.readFileSync(configuration.worldFolder + "/tempchunk.txt").toString(), "hex"))
            packetManager.queuePacket(socket.id, newpacket)
            // socket.write(newpacket)
        }
        // player.update(player)

    } else if (packetID == '0x01') {
        // LOGIN packet?
        // Packet ID 0x01 is sent AFTER 0x02.

        // const login = decodePacket(packet)
        const username = decoded.data.username

        connections[socket.id] = {
            username: username,
            socket: socket,
            ready: false
        }


        var player = playerManager.getPlayer(username)

        player.status = {
            state: "loading",
            loaded: false
        }

        socket.username = username

        const packet01response = Buffer.from(fs.readFileSync(configuration.worldFolder + "/packet01response.txt").toString(), "hex")

        packetManager.queuePacket(socket.id, packet01response)
        broadcastMessage(`§e${socket.username} has joined.`)
        emitter.emit("join", playerManager.getPlayer(username))

        packetManager.queuePacket(socket.id, createPacket("04", [{
            data: serverData.time,
            type: "long"
        }]))
    } else if (packetID == '0x02') {
        // LOGIN packet?
        // Sending what seems to be identical data back works.

        const username = decoded.data.username

        // console.log("Packet ID 0x02:",string)
        // The client sends its USERNAME. This could be the login packet.

        // If the playerdata doesn't exist, create it.
        if (username != null) {
            playerManager.getPlayer(username)
            broadcastMessage(`§e${username} has joined.`)
            emitter.emit("join", playerManager.getPlayer(username))
        }

        packetManager.addEndpoint(socket.id, socket)

        // no idea what this means. just sending data the official server sends.
        const array = [{
            data: "-",
            type: "string"
        }]

        const p = createPacket("02", array)

        packetManager.queuePacket(socket.id, p)
    } else if (packetID == '0x03') {
        // CHAT packet

        const content = decoded.data.text
        const message = `${socket.username}${configuration.userSuffix}${content}`

        const res = checkCommand(connections[socket.id], content)

        if (!res) {
            broadcastMessage(message)
            emitter.emit("chat", playerManager.getPlayer(socket.username))
        }
    } else if (packetID == "0x0b") {
        // POSITION UPDATE packet

        var player = playerManager.getPlayer(socket.username)
        player.position = decoded.data.position

    } else if (packetID == "0x0c") {
        // ROTATION UPDATE packet

        var player = playerManager.getPlayer(socket.username)
        player.rotation = decoded.data.rotation

    } else if (packetID == "0x0d") {
        // POSITION & ROTATION UPDATE packet

        var player = playerManager.getPlayer(socket.username)

        player.position = decoded.data.position
        player.rotation = decoded.data.rotation

    } else if (packetID == "0x10") {
        const data = decoded.data

        playerManager.getPlayer(socket.username).data.inventory.slot = data.slot
    } else if (packetID == "0xff") {
        // LOGOUT packet
        // packetManager.removeEndpoint(socket.id)
        var player = playerManager.getPlayer(socket.username)

        emitter.emit("leave", player)

        player.status = {
            state: "left",
            loaded: false
        }


        if (socket.username)
            broadcastMessage(`§e${socket.username} has left.`)

        connections[socket.id].nochat = true
        connections[socket.id].socket.destroyed = true
    }

    if (configuration.useAntiCheat) anticheat(socket)
}

function serverTick() {
    const currentTime = Date.now()
    // var offset = (currentTime - serverData.lastTick) - 53

    if (currentTime - serverData.lastTick >= 250) console.warn("WARNING: Abnormal tick (over 0.25 seconds)")
    if (currentTime - serverData.lastTick >= 5000) console.warn("ALERT: Last tick was over five seconds ago! You should probably figure out what's making it lag!")
    if (currentTime - serverData.lastTimeUpdate >= 1000) {
        const keys = Object.keys(connections)

        const packet = createPacket("04", [{
            data: serverData.time,
            type: "long"
        }])

        keys.forEach(key => {
            let conn = connections[key]

            if (playerManager.getPlayer(conn.socket.username).status.loaded)
                conn.socket.write(packet)
        })

        serverData.lastTimeUpdate = currentTime
    }

    serverData.time++

    if (serverData.time >= 24000) {
        serverData.days++
        serverData.time = 0
    }

    serverData.ticks++
    serverData.lastTick = currentTime

    packetManager.distributePackets()

    setTimeout(serverTick, 50)
    // setTimeout(serverTick, 50 - (offset + 5))
}

// chat height is 20 rows.
async function broadcastMessage(message) {
    var messages = divideMessage(message)

    messages.forEach(m => {
        const array = [{
            data: m.toString(),
            type: "string"
        }]

        const packet = createPacket("03", array)

        const keys = Object.keys(connections)

        keys.forEach(key => {
            let conn = connections[key]
            if (conn.socket.destroyed == false) {
                packetManager.queuePacket(conn.socket.id, packet)
            }
            // conn.socket.write(packet)
        })

        logging.chat.logChat(m, "white")
    })
}

// chat height is 20 rows.
async function directMessage(connection, message, isCommand) {
    isCommand = isCommand || false
    var messages = divideMessage(message)

    messages.forEach(m => {
        const array = [{
            data: m.toString(),
            type: "string"
        }]

        const packet = createPacket("03", array)

        packetManager.queuePacket(connection.socket.id, packet)
        // connection.socket.write(packet)

        if (!isCommand)
            logging.chat.logChat(m, "white")
    })
}

// function copied from logging.js
function divideMessage(message) {
    var maxWidth = 119

    var arr = []
    message = message.toString()

    const num = Math.ceil(message.length / maxWidth)

    if (num > 0) {
        // For however many times the message can be divided, divide the message into chunks.
        for (var i = 0; i < num; i++) {
            arr.push(message.substr(i * maxWidth, maxWidth).trim())
        }
    } else arr = [message]

    return arr
}

function sendPacket(username, buffer) {
    Object.keys(connections).forEach(key => {
        if (connections[key].socket.username == username)
            packetManager.queuePacket(connections[key].socket.id, buffer)
        // connections[key].socket.write(buffer)
    })
}

function broadcastPacket(buffer) {
    Object.keys(connections).forEach(key => {
        packetManager.queuePacket(connections[key].socket.id, buffer)
        // connections[key].socket.write(buffer)
    })
}

const keep = ['\x00', '\x00', '\x00', '\x00', '\x00',
    '\x00', '\x00', '\x00', '\x00', '\x00',
    '\x00', '\x00', '\x00', '\x00', '\x00',
    '\x00', '\x00', '\x00', '\x00', '\x00',
    "\x00", '\x00', '\x00', '\x00', '\x00',
    '\x00', '\x00', '\x00', '\x00', '\x00',
    '\x00', '\x00', '\x00', '\x00'
]

function keepAlive() {
    const keys = Object.keys(connections)

    const arr = [{
        data: serverData.time,
        type: "long"
    }]

    const packet = createPacket("04", arr)

    keys.forEach(key => {
        let conn = connections[key]
        // console.log(conn.keepaliveid.split(''))
        conn.socket.write(keep.join(''))
        conn.socket.write(packet)
    })
}

function checkCommand(connection, message) {
    if (!configuration.allowCommands) return false
    if (message[0] != "/") return false

    const args = message.split(' ')
    const command = args.shift()

    if (connection.id == "SERVER") packetManager.addEndpoint("SERVER", connection)

    const data = {
        command: command,
        arguments: args,
        user: {
            username: connection.socket.username,
            connection: connection
        },
        player: playerManager.getPlayer(connection.socket.username),
        functions: {
            directMessage: (message) => {
                directMessage(connection, message, true)
            },
            broadcastMessage: broadcastMessage,
            sendPacket: sendPacket,
            broadcastPacket: broadcastPacket,
            reload: () => {
                configuration = loadconfig()
            }
        },
        server: emitter,
        connections: connections
    }

    console.log(`${connection.socket.username.trim()} executed ${message}`)
    if (commands.hasOwnProperty(command)) {
        const c = commands[command]

        const op = c.data.op || false

        if (op && !isTrusted(connection))
            directMessage(connection, "§cYou're not a trusted player!", true)
        else {
            try {
                c.execute(data)
            } catch (err) {
                directMessage(connection, `§cError executing command ${command}. Check console for details.`, true)
                console.error(`Error while executing command ${command}`)
                throw err
            }
        }
    } else directMessage(connection, "Command not found.", true)

    return true
}

function isTrusted(connection) {
    if (connection.isServer) return true
    if (!configuration.trusted.hasOwnProperty(connection.username)) return false
    if (configuration.trusted[connection.username].indexOf(connection.socket.remoteAddress) == -1) return false

    else return true
}

const {
    connect
} = require('http2')
const {
    setIntervalAsync,
    clearIntervalAsync
} = require('set-interval-async/dynamic')

setInterval(keepAlive, 10000)
serverTick()
// setInterval(serverTick, 50)

// setIntervalAsync(serverTick, 50)