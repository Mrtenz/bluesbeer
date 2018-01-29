import {Command} from './command';
import {Server} from '../server';
import {Message} from 'discord.js';
import {RequireAdminMiddleware} from './middleware/require-admin';
import {RequireArgumentsMiddleware} from './middleware/require-arguments';

export default new class extends Command {
    constructor() {
        super('setlanguage', [], [new RequireAdminMiddleware(), new RequireArgumentsMiddleware(1)]);
    }

    handle(server: Server, message: Message, args: string[]): void {
        if (server.setLocale(args[0])) {
            message.reply(server.__('Language has been set to **"%s"**.', args[0]));
            server.save();
        } else {
            message.reply(server.__('**"%s"** is not a valid language, available languages: **%s**.', args[0], Object.keys(server.i18n.locales).join(', ')))
        }
    }
}
