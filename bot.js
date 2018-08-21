///////////////////// Libs + Load Config
// AppDir
const appRoot = require('app-root-path');

// Config
const Config = require(__dirname + '/Config/config');
const Keys = require(__dirname + '/Config/keys');

// System Load
const System = require(__dirname + '/Core/System');
const Collection = System.Collection;
const prettyLog = System.prettyLog;
const showObj = System.showObj;

// Twitch
const tmi = require("tmi.js");

// File System
const fs = require('fs');

// Chokidar
const chokidar = require('chokidar');

///////////////////// Lib Conf

// Set up TMI
const options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: Keys.Twitch.Username,
        password: Keys.Twitch.oAuth
    },
    channels: ["#speedoflightpen"]
};

const client = new tmi.client(options);

/////////////////////// Vars

// Used for Twitch Commands
let commands = [];
let cmd = new Collection();

///////////////////// Chokidar
const watcher = chokidar.watch(__dirname + '/Core/Commands', {ignored: /(^|[\/\\])\../, persistent: true});

watcher
    .on('all', (event, path) => { prettyLog("Chokidar", `\n\t\tEvent: ${event}\n\t\tPath: ${path}`) })
    .on('add', (path) => { LoadCommands(null) })
    .on('change', (path) => {file = path; LoadCommands(file) })

/////////////////////// Load Commands

// LoadCommands();

///////////////////// Main Entry

// >> Events Start

client.on('connected', (addr, port) => {
    prettyLog("Client", "Connected to the chat");
    client.say("speedoflightpen", "Hello, I am connected to the chat!");
});

client.on("disconnected", function (reason) {
    prettyLog("Event", `Been disconnected from the server: ${reason}`);
});

client.on("join", function (channel, username, self) {
    prettyLog("Event", `User has joined the channel: ${username}`);
});

client.on("mods", function (channel, mods) {
    prettyLog("Event", `List of moderators has been received`);
});

client.on("reconnect", function () {
    prettyLog("Event", `Trying to reconnect`);
});

// >> Events End

client.on("chat", function (channel, userstate, message, self) {
    // Don't listen to my own messages..
    if (self) return;
    // Auto Moderation Hook TBI
    // !# To Be Implemented

    //Check if message has the serverPrefix
    if(!message.startsWith(Config.Commands.Prefix)) return;
    // Explode the Message down to parameters keeping quotes
    let prams = [].concat.apply([], message.split('"').map(function(v,i){
        return i%2 ? v : v.split(' ')
    })).filter(Boolean);

    // New Command loader
    let sentCmd = prams[0];
    // Remove the Command from Prams
    prams.splice(0, 1);
    // Slide the commands into the args
    prams.push(commands);
    // Remove the prefix from the command
    sentCmd = sentCmd.substr(1);
    
    // Get the command object
    let foundCommand = cmd.get(sentCmd);
    prettyLog("Message", `[${userstate.username}] ${sentCmd}`);
    // Command Found
    if(foundCommand) {
        // Try to run
        try {
            // Run the Command
            foundCommand.run(client, message, userstate, prams);
        } catch (error) {
            client.action("speedoflightpen", Config.Commands.Error);
            prettyLog("Message", "[Error] Ran into an Error"); 
        }
    }
});


///////////////////// Twitch Auth Token
client.connect();

///////////////////// Helper Funcs

function LoadCommands(fileChange = null)
{
    if(fileChange){
        prettyLog("Bot::LoadCommands", `Searching for: ${fileChange}`)
        let justFilename = fileChange.split("/")[fileChange.split("/").length - 1];
        prettyLog("Bot::LoadCommands", `Searching for: ${justFilename}`)
        for (const key in commands) {
            // console.log(commands[key])
            if (commands[key].FileName == justFilename) {
                    try {
                        let meta = require(__dirname + '/Core/Commands/' + justFilename);
                        showObj(meta)
                        if(meta.help.name == undefined){
                            prettyLog("Bot::LoadCommands", `Skipping: ${justFilename}`)
                            return;
                        } 
                        prettyLog("Bot::LoadCommands", `Reloading ${justFilename}`);            
                        cmd.set(meta.help.name, meta);
                        prettyLog("Bot::LoadCommands", `Name: ${meta.help.name}, Info: ${meta.help.Info}`);            
                        commands.push({
                            Name: meta.help.name,
                            Info: meta.help.Info,
                            FileName: justFilename
                        });
                    } catch (error) {
                        prettyLog("Bot::LoadCommands", `[Error] Failed at file: ${f}`); 
                        prettyLog("Bot::LoadCommands", "[Error] Failed to Reload Command"); 
                        prettyLog("Bot::LoadCommands", "[Error] " + error.message); 
                        return;
                    }
            }
        }
    } else {
        try {
            fs.readdir(__dirname + "/Core/Commands", (err, files) => {
                if(err) throw err;
                prettyLog("Bot::LoadCommands", `#####################################################`)
                prettyLog("Bot::LoadCommands", 'Loading Commands');    
                let ComFiles = files.filter(f => f.split(".").pop() === "js");
                if(ComFiles.length <= 0){
                    console.log("No Commands to load");
                    prettyLog("Bot::LoadCommands", '[Warn] No Commands Loaded');  
                    return;
                }
          
                prettyLog("Bot::LoadCommands", 'Found '+ ComFiles.length +' Commands');   
                commands = [];
                cmd = new Collection();           
                ComFiles.forEach((f, i) => {
                    try {
                        let meta = require(__dirname + '/Core/Commands/' + f);
                        if(meta.help.name == undefined){
                            prettyLog("Bot::LoadCommands", `Skipping: ${f}`)
                            return;
                        } 
                        prettyLog("Bot::LoadCommands", i + 1 +': '+ f +' loaded');            
                        cmd.set(meta.help.name, meta);    
                        commands.push({
                            Name: meta.help.name,
                            Info: meta.help.Info,
                            FileName: f
                        });
                    } catch (error) {
                        prettyLog("Bot::LoadCommands", `[Error] Failed at file: ${f}`); 
                        prettyLog("Bot::LoadCommands", "[Error] Failed to Load Commands"); 
                        prettyLog("Bot::LoadCommands", "[Error] " + error.message); 
                        // process.exit(0);
                        return;
                    }
                    });
                prettyLog("Bot::LoadCommands", "Loaded all Commands");  
            });
        } catch (error) {
            prettyLog("Bot::LoadCommands", "[Error] Failed to Load Commands"); 
            prettyLog("Bot::LoadCommands", "[Error] " + error.message); 
            prettyLog("Fatal", "Exiting, Refer to the Fatal Error Logs"); 
            process.exit(0);
        }
    }
}

///////////////////// Other/Comments