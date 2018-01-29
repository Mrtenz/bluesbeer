import {Middleware} from './middleware';
import {Message, VoiceChannel} from 'discord.js';
import {Server} from '../../server';

export class RequireChannelMiddleware extends Middleware {
    check(server: Server, message: Message): boolean | object {
        const voiceChannels = server.guild.channels.filter(channel => channel.type === 'voice');
        let targetChannel = null;
        voiceChannels.forEach(channel => {
            const voiceChannel = <VoiceChannel> channel;
            const member = voiceChannel.members.find(member => member.id === message.member.id);
            if (member) {
                targetChannel = voiceChannel;
            }
        });

        if (!targetChannel) {
            message.reply(server.__('Please join a channel first.'));
            return false;
        }

        if (server.current && server.channel !== targetChannel) {
            message.reply(server.__('Please join the current music channel.'));
            return false;
        }

        return targetChannel;
    }
}
