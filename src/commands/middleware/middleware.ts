import {Message} from 'discord.js';
import {Server} from '../../server';

export abstract class Middleware {
    /**
     * Check whether the user is allowed to run the command. If an object is returned, it is assumed that the user is
     * allowed to run the command. The object will be passed into the command.
     * @returns {boolean | object}
     */
    abstract check(server: Server, message: Message, args: string[]): boolean | object;
}
