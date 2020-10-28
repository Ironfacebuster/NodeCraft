# NodeCraft
An open source implementation of the Minecraft Protocol (version 13) for Minecraft Beta 1.6.6

## Why?
Like most of my projects, it's because I was interested in how it worked.

### Important Information
There are a few details that are important, at least for now.
1. Server files are not created automatically, so you'll have to use the ones that are in the repository and modify them to your liking.
2. Most paths in the configuration.txt are relative to the directory containing server.js.
3. Server logs and chat logs are only saved when the program is exited gracefully (i.e. ctrl+c) and are located in the ./server data/logs/ folder.
4. Commands are Node Modules, and are located in the ./server data/commands/ folder.
5. There are no OPERATORS in NodeCraft, only TRUSTED users. TRUSTED users are usernames associated with IP addresses, since you are unable to verify accounts for this version of the game.
