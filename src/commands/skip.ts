import {Command} from './command';
import {Server} from '../server';
import {Message} from 'discord.js';
import {RequireChannelMiddleware} from './middleware/require-channel';
import {RequireMusicMiddleware} from './middleware/require-music';

export default new class extends Command {
    constructor() {
        super('skip', [], [new RequireChannelMiddleware(), new RequireMusicMiddleware()]);
    }

    handle(server: Server, message: Message, args: string[]): void {
        server.current.skip(message);
    }
}
