const decodePacket = require("./decodePacket")

class PacketManager {
    // max combined packets = 2 packets
    MCP = 2
    // minimum packet size for combination
    MPL = 1

    endpoints = {}

    constructor() {
        // Add the server endpoint
        this.addEndpoint("SERVER", {
            id: "SERVER",
            username: "§bServer§r",
            write: (packet) => {
                const mes = decodePacket(packet, packet).data.text
                console.log(mes)
            }
        })
    }

    addEndpoint(id, socket) {
        this.endpoints[id] = {
            socket: socket,
            packets: []
        }

        return this.endpoints[id]
    }

    removeEndpoint(id) {
        if (!this.endpoints.hasOwnProperty(id))
            throw new Error(`Endpoint (${id}) not found!`)

        delete(this.endpoints[id])
    }

    getEndpoint(id) {
        if (!this.endpoints.hasOwnProperty(id))
            throw new Error(`Endpoint (${id}) not found!`)

        return this.endpoints[id]
    }

    queuePacket(id, packet) {
        if (!this.endpoints.hasOwnProperty(id)) return

        this.endpoints[id].packets.push(packet)
    }

    sendPacket(endpoint, packet) {
        const s = endpoint.socket
        if (!s) return
        if (s && s.destroyed) return this.removeEndpoint(s.id)

        s.write(packet)
    }

    // Called every tick
    distributePackets() {
        Object.keys(this.endpoints).forEach(async (k) => {
            var ep = this.endpoints[k]

            while (ep.packets.length > 0)
                this.sendPacket(ep, ep.packets.shift())

            // if (ep.packets.length > 0)

            // Add code to decide whether or not to combine packets
            // I'm not entirely sure that every packet can be combined
        })
    }
}

module.exports.PacketManager = PacketManager