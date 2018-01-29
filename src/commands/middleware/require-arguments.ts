import {Middleware} from './middleware';
import {Message} from 'discord.js';
import {Server} from '../../server';

export class RequireArgumentsMiddleware extends Middleware {
    private minimum: number;
    private maximum: number;

    constructor(minimum: number, maximum: number = -1) {
        super();
        this.minimum = minimum;
        this.maximum = maximum;
    }

    check(server: Server, message: Message, args: string[]): boolean | object {
        if (args.length < this.minimum || (this.maximum > -1 && args.length > this.maximum)) {
            message.reply(server.__('Invalid arguments.'));
            return false;
        }
        return true;
    }
}
