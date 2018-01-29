import {Command} from './command';
import {Server} from '../server';
import {Message} from 'discord.js';
import {RequireAdminMiddleware} from './middleware/require-admin';

export default new class extends Command {
    constructor() {
        super('forceskip', [], new RequireAdminMiddleware());
    }

    handle(server: Server, message: Message, args: string[]): void {
        if (server.current) {
            message.reply(server.__('The current song has been skipped.'));
            server.current.end();
        }
    }
}
