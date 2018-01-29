import {App} from './app';
import * as Discord from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import * as config from '../config';
import {Server} from './server';

const client = new Discord.Client();
const app = new App(client);

const servers = {};

client.on('ready', () => {
    console.log('Connected');
});

client.on('message', message => {
    if (message.author.bot) {
        return;
    }

    if (servers.hasOwnProperty(message.guild.id)) {
        servers[message.guild.id].handle(message);
    }
});

client.on('guildCreate', guild => {
    if (!servers.hasOwnProperty(guild.id)) {
        servers[guild.id] = new Server(app, guild.id, guild);
    }
});

client.on('guildDelete', guild => {
    if (servers.hasOwnProperty(guild.id)) {
        delete servers[guild.id];
    }
});

client.login(config.token)
    .then(setup)
    .catch(console.error);

function setup() {
    app.setupDatabase()
        .then(() => {
            client.guilds.forEach((guild, id) => {
                servers[id] = new Server(app, id, guild);
            });
        });

    loadCommands(app);
}

function loadCommands(app) {
    fs.readdir(path.join(__dirname, 'commands'), (error, files) => {
        if (error) {
            return console.error(error);
        }

        files
            .filter(file => file !== 'command.js' && file.substr(-3) === '.js')
            .forEach(file => {
                const command = require(path.join(__dirname, 'commands', file)).default;
                app.commands.push(command);
            });
    });
}
