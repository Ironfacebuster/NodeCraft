const fs = require('fs')

var worldData = {}

var activePlayers = {}

function addPlayer(username) {
    // console.log()
    if (typeof username != "string" || username.length == 0) return

    if (!activePlayers.hasOwnProperty(username)) {
        if (!fs.existsSync(`${configuration.playerFolder}/${username}.json`)) {
            activePlayers[username] = new Player(username, worldData.spawn)
            savePlayerData(username)
        } else
            activePlayers[username] = Player.fromJSON(JSON.parse(fs.readFileSync(`${configuration.playerFolder}/${username}.json`)))
    }
    return activePlayers[username]
}

function getPlayer(username) {
    if (typeof username != "string" || username.length == 0) return
    
    if (activePlayers.hasOwnProperty(username))
        return activePlayers[username]
    else return addPlayer(username)
}

function playerExists (username) {
    return (typeof activePlayers[username] == "object")
}

function setPlayer(username, key, value) {
    var player = getPlayer(username)
    player[key] = value

    return player
}

function updatePlayer(username, data) {
    var player = getPlayer(username)
    player = data
}

function savePlayerData(username) {
    if (typeof username != "string" || username.length == 0) return
    
    try {
        const player = getPlayer(username)
        fs.writeFile(`${configuration.playerFolder}/${username}.json`, JSON.stringify(player), err => {
            if (err) throw err
        })
    } catch (err) {
        console.log("ERROR saving player data!")
        console.log(err)
    }   
}

function saveOnlinePlayers() {
    const keys = Object.keys(activePlayers)
    keys.forEach(key => {
        savePlayerData(key)
    })
}

function deletePlayer(username) {
    savePlayerData(username)
    delete(activePlayers[username])
}

module.exports.activePlayers = activePlayers

module.exports.addPlayer = addPlayer
module.exports.getPlayer = getPlayer
module.exports.playerExists = playerExists
module.exports.setKey = setPlayer
module.exports.save = savePlayerData
module.exports.updatePlayer = updatePlayer
module.exports.saveOnlinePlayers = saveOnlinePlayers
module.exports.removePlayer = deletePlayer
module.exports.setup = () => {
    worldData = JSON.parse(fs.readFileSync(`${configuration.worldFolder}/worlddata.json`))
}

class Player {
    username = ""
    position = {}
    rotation = {}
    data = {}
    status = {}
    
    constructor(username, spawn) {
        this.username = username
        this.position = spawn.position
        this.rotation = spawn.rotation
        this.data = {
            health: 20,
            status: {
                sneaking: false,
                onFire: false,
                sleeping: false,
                drowning: false
            },
            inventory: {
                slot: 0,
                hotbar: {},
                main: {},
                armor: {},
                crafting: {
                    grid: [],
                    result: {}
                }
            },
            flags: {
                fly: false
            }
        }
        this.status = {
            state: "loading",
            loaded: false
        }
        this.created = Date.now()
    }

    update(player) {
        this.username = player.username
        this.position = player.position
        this.rotation = player.rotation
        this.data = player.data
        this.status = player.status
    }

    setInventorySlot(id, slot, count, itemID) {
        const arr = id.split('.')
        var obj = this.data.inventory

        for (var i = 0; i < arr.length; i++) {
            obj = obj[arr[i]]
        }
        obj[slot] = {
            count: count,
            id: itemID
        }
    }
    getInventorySlot(id, slot) {
        slot = slot || 0
        const arr = id.split('.')
        var obj = this.data.inventory

        for (var i = 0; i < arr.length; i++) {
            obj = obj[arr[i]]
        }

        return obj[slot]
    }

    setKey(key,value) {
        const arr = key.split('.')
        var obj = this

        for (var i = 0; i < arr.length; i++) {
            obj = obj[arr[i]]
        }

        console.log(obj)

        obj = value
    }

    static fromJSON(jsonData) {
        // console.log(jsonData)
        var player = new Player(jsonData.username, {
            position: jsonData.position,
            rotation: jsonData.rotation
        })

        player.data = jsonData.data
        player.status = jsonData.status
        player.created = jsonData.created

        return player
    }
}