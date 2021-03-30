const chalk = require('chalk'),
    stripAnsi = require('strip-ansi'),
    {
        clear
    } = require('console'),
    os = require('os'),
    osutils = require('os-utils'),
    tty = require('tty'),
    fs = require('fs')

var keypress = require('keypress')

const filename = "./server data/logs/" + safeTimestamp() + ".txt"

const {
    config
} = require('process')
const {
    isArray
} = require('util')

var fullLog = []
var chatLog = []

var cursor = {
    position: {
        x: 0,
        y: 0
    },
    visible: false,
    hide: () => {
        process.stderr.write('\x1B[?25l')
        cursor.visible = false
    },
    show: () => {
        process.stderr.write('\x1B[?25h')
        cursor.visible = true
    }
}

function setCursorPosition(x, y) {
    x = x + 1
    y = y + 1

    cursor.position.x = x
    cursor.position.y = y

    process.stdout.write("\033" + `[${y};${x}H`)
    process.stdout.write("\033" + `[${y};${x}f`)

}

async function drawBar(x, y, width, value, max) {
    setCursorPosition(x, y)

    var per = value / max,
        minWidth = per * width

    for (var i = 0; i < width; i++) {
        if (i <= minWidth) process.stdout.write("█")
        else process.stdout.write("▒")
    }
}

async function drawScrollBar(x, y, width, height, scroll, max, inverted) {
    const no = "▒",
        yes = "██████"

    const splittop = "▄",
        splitbot = "▀"

    inverted = inverted || true

    if (inverted) scroll = max - scroll

    var activate = Math.floor((scroll / max) * height)

    for (var i = 0; i < height; i++) {
        var str = "░"
        if (i == activate) str = "█"

        drawText(x, y + i, str)
    }
}

async function clearArea(x, y, width, height) {
    const w = blankLine.substr(0, width - 2)
    // setCursorPosition(x,y)

    for (var i = 0; i <= (height - y); i++) {
        // setCursorPosition(x,y+i)
        drawText(x, y + i, "║" + w + "║")
    }
}

async function drawText(x, y, string) {
    string = string.toString() || "undefined"

    setCursorPosition(x, y)
    process.stdout.write(string)
}

var started = false

var consoleInput = []
var chatlogScroll = 0

function start(broadcast) {
    if (started) return

    chat.broadcast = broadcast

    // chatLog = []
    renderLines()
    drawOverlay()
    cursor.hide()

    setInterval(interval, 50)
    blinkingCursor()

    keypress(process.stdin);

    // listen for the "keypress" event
    process.stdin.on('keypress', function (ch, key) {
        var typedChar = false
        if (key && key.ctrl && key.name == 'c') {
            process.exit();
        } else {
            if (key) {
                // Increase/decrease the chat log scroll position.
                if (key.name == "up") chatlogScroll++
                if (key.name == "down") chatlogScroll--

                // Clamp the chat log scroll position between zero and some weird height calculation.
                chatlogScroll = Math.max(0, Math.min(chatlogScroll, chatLog.length - Math.ceil(process.stdout.rows / 2) + 3))
                drawChatLog()
            }

            // If the key is RETURN or ENTER and there is input, send the chat message.
            if (key && (key.name == "return" || key.name == "enter") && consoleInput.length > 0) {
                serverChat(consoleInput.join(''))
                consoleInput = []
                chatlogScroll = 0
                fullLog.push(consoleInput.join(''))

                drawText(2, process.stdout.rows - 2, blankLine.substr(0, process.stdout.columns - 2))
                drawChatLog()
            } else if (key && (key.sequence == "\b" || key.name == "backspace"))
                // If backspace is pressed, remove the last character
                consoleInput.pop(), typedChar = true
            else if (ch && ch.replace(/[\r\n]/, "").length > 0)
                // If a character is typed, add it to the array.
                consoleInput.push(ch), typedChar = true
        }

        if (typedChar) {
            // If a character has been typed, pad the end with space characters.
            const mes = consoleInput.join('').toString().replace("\r\n", "")
            var spacer = blankLine.substr(0, (process.stdout.columns - mes.length) - 4)

            // Make sure the blinking cursor is enabled
            blinkOn = true
            blink = "_"

            // Draw the message, blinking cursor, and spacing.
            drawText(2, process.stdout.rows - 2, mes + blink + spacer || "Type to chat.")
        }
    })

    process.stdin.setRawMode(true)
    process.stdin.resume()

    console.warn("NOTICE: logs are only saved if the server exits gracefully!")

    started = true
}

