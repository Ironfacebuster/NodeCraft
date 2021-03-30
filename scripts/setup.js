const fs = require('fs')

// world data will eventually be generated later
const worlddata = {
    "spawn": {
        "position": {
            "x": 3.5,
            "y": 63,
            "z": -49.5,
            "stance": 63,
            "onground": true
        },
        "rotation": {
            "yaw": 0,
            "pitch": 0
        }
    },
    "world": {
        "time": 0
    }
}

const tempchunk = "33ffffffe00000000000a00f7f0f00000b35789ced5d3b72e43610058a5b456f8d39c3c4977036d9ce11740b1fc1477066874e9d39f5469b6fb2b915e80056d55cc0f2dc4026c01f400004398d468b62bf724963edb41e1a40f76b7c382a65595e2ee26e004c35ca52cae63f292f974b21e72084fea2f1e300207dc3afd9e5e17098f015fee668fa8f0352f09707cd2f26f4fe0628a322217fe7bbe37f885fff439192bf24e52f03fe0791da7f35fe7a0278c63a87ff4d0f286a1fbdf03520b9ff65a8a7b3f0fbd8abcacbdf4ec8e4fd3ffcfe870712fed2997a1efeaaf9190abf94d26d8033fe9502cef8abf413887fcb7d54fe0321ff05a2ff09f8c5a0ff45efe0e0f7e964cc0689a1fffdaf1fe87be8ff3dc929347d52fdef0b1039a1cfa3ff7d039ce91790dff4f9b7f4694f4efee5da8fc0dfa4bf50fecbc35f7ab55f234ffda1eb5f2f7d9efac3cdbd01fdcdc5dfe7fa5cfcd300f0f1f7ea8351ff19fc6dbe77fb7f943f84fac7e1ef20b2d41ff25086e43f93ffb4fadf24c0cba5d55f8ffeab2f752d5bf91718fa3f54001ec13d8dfce6a824d6dfa101167748ff1afad4ebbf5540d01f4afeb5f4ef8dbfcdff94fefb935f367e4ff61dc54eca637e7e4b7ff1f99d02246bfd61fbaf13aebffec8a8ff81fd0f147ebdfd18d57f447ef2f57fe3d3458e0b5e6be1ab5fd64a80d59b7bf94fbbff5f8e1d6b7cb3f8ed4149abff6660b973c005defee33220acff29f967f69ff3f8ef597fe6e5a7ddffe8d63f64fcd2330099f53fb4fecec41fd4ff2cfdbf8cbf42e40ff7bf965f5512980d42a97f9b06b85bcd163fd6fe0bfdfe7f937fcfe7d6b1aa73cfe86ca9f4d75cfb2ba43effd7e3dff25bf58747920bb5fe4eabff6301524d3887d756499251ff3d1549f2faf70de82f35ffb206e09cffcac0ea2393ff9298dfb7fecfcaeffa3fa3bf271afd1d7f703ae5dbfff0f163ac3fac0cd030d9fcd8fa3bd17f4564b9ffcef55fb9743eab1380d64b4bfffb97ea9d722c008ac4ebffc3e17c08f13b7b0222f5f8cb7e07b41de509bdb32792985f1a07e04edaf1f1279fffdeab6ff6f863f22fd25f4d5ff45fd39f7f2ee12f50f857e81f8effbe03f8482b90f52f2fbff702c084b3ffc1a911038afaa31a1b805dff39fa6bf163f4ff843ec08faeffc6507bc61f51ff3f94c4e7fff27c390ffaaffc1bcf3d3af911e6e53f61160049f80fe74bafbff564fba14f79c2d01ff30000cc2fcb41ffdb71f7e8bf539320f17704322fff8cfe64d1ff050258e0e9ffb20d7844fd1ff2efa74fb136e0f2cb087f773a4b52fff50d20e6ef8701b7fef6e91f1ebfbd0319d45f44ffa7be67e56fb73f8721a8f2eb3ff1fdbfa607ce677d00d0087c5ddbf7debaf42fda8aa0374abbfe97fdfabfe966cdefecbfdbfa671d0024e2374230b3feebfbf7810c9487ff10ce8039f47fae00198e5f30f53f70fdc7397a42d2df91dfd65ff7e8074bff4b6f01e23b7ac258ffae11601c7edfc3678533fce63448ad7ff6fa372fbf2dc0555b0090f38781907f6d7e8ffea3fa4fadffa5d2ff1f5be7ecabf6a6cfea9bba01d85ec04bacffe78f672fbfa13fe3cf449172fd6f9c3f04fd9ed624899fbf9dd57f6cfea0fe99fc12933fa0ffdd92db198d4cfc9e0488c22f89f943e3efe7c7d8fff61e4004f40761ffdbdfff45a001d8e71f9dfe17d9f8a5bd0151190dc8c3afd73f36fff059072d1c4dc0ad3fe484bfb64529393ff1fd3fb3fe09c8bfe9bc322a12eabffeb5fdf8c7f9f5d37708e7ff213ec7ff02a3fe8cedbf23f2cf9dff764960baf9965a7ffc0d18f5df7af29760fd8fca2fe552fded3421bdfe78fb3f5ffdb146ff51f8df82fe77fc5576fdb70fe0abecfa1fe6ef09dd3521e2fdc371ff458efcb5347e967efc69efff956bf45fa893f8e4e7ff4603e6e97bf9a17afe0d833f4e3f397b4a5dffcf6cbf76f26b3ffb8aa2bf8bf851f43f7affbd32f664d1ea8fa5fc18ebafd8fd07a3fb652efd0da782f4f57f40ff030dc0d3ffda1eeb4cfe0ffd5fd77efdc5e597e3f95fd300833f341310fbbfed0077dcdbd3ef2efaed0624e0a77efe6f70f321aaffca73a1f6df937ffeef3268fee4e3bf8e1f65fe11f2cf3dffad1f7ec6d67f5f07b4e17f9cf023e97f90bf05aefefac73f23bfbdff3a62c80539fcf7c8ff988bece3d8e4f56fa0001e53614efed947ff31f847fd7fa8ad58cfc75ff6fc21fdb5d893ebef30007aca559606aa09afde36388ec14ffcfc5fd94ff507b7bb7d836f6eff27d1ff3b043865fe5b83f4fc3270fd28c48fbbff36e1ef05d8f887f4f9af4d3f0f5e7e39e5c7daff9bccfd90fe3a0d80f307f4df943f4b7f53f307c2aff6ea3f82ffcbf97d1300ce1ffc006ca7ffb1f8f5fcff6120f33420489f9a7f81fea3cc7ff30020a8ff6df24bcc3fbdff513b9f36d73f0d579848e83ff5f9bfac2f46a80d5d1d1c05f3fa7fe2f5bfb5d09b997e1f53ceffd29c7dcbf8b1d73f39f903c7af217aacfce3d5ff6cfd3fad7d2dfe494a4c9effbdf2537bd69f38faeb878f1fc37f19dd80c3d5dff8ea230fff0fbe0fa0cbd0fffd03881dbf4ffe71f9a53e80099df6dbc4d2d9804ac1aff2cf10f0ce87cd0f0fc3bfcff5bfbafe7ff9d00fb4bdd2f08f82da804f7afe5f9e8dea2fce8fb8fe25d1ff8737a1bf74fca007b013f9bf823e75fe5f8ddcfa674265c7e4f96f05ff8982dffa343a0cfdd5027c22d27fd9df7f0ef24f80c2bf240291f4bf4d80e184673bfec6f41ffcf77fa5fafb3f1f869916bbfdd9f542d2f5ffe16c5c7f958bf891f58f9a3fabfefaea8f3960d4df2be833ed3f67f49f967ff62f104e51b71fd091daffc53300a3fe58c3ef3c8098c4ff7501987efc69f957fc052a14fdb5fa3f5c85e1f033180c0683c16030180cc69bc077d40d60301864e0f86730f60b8e7f0663bff8ee17ea1630180c0683c16030180c0683c1c006efff31180c0683c16030187b0157ff0cc68ec10980c16030188cf78bd713c4fa265eff83b1c3f8a9ed6fa71bb0ff6e10f3cde315680feb7d71038effedf515367fb60fe00800e73f347aa0a347eb3dd8fe06f41f6c7f03260062fba6fdd00cc6d8316e70fd02da03e73f74fa53f343e3ff95e37fcf80c61fb4fe00eb2734fe88f9a9db7fdb7cf9bfeff4052f1fb7adbfd4f6ef40ffb71dffb71375010a3287a62fb07e83ebf76deb2775fcc2edc1e3b7f1f817d4f10fdb3e87cf5fd2fcb5fdf90f5dffc0cce901dd002606bdfec3e21fca0f8c7f68fe07dbc3fd079983eb37a0fc3080009f3fd1e60f70fdb5717bb0ffc4f9139e7f88cf6f370f68ff41f33ff9feefa6f59fbafea2ce7fd4fb17f0f9cf8060effbeff0fd53f2f8ddb7fdde417dfe0dbfff05e3a7be7f48ad9ff4fbb7c41ba03b0778ff78ebfabbf5e9b3f9fcc3fa0f0171fcd2db13dfffdf3bc0fb7fc4f3871c7b8fdfbdeb3735c89fffd977fd7fa28e1f6afb6d0f1ffd03901b5f7f53db8b9739a8c78be6e0fd8dcfe2e9f9f959bf8c980763e7dbe3f731d359fb2f5f0fbafdf7da37503efc0bb0fff6f8f808b1fff2f5ebdf10fb3f3f7f06d9fffec75f20fb5f7e83d9fffc2bccfe27b65f641f7bcb7afe17716d424fbfbcb7fd4fcfd5fdfc42e70f8e7f8e7fb68fdbc7deb29aff7abc82e35f00e35f3cea1cc4f17fbf3dc7ff3eec636f59cd7f7d39be50ebbf6e06c73fc73fdbc7ec636f59cbdfaa3f58ff97b56bc67f8e7f8e7fb68fdbc7deb296bf897c157947fd3f77b7bf12b1adc779fbef39fe39fed97e817dec2d0bf9afc7ee4513f930fdaff4d76758fcb3fe73fcb37da6f81f625fa189ff2b5cff9f2a8e7f8eff2dc4cfd6ed636fb983ff7a3c42d7ff4f4f1cff1cff5b889faddbc7de7217ff15a8ffff08e0fa9fe39fe39feda9e2ff2a8e40fde7f8e7f8df46fcbc557b41a9ffe2e5aabfdd6d0fddffe7f8e7f8dfb6fdd2f885dac7de721fffb5fd06683fc73f2cfe0530fe0530fe0530fe73cdff10b612bf50fbd85beee3bfb6df00ed87f173fc73fcb3fd96e37feffa2f38fed93e837dfae77f0d00da0f8d7feafc2180f94370fed844fc6cdafe7f1c04890733ffffffe00000000000900f7f0f00000398789ced9d4b4ec3401005dd4aa45958885c23d965992370ff0b7002941b8431124262e11077a28ae92a2962c3e3797edd3de3d8b468dbd369584c42fa456b39ff2c2da235d4bfb50de9df787f74fcbf2620e91fb07feffed2fe5bd67f80fdf1feef1f38fe96eeff986620e8cfe79f0d9dff6afb4744717f34fe35bafe0d38fe0eecfe83ae3f5ef0fc07fb8f2fecfaa3db8ffb07dd7e76fc3770fd41c7df690290fec1fa777bb6fdf0fac3f33f7cfe48c7df3efb58ff237cfe30c2fddfe8fa83de7fc0f93fe8fd3fee0ff73f9dffe1f94fe77fbefe81fb9f3e7f0ff8fe53f1fd173efeb43fdcff70fc0d3cffd2fb1fd89f3e7fa6cf1ff0fc5fdc9f1e7fbefe85fbffc8c69f139d7fe1f3177afccbfb6fe0fa0bf6af1e7fe9fd6fc45be9fa879e7f74fbe9f8079fbff7fae308b79f8ebff4feb3f4f92b7eff973effe6cf9f6bc77fbafea8de7e3affe2f50fec3f8e70fe87cf3ff0e78f8ae77f7aff89fbd3f10fafbf6ab7bfbc3f9d7fe9fbaf70fec5f30f7eff958e7ff0f72fe9f84fcf3f3afed1fd4fb71f8fffa5fdfbfadfc1f75f597f7afca3a1f93faaeffff1f79fb0df7fa5e7bfdf3fa3fbbf76fec3fd6307d7bfbbdaf93f82cd7f31c2f75fd8fc4bbf7f283cffa0efffd1cf1fb9ff2dedcfe6bfe902e0f6d3f1879e7ff4f9231cffc6dadfff9f1220e8cfcf3fb8fe1ad8f75fd2eb8f7ffe1baf7fe1fa93cd7ff4fee709e67fedfea7f73fb43fddff74fce1fd8b3f7f4aaf3f7afe176fbfe75fc5f30ffdfe47bafd74fca1dfbf4d3fff42f73f9d7fe9f84fefbfe9f54fc77f7afed3fb4f7afc8bef3ff8f12fddfff4ff9fc3dbcfafbfd2f50f7efe47f73f1e7fe8fc47d73fb6bf76fd35d0f1876eff9af35ff6d2b3fe7bd8ff00fbdfa3fd99f9bffff5f376ff5cfdf3ddfffb8517d09b7f48b5ff8765fec9ff7fb34f5e40b6ffd3ed4fcebffcf81f72e3ffebe7edfec9f9b75cfaed7f97f59ff04f9dbfa6fdfbe71ef32fe34fe61f111111111111111111111111111111111111111111111111111111111111111111119192bcd217202218ae7f1111111191f540d7efb4bf882ce792d4bbfe4538cef40588c86a31ff8bac17f3bf882cc5f8212222222222222222228fe3638ef3659eaebff21bead5ab57af5ebd7af5ead5ab57af5ebd7af5ead5ab57af5ebd7af5ead5ab57af5ebd7af5ead5ab57af5ebd7af5ead5ab57af5ebd7af5ead5ab57af5ebd7af5ead5abbf419f7dfef75febdfaffc8dbfe8e746e89a7e9898b9803fe9672ee0d1fed9f667fb9f9e3fcfaeff04575f101a"
const properties = `# INFO
# <- this dictates an ignored line. (a comment, so to speak)
# If a line is less than 3 characters, it's also ignored.
# EX: "a=b" works, while "a=" does not

# Server config
port=12345
allowCommands=true
useAntiCheat=true

# Chat formatting
serverPrefix=§bServer §r>>> 
userSuffix= > 

# Packet logging
logid=false
logpackets=false
# nolog applies to both IDs and the packets themselves
nolog=0x0b,0x0d,0xff,0x10,0x0a,0x0c

# Chat logging
logchat=true

# Extra features (not implemented yet)
# fourthdimension=false
# teleporters=false
# rpg=false

# File Locations
commands=./server data/commands
trusts=./server data/trusted.json
playerFolder=./server data/users
worldFolder=./server data/world`

