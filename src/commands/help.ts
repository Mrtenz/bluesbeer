import {Command} from './command';
import {Server} from '../server';
import {Message, RichEmbed} from 'discord.js';

export default new class extends Command {
    constructor() {
        super('help');
    }

    handle(server: Server, message: Message, args: string[]): void {
        const client = server.app.client;
        const prefix = server.prefix;

        const embed = new RichEmbed();
        embed.setAuthor(server.__('Commands'), client.user.avatarURL)
            .setDescription(`**Music**\n` +
                `\`${prefix}play [song|url]\` | Play a song or a YouTube link\n` +
                `\`${prefix}youtube/yt [song|url]\` | Search for a YouTube video\n` +
                `\`${prefix}select [index]\` | Select a song after searching for it\n` +
                `\`${prefix}soundcloud/sc [url]\` | Play a Soundcloud song\n` +
                `\`${prefix}nowplaying/np\` | Get info about the current song\n` +
                `\`${prefix}skip]\` | Vote to skip the song\n` +
                `\`${prefix}queue\` | Show all songs in the queue\n` +
                `\n` +
                `**General**\n` +
                `\`${prefix}help\` | Show this help\n` +
                `\`${prefix}info\` | Show general info about the bot\n` +
                `\`${prefix}ping\` | Pong\n` +
                `\n` +
                `**Admin only**\n` +
                `\`${prefix}end\` | End the current song and clear the queue\n` +
                `\`${prefix}forceskip\` | Force to skip the current song\n` +
                `\`${prefix}pause\` | Pause the current song\n` +
                `\`${prefix}resume\` | Resume the current song\n` +
                `\`${prefix}setlanguage [language]\` | Set the language of the bot\n` +
                `\`${prefix}setprefix [prefix]\` | Set the command prefix`
            );

        message.reply({embed});
    }
}
