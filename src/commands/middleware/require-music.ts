import {Middleware} from './middleware';
import {Message} from 'discord.js';
import {Server} from '../../server';

export class RequireMusicMiddleware extends Middleware {
    check(server: Server, message: Message): boolean | object {
        if (!server.current) {
            message.reply(server.__('There is no music.'));
            return false;
        }
        return true;
    }
}