const decodePacket = require("./decodePacket")

var checkCommand
async function serverChat(message) {
    const serverConnection = {
        isServer: true,
        socket: {
            id: "SERVER",
            username: "§bServer§r",
            write: (packet) => {
                const mes = decodePacket(packet, packet).data.text
                console.log(mes)
                // module.exports.chat.logChat(mes)
            }
        }
    }

    drawOverlay(true)

    if (checkCommand(serverConnection, message))
        return

    chat.broadcast(configuration.serverPrefix + message)
}

chat = {
    broadcast: null
}

function drawOverlay(noclear) {

    // Set the console title.
    process.stdout.write(String.fromCharCode(27) + "]0;" + "NodeCraft Server" + String.fromCharCode(7))

    // Draw various UI elements that only have to be drawn once.
    if (!noclear) {
        const width = process.stdout.columns - Math.ceil(process.stdout.columns / 2)
        clearArea(0, 1, Math.ceil(process.stdout.columns / 2), Math.ceil(process.stdout.rows / 2) - 1)
        clearArea(Math.ceil(process.stdout.columns / 2), 1, width, Math.ceil(process.stdout.rows / 2) - 1)
        clearArea(0, Math.ceil(process.stdout.rows / 2), process.stdout.columns, process.stdout.rows - 1)
    }

    const rightWall = process.stdout.columns

    drawLine(0, 0, process.stdout.columns, true)
    drawText(2, 0, " Server Information ")
    drawLine(0, Math.ceil(process.stdout.rows / 2) - 1, process.stdout.columns, true)
    drawText(2, Math.ceil(process.stdout.rows / 2) - 1, " Chat Log ")
    drawText(0, 0, "╔")
    drawText(rightWall, 0, "╗")
    drawText(0, Math.ceil(process.stdout.rows / 2) - 1, "╠")
    drawText(rightWall, Math.ceil(process.stdout.rows / 2) - 1, "╣")
    drawText(Math.ceil(process.stdout.columns / 2) - 1, 0, "╦╦")
    drawText(Math.ceil(process.stdout.columns / 2) - 1, Math.ceil(process.stdout.rows / 2) - 1, "╩╩")
    drawLine(0, process.stdout.rows, process.stdout.columns, true)
    drawText(0, process.stdout.rows, "╚")
    drawText(rightWall, process.stdout.rows, "╝")
}

process.stdout.on('resize', () => {

    applySettings()
    renderLines()

    // Clear the console
    console.clear()

    // Redraw UI elements.
    drawOverlay()

    // Redraw chat log
    drawChatLog()
})

async function interval() {
    // Fixed interval function the UI is updated at.

    osutils.cpuUsage(function (v) {
        cpuUsage = v
    })

    drawInfo()
    // drawChatLog()
    drawScrollBar(process.stdout.columns - 1, Math.ceil((process.stdout.rows / 2)), 1, (process.stdout.rows / 2) - 2, chatlogScroll, Math.max(0, chatLog.length - Math.ceil(process.stdout.rows / 2) + 3))

    drawText(1, process.stdout.rows - 2, ">")
    var str = consoleInput.join('') + blink
    drawText(2, process.stdout.rows - 2, str)
}

var blinkOn = true
var blink = "_"

