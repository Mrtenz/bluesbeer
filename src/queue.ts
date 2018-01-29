import {Server} from './server';
import {Track} from './track';
import {Message, RichEmbed} from 'discord.js';
import {Metadata} from './modules/module';

export class Queue {
    readonly server: Server;
    private queue: Track[] = [];

    constructor(server: Server) {
        this.server = server;
    }

    first(): Track {
        return this.queue[0];
    }

    next(): Track {
        return this.queue.shift();
    }

    enqueue(message: Message, track: Track): void {
        this.queue.push(track);
        if (!this.server.current) {
            this.server.playNext();
        } else {
            const time = Track.parseTime(this.getTimeTo(track));
            message.reply(this.server.__('Your song will play after `%s`.', time));
        }
    }

    remove(index: number): void {
        this.queue.splice(index, 1);
    }

    clear(): void {
        this.queue = [];
    }

    count(): number {
        return this.queue.length;
    }

    indexOf(track: Track): number {
        return this.queue.indexOf(track);
    }

    announce(message: Message): void {
        let totalLength = 0;
        let description = `\n__${this.server.__('Now Playing')}:__`;
        description += `\n${this.formatMetadata(this.server.current.metadata)}`;
        description += `\n\n__${this.server.__('Up Next')}__:`;
        for (let i = 0; i < this.queue.length; i++) {
            description += `\n${this.formatMetadata(this.queue[i].metadata)}\n`;
            totalLength += this.queue[i].metadata.duration;
        }
        description += `\n\n**${this.server.__n('songs in queue | total length', this.queue.length, Track.parseTime(totalLength))}**`;

        const embed = new RichEmbed();
        embed.setTitle(`Bluesbeer ${this.server.__('Queue')}`);
        embed.setDescription(description);
        message.channel.send({embed});
    }

    private getTimeTo(track: Track) {
        let time = 0;
        if (this.server.current) {
            time += this.server.current.metadata.duration - this.server.current.getTime();
        }

        for (let i = 0; i < this.queue.length; i++) {
            const current = this.queue[i];
            if (current === track) {
                break;
            }
            time += current.metadata.duration;
        }
        return time;
    }

    private formatMetadata(metadata: Metadata): string {
        return `${metadata.name} | \`${metadata.getDurationAsString()} ${this.server.__('Requested by')}: ${metadata.requester.displayName}\``;
    }
}
