const chalk = require('chalk'),
    {
        clear
    } = require('console'),
    os = require('os'),
    osutils = require('os-utils'),
    tty = require('tty')

var keypress = require('keypress')
const {
    config
} = require('process')

var chatLog = []

var cursor = {
    position: {
        x: 0,
        y: 0
    },
    visible: false,
    setPosition: (x, y) => {
        x = x + 1
        y = y + 1

        cursor.position.x = x
        cursor.position.y = y

        process.stdout.write("\033" + `[${y};${x}H`)
        process.stdout.write("\033" + `[${y};${x}f`)

    },
    hide: () => {
        process.stderr.write('\x1B[?25l');
        cursor.visible = false
    },
    show: () => {
        process.stderr.write('\x1B[?25h');
        cursor.visible = true
    }
}

function drawBar(x, y, width, value, max) {
    cursor.setPosition(x, y)

    var per = value / max,
        minWidth = per * width

    for (var i = 0; i < width; i++) {
        if (i <= minWidth) process.stdout.write("█")
        else process.stdout.write("▒")
    }
}

function clearArea(x, y, width, height) {
    const w = blankLine.substr(0, width - 2)
    // cursor.setPosition(x,y)

    for (var i = 0; i < (height - y); i++) {
        // cursor.setPosition(x,y+i)
        drawText(x, y + i, "║" + w + "║")
    }
}

function drawText(x, y, string) {
    string = string.toString() || "undefined"

    cursor.setPosition(x, y)
    process.stdout.write(string)
}

var started = false

var consoleInput = []

function start(broadcast) {
    if (started) return

    chat.broadcast = broadcast

    // chatLog = []
    renderLines()
    drawOverlay()
    cursor.hide()

    setInterval(interval, 250)
    blinkingCursor()

    keypress(process.stdin);

    // listen for the "keypress" event
    process.stdin.on('keypress', function (ch, key) {

        if (key && key.ctrl && key.name == 'c') {
            process.exit();
        } else {

            if (key && (key.name == "return" || key.name == "enter") && consoleInput.length > 0) {
                serverChat(consoleInput.join(''))
                consoleInput = []
            } else if (key && key.sequence == "\b")
                consoleInput.pop()
            else
                consoleInput.push(ch)
        }

        const mes = consoleInput.join('').toString().replace("\r\n", "")
        var spacer = blankLine.substr(0, (process.stdout.columns - mes.length) - 3)

        blinkOn = true
        blink = "█"
        drawText(1, process.stdout.rows, mes + blink + spacer || "Type to chat.")
    });

    process.stdin.setRawMode(true);
    process.stdin.resume();

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

    clearArea(0, 1, Math.round(process.stdout.columns / 2), Math.round(process.stdout.rows / 2) - 1)
    clearArea(Math.round(process.stdout.columns / 2), 1, Math.round(process.stdout.columns / 2), Math.round(process.stdout.rows / 2) - 1)
    clearArea(0, Math.round(process.stdout.rows / 2), process.stdout.columns, process.stdout.rows - 1)
    drawLine(0, 0, process.stdout.columns, true)
    drawText(2, 0, " Server Information ")
    drawLine(0, Math.round(process.stdout.rows / 2) - 1, process.stdout.columns, true)
    drawText(2, Math.round(process.stdout.rows / 2) - 1, " Chat Log ")
    drawText(0, 0, "╔")
    drawText(process.stdout.columns, 0, "╗")
    drawText(0, Math.round(process.stdout.rows / 2) - 1, "╠")
    drawText(process.stdout.columns, Math.round(process.stdout.rows / 2) - 1, "╣")
    drawText(Math.round(process.stdout.columns / 2) - 1, 0, "╦╦")
    drawText(Math.round(process.stdout.columns / 2) - 1, Math.round(process.stdout.rows / 2) - 1, "╩╩")
}

process.stdout.on('resize', () => {
    applySettings()
    renderLines()

    chatLog = []

    console.clear()

    drawOverlay()
})

function interval() {
    // console.clear()

    osutils.cpuUsage(function (v) {
        cpuUsage = v
    })
    // applySettings()
    drawInfo()
    drawChatLog()

    drawText(0, process.stdout.rows, ">")
    var str = consoleInput.join('') + blink
    drawText(1, process.stdout.rows, str)
}

var blinkOn = true
var blink = "█"

function blinkingCursor() {
    blink = blinkOn ? "█" : " "
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

    const quarter = Math.round(process.stdout.columns / 4)

    drawText(1, 1, "CPU Usage")
    drawBar(1, 2, quarter, cpuUsage, 100)
    drawText(quarter + 2, 2, `${Math.round(cpuUsage*100)/100}%   `)

    drawText(1, 4, "RAM Heap")
    drawBar(1, 5, quarter, ram.heapUsed, ram.heapTotal)
    drawText(quarter + 2, 5, `${Math.round((ram.heapUsed / 1048576)*100)/100}/${Math.round((ram.heapTotal / 1048576)*100)/100}MB   `)

    const tick = Date.now() - serverData.lastTick

    if (Date.now() - lastCheck >= 1000) {
        tps = serverData.ticks - lastticks
        lastticks = serverData.ticks
        lastCheck = Date.now()
    }

    drawText(1, 7, "Tick Per Second")
    drawBar(1, 8, quarter, tps, 40)
    drawText(quarter + 2, 8, `${tps}tps (exp. 20tps)   `)
}

async function drawChatLog() {
    const halfheight = Math.round(process.stdout.rows / 2)
    if (chatLog.length == 0) return
    // drawText(0,halfheight, chatLog.length)
    for (var i = 0; i < halfheight; i++) {
        var color = "white"
        // var str = chalk.white("║")
        var message = blankLine.substr(0, blankLine.length - 2)

        const index = chatLog.length - halfheight + i + 2
        if (index >= 0)
            if (typeof chatLog[index] != "undefined") {
                const chat = chatLog[index]
                color = chat.color
                message = chat.message
            }

        drawText(0, halfheight + i, "║" + chalk.keyword(color)(message + blankLine.substr(0, (process.stdout.columns - message.length) - 2)) + "║")
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

    cursor.setPosition(startX, startY)

    if (isHorizontal) {
        var l = maxHorizontalLine.substr(0, length)
        process.stdout.write(l)
    } else {
        // var l = maxVerticalLine.substr(0,length)
        for (var i = startY; i < endY; i++) {
            cursor.setPosition(startX, i)
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
    logChat: async (message, color) => {
        message = message.toString()
        // message = divideMessage(message)
        divideMessage(message).forEach(m => {
            chatLog.push({
                message: m.toString(),
                color: color
            })
        })
    },
    appendChat: async (append, color, addSpace) => {
        addSpace = addSpace || false

        var newString = chatLog.pop().message

        if (addSpace) newString = newString + " " + append
        else newString = newString + append

        module.exports.chat.logChat(newString, "gray")
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

function divideMessage(message) {
    var maxWidth = process.stdout.columns

    var arr = []
    message = message.toString()

    const num = Math.round(message.length / maxWidth)

    if (num > 0) {
        for (var i = 0; i < num; i++) {
            arr.push(message.substr(i * maxWidth, maxWidth))
        }
    } else arr = [message]

    return arr
}

process.on('beforeexit', () => {
    console.clear()
})