function blinkingCursor() {
    // Toggle the blinking cursor every 0.5 seconds.

    blink = blinkOn ? "_" : " "

    blinkOn = !blinkOn
    setTimeout(blinkingCursor, 500)
}

async function applySettings() {
    // Apply logging settings
    if (cursor.visible) cursor.show()
    else cursor.hide()
}

var lastCheck = Date.now()
var lastticks = 0
var tps = 0
var totalTps = 0
var checks = 0
var cpuUsage = 0
async function drawInfo() {
    const ram = process.memoryUsage()

    const quarter = Math.ceil(process.stdout.columns / 4)

    drawText(1, 1, "CPU Usage")
    drawBar(1, 2, quarter, cpuUsage, 100)
    drawText(quarter + 2, 2, `${Math.ceil(cpuUsage * 100) / 100}%   `)

    drawText(1, 4, "RAM Heap Usage")
    drawBar(1, 5, quarter, ram.heapUsed, ram.heapTotal)
    drawText(quarter + 2, 5, `${padDecimal(Math.ceil((ram.heapUsed / 1048576) * 100) / 100, 2, 0)}/${padDecimal(Math.ceil((ram.heapTotal / 1048576) * 100) / 100, 2, 0)}MB   `)

    // const tick = Date.now() - serverData.lastTick

    if (Date.now() - lastCheck >= 1000) {
        tps = serverData.ticks - lastticks
        lastticks = serverData.ticks
        totalTps += tps
        // avgTPS = Math.round(((avgTPS + tps) / 2) * 100) / 100
        checks++
        lastCheck = Date.now()
    }

    drawText(1, 7, "Ticks Per Second")
    drawBar(1, 8, quarter, tps, 40)
    drawText(quarter + 2, 8, `${tps}tps   `)

    var avgTPS = Math.round((totalTps / checks) * 100) / 100

    drawText(1, 10, "Average TPS")
    drawBar(1, 11, quarter, avgTPS, 40)
    drawText(quarter + 2, 11, `${padDecimal(avgTPS || 0, 2, 0)}tps   `)
}

async function drawChatLog() {
    var halfheight = Math.ceil(process.stdout.rows / 2)
    if (chatLog.length == 0) return
    // drawText(0,halfheight, chatLog.length)
    for (var i = 0; i < halfheight - 3; i++) {
        var color = "white"
        // var str = chalk.white("║")
        var message = blankLine.substr(0, blankLine.length - 2)
        var unformatted = blankLine.substr(0, blankLine.length - 2)

        const index = chatLog.length - halfheight + i + 3 - chatlogScroll
        if (index >= 0)
            if (typeof chatLog[index] != "undefined") {
                const chat = chatLog[index]
                color = chat.color
                message = chat.message
                unformatted = stripAnsi(chat.message)
            }

        drawText(0, halfheight + i, "║" + chalk.keyword(color)(message + blankLine.substr(0, (process.stdout.columns - unformatted.length) - 2)))
    }
}

var maxHorizontalLine = "",
    maxVerticalLine = "",
    blankLine = ""

function renderLines() {
    for (var i = 0; i < process.stdout.columns; i++) {
        maxHorizontalLine = maxHorizontalLine + "═"
        blankLine = blankLine + " "
    }
}

function drawLine(startX, startY, length, isHorizontal) {
    var endX = process.stdout.columns,
        endY = process.stdout.rows

    isHorizontal = isHorizontal || false

    setCursorPosition(startX, startY)

    if (isHorizontal) {
        var l = maxHorizontalLine.substr(0, length)
        process.stdout.write(l)
    } else {
        // var l = maxVerticalLine.substr(0,length)
        for (var i = startY; i < endY; i++) {
            setCursorPosition(startX, i)
            process.stdout.write("║")
        }
    }
}

