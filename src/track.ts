import {Metadata, Module, Type} from './modules/module';
import {GuildMember, Message, RichEmbed, StreamDispatcher, VoiceChannel, VoiceConnection} from 'discord.js';
import {Server} from './server';
import moment = require('moment');

export class Track {
    readonly server: Server;
    readonly metadata: Metadata;
    private dispatcher: StreamDispatcher;
    private channel: VoiceChannel;
    private skips: string[] = [];

    constructor(server: Server, metadata: Metadata) {
        this.server = server;
        this.metadata = metadata;
    }

    play(connection: VoiceConnection, channel: VoiceChannel): void {
        this.channel = channel;
        const module = this.getModule();
        this.dispatcher = connection.playStream(module.createStream(this.metadata.id), {
            volume: 0.5,
            bitrate: 'auto'
        });

        this.dispatcher.on('end', () => {
            setTimeout(() => {
                this.server.current = null;
                this.server.playNext();
                this.dispatcher = null;
            }, 100);
        });

        this.dispatcher.on('error', error => {
            console.error(error);
        })
    }

    end(): void {
        if (this.dispatcher) {
            this.dispatcher.end();
        }
    }

    pause(): void {
        if (this.dispatcher && !this.dispatcher.paused) {
            this.dispatcher.pause();
        }
    }

    resume(): void {
        if (this.dispatcher && this.dispatcher.paused) {
            this.dispatcher.resume();
        }
    }

    skip(message: Message): boolean {
        if (this.metadata.requester.id === message.member.id) {
            this.end();
            message.reply(this.server.__('Your song has been skipped.'));
            return true;
        }

        if (!this.skips.includes(message.member.id)) {
            this.skips.push(message.member.id);
            message.reply(this.server.__('You have voted to skip the current song (%s).', '69% <-- moet ik nog maken ok doei'));
            if (this.checkSkip()) {
                message.channel.send(this.server.__('The song has been skipped.'));
            }
            return true;
        }
        message.reply(this.server.__('You cannot vote to skip the song twice.'));
        return false;
    }

    checkSkip(): boolean {
        const people = this.channel.members.size - 1;
        const skips = this.skips.length;
        if (skips / people >= 0.5) {
            this.end();
            return true;
        }
        return false;
    }

    unskip(member: GuildMember): void {
        if (this.skips.includes(member.id)) {
            this.skips.splice(this.skips.indexOf(member.id), 1);
        }
    }

    announce(message: Message): void {
        if (this.dispatcher) {
            const current = Track.parseTime(this.dispatcher.time / 1000);
            const max = Track.parseTime(this.metadata.duration);

            const embed = new RichEmbed()
                .setTitle(`${this.server.__('Current Song')} ♫`)
                .setDescription(`${this.metadata.name}\n\n\`${current} / ${max}\`\n\n\`${this.server.__('Requested by')}:\` ${this.metadata.requester.displayName}`)
                .setThumbnail(this.metadata.thumbnail);
            message.reply({
                embed: embed
            });
        }
    }

    getTime(): number {
        return this.dispatcher.time / 1000;
    }

    static parseTime(seconds: number): string {
        return moment('00:00:00', 'HH:mm:ss').add(seconds, 's').format('HH:mm:ss');
    }

    getModule(): Module {
        return this.server.getModule(this.metadata.type)
    }
}