const folders = [{
    dir: "./server data", name: "logs"
}, {
    dir: "./server data", name: "users"
}, {
    dir: "./server data", name: "world"
}], files = [{
    dir: "./server data", name: "trusted.json", data: "{}"
}, {
    dir: "./server data/world", name: "worlddata.json", data: JSON.stringify(worlddata)
}, {
    dir: "./server data/world", name: "tempchunk.txt", data: tempchunk
}, {
    dir: "./", name: "server.properties", data: properties
}]


module.exports = () => {
    if (CheckSetup()) return

    console.log("Welcome to NodeCraft!")
    // console.log("Since this is your first time running this, I'm missing some necessary files and folders.")
    console.log("Creating required files and folders!")

    folders.forEach(f => {
        CreateFolder(f.dir, f.name)
    })

    files.forEach(f => {
        CreateFile(f.dir, f.name, f.data)
    })

    console.log("All required folders and files created!")
    console.log("Server will automatically start soon.")

    var c = 10000

    while (c > 0) c--
}

function CreateFolder(dir, name) {
    if (!fs.existsSync(`${dir}/${name}`))
        console.warn(`Creating ${name}...`), fs.mkdirSync(`${dir}/${name}`)
}

function CreateFile(dir, name, data) {
    if (!fs.existsSync(`${dir}/${name}`))
        console.warn(`Creating ${name}...`), fs.writeFileSync(`${dir}/${name}`, data)
}

function CheckSetup() {
    console.log("Checking for required files...")

    var setup = true

    const total = folders.concat(files)

    total.forEach(f => {
        if (!fs.existsSync(`${f.dir}/${f.name}`)) setup = false
    })

    return setup
}