module.exports.start = start
module.exports.drawing = {
    "cursor": cursor,
    "drawBar": drawBar
}
module.exports.chat = {
    logChat: async (message, color, appended) => {
        if (message.toString().replace(/[\r\n]/g, "").length == 0) return

        if (!appended)
            message = timestamp() + " " + message.toString()

        fullLog.push(message)
        divideMessage(message).forEach(m => {
            chatLog.push({
                message: m.toString(),
                color: color
            })
        })

        if (chatlogScroll != 0) chatlogScroll++

        drawChatLog()
    },
    appendChat: async (append, color, addSpace) => {
        fullLog.pop()
        addSpace = addSpace || false

        var newString = chatLog.pop().message

        if (addSpace) newString = newString + " " + append
        else newString = newString + append

        module.exports.chat.logChat(newString, "gray", true)
    },
    clear: async () => {
        chatLog = []
        drawChatLog()
    }
}
module.exports.setCheckCommand = (funct) => {
    checkCommand = funct
}

console.log = (string) => {
    if (Array.isArray(string)) string = string.join(' ')
    module.exports.chat.logChat(string, "gray")
}
console.warn = (string) => {
    if (Array.isArray(string)) string = string.join(' ')
    module.exports.chat.logChat(string, "yellow")
}
console.error = (string) => {
    if (Array.isArray(string)) string = string.join(' ')
    module.exports.chat.logChat(string, "red")
}
console.append = (string) => {
    if (Array.isArray(string)) string = string.join(' ')
    module.exports.chat.appendChat(string, "gray")
}

function timestamp() {
    const d = new Date().toISOString().
    replace(/T/, ' '). // replace T with a space
    replace(/\..+/, '') // delete the dot and everything after

    return "(" + d + ")"
}

function safeTimestamp() {
    const d = new Date()

    return `${Date.now()} ${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}`
    // return Date.now() + ":" + d.getDate() + "_" + d.getMonth() + "_" + d.getFullYear()
}

function divideMessage(message) {
    var maxWidth = process.stdout.columns - 2

    var arr = []
    message = message.toString()

    // Check if the message is evenly divisible by the console width.
    // (if the message is too long)
    const num = Math.ceil(message.length / maxWidth)

    if (num > 0) {
        // For however many times the message can be divided, divide the message into chunks.
        for (var i = 0; i < num; i++) {
            arr.push(colorLog(message.substr(i * maxWidth, maxWidth).trim()))
        }
    } else arr = [colorLog(message)]

    return arr
}

const code = {
    "§4": chalk.hex("AA0000"),
    "§c": chalk.hex("FF5555"),
    "§6": chalk.hex("FFAA00"),
    "§e": chalk.hex("FFFF55"),
    "§2": chalk.hex("00AA00"),
    "§a": chalk.hex("55FF55"),
    "§b": chalk.hex("55FFFF"),
    "§3": chalk.hex("00AAAA"),
    "§1": chalk.hex("0000AA"),
    "§9": chalk.hex("5555FF"),
    "§d": chalk.hex("FF55FF"),
    "§5": chalk.hex("AA00AA"),
    "§f": chalk.white,
    "§7": chalk.hex("AAAAAA"),
    "§8": chalk.hex("555555"),
    "§0": chalk.black,
    "§r": (n) => {
        return n
    }
}

function colorLog(message) {
    var recomp = ""

    const split = message.split(/[�§]/g)
    recomp = recomp + split.shift()

    split.forEach(m => {
        const funct = code[`§${m[0]}`]
        m = m.substr(1, m.length)
        var n = m

        if (funct) n = funct(m)
        recomp = recomp + n
    })
    return recomp
}

process.on('exit', () => {
    fs.writeFileSync("./server data/logs/" + safeTimestamp() + ".txt", fullLog.join('\r\n'))
    cursor.show()
    // console.clear()
})

function padDecimal(number, length, padding) {
    const parts = number.toString().split(".")
    if (parts.length == 1) parts.push("0")
    while (parts[1].length < length) parts[1] = parts[1] + padding
    return parts.join('.')
}