import {Command} from './command';
import {Server} from '../server';
import {Message} from 'discord.js';
import {RequireMusicMiddleware} from './middleware/require-music';

export default new class extends Command {
    constructor() {
        super('queue', [], new RequireMusicMiddleware());
    }

    handle(server: Server, message: Message, args: string[]): void {
        if (server.queue.count() === 0) {
            message.reply(server.__('The queue is empty.'));
            return;
        }
        server.queue.announce(message);
    }
}
