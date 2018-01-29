import {Command} from './command';
import {Server} from '../server';
import {Message, RichEmbed} from 'discord.js';

export default new class extends Command {
    constructor() {
        super('info');
    }

    handle(server: Server, message: Message, args: string[]): void {
        const client = server.app.client;

        const embed = new RichEmbed();
        embed.setAuthor(client.user.username, client.user.avatarURL)
            .setDescription(`${server.__('Music bot made by')} Morten#1337 | [Github](https://github.com/Mrtenz/bluesbeer)\n\n${server.__('To get a list of all commands, use %s.', `\`${server.prefix}help\``)}`);

        message.reply({embed});
    }
}
