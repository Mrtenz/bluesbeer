import {Command} from './command';
import {Server} from '../server';
import {Message, VoiceChannel} from 'discord.js';
import {Type} from '../modules/module';
import {RequireChannelMiddleware} from './middleware/require-channel';
import {RequireArgumentsMiddleware} from './middleware/require-arguments';

export default new class extends Command {
    constructor() {
        super('soundcloud', ['sc'], [new RequireChannelMiddleware(), new RequireArgumentsMiddleware(1)]);
    }

    handle(server: Server, message: Message, args: string[], channel: VoiceChannel): void {
        server.search(message, args.join(' '), Type.Soundcloud, channel);
    }
}
