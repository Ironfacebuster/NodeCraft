const colors = {
    "darkRed": "§4",
    "red": "§c",
    "gold": "§6",
    "yellow": "§e",
    "darkGreen": "§2",
    "green": "§a",
    "aqua": "§b",
    "darkAqua": "§3",
    "darkBlue": "§1",
    "blue": "§9",
    "lightPurple": "§d",
    "darkPurple": "§5",
    "white": "§f",
    "gray": "§7",
    "darkGray": "§8",
    "black": "§0"
}

const formats = {
    "obfuscate": "§k",
    "bold": "§l",
    "strike": "§m",
    "underline": "§n",
    "italic": "§o",
    "reset": "§r"
}

for(const color of Object.keys(colors)) {
    /**
     * 
     * @param {String} string 
     */
    module.exports[color] = (string) => {
        return `${colors[color]}${string}§r`
    }
}

for(const format of Object.keys(formats)) {
    /**
     * @param {String} string 
     */
    module.exports[format] = (string) => {
        return `${formats[format]}${string}§r`
    }
}