import {Command} from './command';
import {Server} from '../server';
import {Message} from 'discord.js';
import {RequireMusicMiddleware} from './middleware/require-music';

export default new class extends Command {
    constructor() {
        super('np', ['nowplaying'], new RequireMusicMiddleware());
    }

    handle(server: Server, message: Message, args: string[]): void {
        server.current.announce(message);
    }
}
