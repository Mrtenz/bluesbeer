import {Middleware} from './middleware';
import {Message} from 'discord.js';
import {Server} from '../../server';

export class RequireAdminMiddleware extends Middleware {
    check(server: Server, message: Message): boolean | object {
        if (!message.member.hasPermission('MANAGE_CHANNELS')) {
            message.reply(server.__('You are not allowed to use this command.'));
            return false;
        }
        return true;
    }
}
