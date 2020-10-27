const chalk = require('chalk'),
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

var fullLog = []
var chatLog = []

var cursor = {
    position: {
        x: 0,
        y: 0
    },
    visible: false,
    hide: () => {
        process.stderr.write('\x1B[?25l');
        cursor.visible = false
    },
    show: () => {
        process.stderr.write('\x1B[?25h');
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

function drawBar(x, y, width, value, max) {
    setCursorPosition(x, y)

    var per = value / max,
        minWidth = per * width

    for (var i = 0; i < width; i++) {
        if (i <= minWidth) process.stdout.write("█")
        else process.stdout.write("▒")
    }
}

function drawScrollBar(x, y, width, height, scroll, max, inverted) {
    const no = "░",
        yes = "██████"

    inverted = inverted || true

    if (inverted) scroll = max - scroll

    var activate = Math.floor((scroll / max) * height)

    for (var i = 0; i < height; i++) {
        var str = "░"
        if (i == activate) str = "█"

        drawText(x, y + i, str)
    }
}

function clearArea(x, y, width, height) {
    const w = blankLine.substr(0, width - 2)
    // setCursorPosition(x,y)

    for (var i = 0; i < (height - y); i++) {
        // setCursorPosition(x,y+i)
        drawText(x, y + i, "║" + w + "║")
    }
}

function drawText(x, y, string) {
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
            // console.log(JSON.stringify(key))
            if (key) {
                if (key.name == "up") chatlogScroll++
                if (key.name == "down") chatlogScroll--
                chatlogScroll = Math.max(0, Math.min(chatlogScroll, chatLog.length - Math.ceil(process.stdout.rows / 2) + 3))
            }
            if (key && (key.name == "return" || key.name == "enter") && consoleInput.length > 0) {
                serverChat(consoleInput.join(''))
                consoleInput = []
                chatlogScroll = 0
                fullLog.push(consoleInput.join(''))

                drawText(2, process.stdout.rows - 2, blankLine.substr(0, process.stdout.columns - 2))
            } else if (key && key.sequence == "\b")
                consoleInput.pop(), typedChar = true
            else if(ch && ch.replace(/[\r\n]/,"").length > 0)
                consoleInput.push(ch), typedChar = true
        }

        if (typedChar) {
            const mes = consoleInput.join('').toString().replace("\r\n", "")
            var spacer = blankLine.substr(0, (process.stdout.columns - mes.length) - 4)

            blinkOn = true
            blink = "_"
            drawText(2, process.stdout.rows - 2, mes + blink + spacer || "Type to chat.")
        }
    });

    process.stdin.setRawMode(true);
    process.stdin.resume();

    console.warn("NOTICE: logs are only saved if the server exits gracefully!")

    started = true
}

function serverChat(message) {
    chat.broadcast(configuration.serverPrefix + message)
}

chat = {
    broadcast: null
}

function drawOverlay() {

    process.stdout.write(String.fromCharCode(27) + "]0;" + "NodeCraft Server" + String.fromCharCode(7))

    clearArea(0, 1, Math.ceil(process.stdout.columns / 2), Math.ceil(process.stdout.rows / 2) - 1)
    clearArea(Math.ceil(process.stdout.columns / 2), 1, Math.ceil(process.stdout.columns / 2) - 1, Math.ceil(process.stdout.rows / 2) - 1)
    clearArea(0, Math.ceil(process.stdout.rows / 2), process.stdout.columns, process.stdout.rows - 1)
    drawLine(0, 0, process.stdout.columns, true)
    drawText(2, 0, " Server Information ")
    drawLine(0, Math.ceil(process.stdout.rows / 2) - 1, process.stdout.columns, true)
    drawText(2, Math.ceil(process.stdout.rows / 2) - 1, " Chat Log ")
    drawText(0, 0, "╔")
    drawText(process.stdout.columns, 0, "╗")
    drawText(0, Math.ceil(process.stdout.rows / 2) - 1, "╠")
    drawText(process.stdout.columns, Math.ceil(process.stdout.rows / 2) - 1, "╣")
    drawText(Math.ceil(process.stdout.columns / 2) - 1, 0, "╦╦")
    drawText(Math.ceil(process.stdout.columns / 2) - 1, Math.ceil(process.stdout.rows / 2) - 1, "╩╩")
    drawLine(0, process.stdout.rows, process.stdout.columns, true)
    drawText(0, process.stdout.rows, "╚")
    drawText(process.stdout.columns, process.stdout.rows, "╝")
}

