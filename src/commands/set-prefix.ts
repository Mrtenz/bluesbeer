import {Command} from './command';
import {Server} from '../server';
import {Message} from 'discord.js';
import {RequireAdminMiddleware} from './middleware/require-admin';
import {RequireArgumentsMiddleware} from './middleware/require-arguments';

export default new class extends Command {
    constructor() {
        super('setprefix', [], [new RequireAdminMiddleware(), new RequireArgumentsMiddleware(1)]);
    }

    handle(server: Server, message: Message, args: string[]): void {
        if (args[0].length > 10) {
            // Why would you do that
            message.reply(server.__('Invalid arguments.'));
            return;
        }
        server.prefix = args[0];
        message.channel.send(server.__('The command prefix is set to **\"%s\"**.', args[0]));
        server.save();
    }
}
