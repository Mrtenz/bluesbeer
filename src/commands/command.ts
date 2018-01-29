import {Message} from 'discord.js';
import {Server} from '../server';
import {Middleware} from './middleware/middleware';

export abstract class Command {
    readonly name: string;
    readonly aliases: string[];
    readonly middleware: Middleware[];

    constructor(name: string, aliases: string[] = [], middleware: Middleware | Middleware[] = []) {
        this.name = name;
        this.aliases = aliases;
        this.middleware = middleware instanceof Array ? middleware : [middleware];
    }

    abstract handle(server: Server, message: Message, args: string[], data?: object): void;
}
