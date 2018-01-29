import {Command} from './commands/command';
import {Client} from 'discord.js';
import {YouTube} from './modules/youtube';
import {Soundcloud} from './modules/soundcloud';
import {Database} from 'sqlite3';

export class App {
    readonly client: Client;
    public commands: Command[];
    readonly youtube: YouTube = new YouTube();
    readonly soundcloud: Soundcloud = new Soundcloud();
    readonly database: Database = new Database('./database.sqlite');

    constructor(client: Client) {
        this.client = client;
        this.commands = [];
    }

    setupDatabase(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.database.run('CREATE TABLE IF NOT EXISTS servers (' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
                'serverId VARCHAR(255) UNIQUE NOT NULL,' +
                'prefix VARCHAR(255) NOT NULL,' +
                'locale VARCHAR(255) NOT NULL' +
                ')', error => {
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
    }

    findCommand(name: string): Command {
        for (let i = 0; i < this.commands.length; i++) {
            if (this.commands[i].name === name || this.commands[i].aliases.includes(name)) {
                return this.commands[i];
            }
        }
        return null;
    }
}