process.stdout.on('resize', () => {
    applySettings()
    renderLines()

    chatLog = []

    console.clear()

    drawOverlay()
})

async function interval() {
    // console.clear()

    osutils.cpuUsage(function (v) {
        cpuUsage = v
    })
    // applySettings()
    drawInfo()
    drawChatLog()
    drawScrollBar(process.stdout.columns - 1, Math.ceil((process.stdout.rows / 2)), 1, (process.stdout.rows / 2) - 2, chatlogScroll, Math.max(0, chatLog.length - Math.ceil(process.stdout.rows / 2) + 3))

    drawText(1, process.stdout.rows - 2, ">")
    var str = consoleInput.join('') + blink
    drawText(2, process.stdout.rows - 2, str)
}

var blinkOn = true
var blink = "_"

function blinkingCursor() {
    blink = blinkOn ? "_" : " "
    // var str = consoleInput.join('') + blink
    // console.log(blink)

    blinkOn = !blinkOn
    setTimeout(blinkingCursor, 500)
}

async function applySettings() {
    if (cursor.visible) cursor.show()
    else cursor.hide()
}

var lastCheck = Date.now()
var lastticks = 0
var tps = 0
var cpuUsage = 0;
async function drawInfo() {
    const ram = process.memoryUsage()

    const quarter = Math.ceil(process.stdout.columns / 4)

    drawText(1, 1, "CPU Usage")
    drawBar(1, 2, quarter, cpuUsage, 100)
    drawText(quarter + 2, 2, `${Math.ceil(cpuUsage*100)/100}%   `)

    drawText(1, 4, "RAM Heap")
    drawBar(1, 5, quarter, ram.heapUsed, ram.heapTotal)
    drawText(quarter + 2, 5, `${Math.ceil((ram.heapUsed / 1048576)*100)/100}/${Math.ceil((ram.heapTotal / 1048576)*100)/100}MB   `)

    const tick = Date.now() - serverData.lastTick

    if (Date.now() - lastCheck >= 1000) {
        tps = serverData.ticks - lastticks
        lastticks = serverData.ticks
        lastCheck = Date.now()
    }

    drawText(1, 7, "Tick Per Second")
    drawBar(1, 8, quarter, tps, 40)
    drawText(quarter + 2, 8, `${tps}tps`)
}

async function drawChatLog() {
    var halfheight = Math.ceil(process.stdout.rows / 2)
    if (chatLog.length == 0) return
    // drawText(0,halfheight, chatLog.length)
    for (var i = 0; i < halfheight - 3; i++) {
        var color = "white"
        // var str = chalk.white("║")
        var message = blankLine.substr(0, blankLine.length - 2)

        const index = chatLog.length - halfheight + i + 3 - chatlogScroll
        if (index >= 0)
            if (typeof chatLog[index] != "undefined") {
                const chat = chatLog[index]
                color = chat.color
                message = chat.message
            }

        drawText(0, halfheight + i, "║" + chalk.keyword(color)(message + blankLine.substr(0, (process.stdout.columns - message.length) - 2)))
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

    // for (var i = 0; i < process.stdout.rows; i++) {
    //     maxVerticalLine = maxVerticalLine + "║"
    // }
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
        if(message.toString().replace(/[\r\n]/g,"").length == 0) return

        if (!appended)
            message = timestamp() + " " + message.toString()

        fullLog.push(message)
        divideMessage(message).forEach(m => {
            chatLog.push({
                message: m.toString(),
                color: color
            })
        })
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
    }
}

console.log = (string) => {
    module.exports.chat.logChat(string, "gray")
}
console.warn = (string) => {
    module.exports.chat.logChat(string, "yellow")
}
console.error = (string) => {
    module.exports.chat.logChat(string, "red")
}
console.append = (string) => {
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

    const num = Math.ceil(message.length / maxWidth)

    if (num > 0) {
        for (var i = 0; i < num; i++) {
            arr.push(message.substr(i * maxWidth, maxWidth))
        }
    } else arr = [message]

    return arr
}

process.on('exit', () => {
    fs.writeFileSync("./server data/logs/" + safeTimestamp() + ".txt", fullLog.join('\r\n'))
    console.clear()
})