# NodeCraft
A free to use implementation of the Minecraft Protocol (version 13) for Minecraft Beta 1.6.6

## How to Use NodeCraft

### Setup
NodeCraft is in its early stages. Since this is the case, you'll need to do a little bit of setup before you can immediately use it.

1. Ensure you have installed all the necessary modules by running `npm install` in the root directory.
2. Find `trusted.json`, which should be in the `./server data/` folder, open it, and replace `YourUsername` with your username.
3. In the root folder, find and open `properties.txt`. Make sure the port set in this file is available for use.

After performing all of the above steps, you should be ready to run the server.

### Running the Server
1. Open a command prompt or terminal in the root directory of the server.
    * If you're on Windows, you can click empty space in the address bar of Explorer and enter `cmd`. This will open a non-elevated command prompt in the current directory.
2. Run `node server.js`.
### Server Console
The server console, while relatively bare for now, provides some useful information. For the time being, you can see your current CPU usage, RAM heap usage, and Ticks per Second.

Another important part of the server console is the Chat log. This is where logging ends up, as well as all chat messages. When the console window is selected, you can type to send a message as the Server. You can also scroll the chat log by pressing the `Up` and `Down` arrow keys.

`Notice: you cannot run commands from the server console, for now.`

### Commands
Commands in NodeCraft are individual javascript files, that are preloaded when the server is launched.

In the commands folder, located in `./server data/commands/`, you can find `example.js`.
This is an example command, and it has important information found in its comments about creating and customizing commands.

## Why?
Like most of my projects, it's because I was interested in how it worked.

If that answer doesn't work for you, try this one: `because I want to >:(`

## Important Information
There are a few details that are important, at least for now.
1. Server files are not created automatically, so you'll have to use the ones that are in the repository and modify them to your liking.
2. Most paths in the properties.txt are relative to the directory containing server.js.
3. Server logs and chat logs are only saved when the program is exited gracefully (i.e. ctrl+c) and are located in the `./server data/logs/` folder.
4. Commands are Node Modules, and are located in the `./server data/commands/` folder.
5. There are no OPERATORS in NodeCraft, only TRUSTED users. TRUSTED users are usernames associated with IP addresses, since you are unable to verify accounts for this version of the game.
