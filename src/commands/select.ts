import {Command} from './command';
import {Server} from '../server';
import {Message, VoiceChannel} from 'discord.js';
import {RequireChannelMiddleware} from './middleware/require-channel';

export default new class extends Command {
    constructor() {
        super('select', [], new RequireChannelMiddleware());
    }

    handle(server: Server, message: Message, args: string[], channel: VoiceChannel): void {
        const selection = Number(args[0]);
        if (!isNaN(selection)) {
            if (!server.select(message, channel, selection - 1)) {
                message.reply(server.__('Search for a song first.'));
            }
        } else {
            message.reply(server.__('Invalid selection.'));
        }
    }
}
