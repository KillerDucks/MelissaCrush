# MelissaCrush
## A simple Twitch bot

Based on MelissaBot (A combination of bots controlled by a central microservice server and relay) MelissaCrush is a standalone bot that does not rely on a authorization server to retrieve oAuth keys or any other sensitive information.


## Installation

Install locally:
```bash
cd /path/to/bot/
npm i
node .\bot.js
```
Install in Docker: (`Not Yet Implemented`)
```bash
cd /path/to/bot/
docker build --tag MelissaCrush@1.0.0 .
docker run MelissaCrush@1.0.0
```

## Features

+ Simple Command Loader with template to add commands to the bot
+ Command Reload terminal command to apply new commands on the fly
+ `AutoMod` a moderator that doesn't sleep
+ (`Soon`) Ability to integrate with a master bot server to allow failover clustering

## Logging  (`Not Yet Implemented`)

The bot logs events locally to the log directory `/logs/` however, this can be changed if you alter the `NODE_ENV` you can set the logging path to wherever you want. 

## Dependencies

+ [tmijs/tmi.js](https://github.com/tmijs/tmi.js)
+ `app-root-path`

## Author

>KillerDucks

## License

This code is licensed under the MIT license see `LICENSE` file for more information.