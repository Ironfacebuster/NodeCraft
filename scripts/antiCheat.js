const createPacket = require("./createPacket"),
    playerManager = require("./playerManager"),
    logging = require('./logging')

var playerChances = {}

function checkMovement(socket) {
    const username = socket.username
    const player = playerManager.getPlayer(username)
    const playerCheck = getPlayerChance(username)

    const timeDifference = Date.now() - playerCheck.lastCheck.movement.time

    const moveDistance = distance2D(player.position, playerCheck.lastCheck.movement.position),
        fallDistance = distance1D(player.position.y, playerCheck.lastCheck.movement.position.y)

    const moveSpeed = moveDistance * (1000 / timeDifference),
        fallSpeed = fallDistance * (1000 / timeDifference)

    // if (moveSpeed >= 10) console.log(`${username} moved ${moveSpeed} m/s in ${timeDifference} ms!`)

    // if (timeDifference < 40) {
    //     playerCheck.hackedClient++

    //     if (playerCheck.hackedClient % 10 == 0) console.log(`${username} is sending packets too fast! (${timeDifference} ms since last packet)`)
    // }

    if ((moveSpeed >= 4.32 && timeDifference <= 45) || moveSpeed >= 5) {
        playerCheck.fastMovement++
        playerCheck.hackedClient++

        // if (playerCheck.fastMovement % 5 == 0) console.log(`${username} moved ${moveSpeed} m/s in ${timeDifference} ms!`)
        if (playerCheck.fastMovement % 5 == 0) console.log(`${username} moved ${moveSpeed} m/s in ${timeDifference} ms!`)
    }

    if (fallSpeed < -85) {
        playerCheck.fastMovement += 2
        playerCheck.hackedClient++

        // if (playerCheck.fastMovement % 4 == 0) console.log(`${username} fell ${fallSpeed} m/s in ${timeDifference} ms!`)
        if (playerCheck.fastMovement % 4 == 0) console.log(`${username} fell ${fallSpeed} m/s in ${timeDifference} ms!`)
    }

    if (player.data.status.sneaking && moveSpeed >= 1.35) {
        playerCheck.fakeCrouch++
        playerCheck.hackedClient++

        // if (playerCheck.fastMovement % 5 == 0) console.log(`${username} is moving too fast to be crouching! (${moveSpeed*(1000/timeDifference)} m/s)`)
        if (playerCheck.fastMovement % 5 == 0) console.log(`${username} is moving too fast to be crouching! (${moveSpeed*(1000/timeDifference)} m/s)`)
    }

    if ((fallSpeed == 0 && !player.position.onground && !player.data.flags.fly) || fallSpeed > 8.6) {
        playerCheck.flying++
        playerCheck.hackedClient++
    }

    playerCheck.lastCheck.movement = {
        time: Date.now(),
        position: player.position
    }

    // console.log(playerCheck)
    updatePlayerChance(playerCheck, socket)
}

function checkBreak(username, breakPosition) {
    const player = playerManager.getPlayer(username)
    const playerCheck = getPlayerChance(username)

    const distance = distance(player.position, breakPosition)


}

function getPlayerChance(username) {
    if (playerChances.hasOwnProperty(username)) return playerChances[username]
    else return addPlayerChance(username)
}

function addPlayerChance(username) {
    const time = Date.now()
    const player = playerManager.getPlayer(username)

    playerChances[username] = {
        hackedClient: 0,
        fastMovement: 0,
        fakeCrouch: 0,
        distanceBreak: 0,
        flying: 0,
        flags: {
            speedhack: false,
            fakecrouch: false,
            reachhack: false,
            flyhacking: false,
            hackedClient: false
        },
        lastCheck: {
            movement: {
                position: player.position,
                time: time
            },
            flying: {
                ms: 0,
                time: time
            },
            break: {
                time: time,
                position: player.position
            },
            update: {
                time: time
            }
        }
    }

    return playerChances[username]
}

function updatePlayerChance(playerCheck, socket) {

    const time = Date.now()
    if (playerCheck.fastMovement >= 10) playerCheck.flags.speedhack = true
    if (playerCheck.fakeCrouch >= 10) playerCheck.flags.fakecrouch = true
    if (playerCheck.flying >= 10) playerCheck.flags.flyhacking = true
    if (playerCheck.hackedClient >= 30) playerCheck.flags.hackedClient = true

    if (playerCheck.flags.speedhack) kickUser(socket, "Moving too fast.")
    else if (playerCheck.flags.fakecrouch) kickUser(socket, "False Crouching.")
    // else if (playerCheck.flags.flyhacking) kickUser(socket, "Flying.")
    else if (playerCheck.flags.hackedClient) kickUser(socket, "Sending packets too quickly.")

    if (time - playerCheck.lastCheck.update.time >= 500) {
        playerCheck.fastMovement = 0
        playerCheck.fakeCrouch = 0
        playerCheck.distanceBreak = 0
        playerCheck.hackedClient = 0
        playerCheck.flying = 0
        playerCheck.lastCheck.update.time = time
        playerCheck.lastCheck.flying.time = time
    }
}

function kickUser(socket, reason) {
    console.log(`Autokick: ${socket.username} (${reason})`)
    const packet = createPacket("ff", [{
        data: "You have been automatically kicked for: " + reason,
        type: "string"
    }])
    socket.write(packet)
    delete(playerChances[socket.username])
    socket.end()
}

// module.exports.checkMovement = checkMovement
module.exports = async (socket) => {
    if (socket.hasOwnProperty("username"))
        checkMovement(socket)
}

function distance3D(pos1, pos2) {
    var xsqr = (pos2.x - pos1.x) * (pos2.x - pos1.x)
    var ysqr = (pos2.y - pos1.y) * (pos2.y - pos1.y)
    var zsqr = (pos2.z - pos1.z) * (pos2.z - pos1.z)
    return Math.sqrt(xsqr + ysqr + zsqr)
}

function distance1D(pos1, pos2) {
    const sign = (pos1 - pos2) >= 0 ? 1 : -1
    // console.log(pos1,pos2,sign)
    var posqr = (pos2 - pos1) * (pos2 - pos1)
    return Math.sqrt(posqr) * sign
}

function distance2D(pos1, pos2) {
    var xsqr = (pos2.x - pos1.x) * (pos2.x - pos1.x)
    var zsqr = (pos2.z - pos1.z) * (pos2.z - pos1.z)
    return Math.sqrt(xsqr + zsqr)
}