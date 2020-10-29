# NodeCraft
A free to use implementation of the Minecraft Protocol (version 13) for Minecraft Beta 1.6.6

**This is not meant as a drop-in replacement for the official Mojang server.**

If you have little to no coding experience, this is not the server for you.

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
