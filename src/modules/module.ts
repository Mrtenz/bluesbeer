import {Track} from '../track';
import {Readable} from 'stream';
import {Server} from '../server';
import {GuildMember} from 'discord.js';

export interface Module {
    search(text: string, member: GuildMember): Promise<Metadata[]>;

    createStream(id: string): Readable;
}

export enum Type {
    YouTube,
    Url,
    Soundcloud
}

export class Metadata {
    readonly type: Type;
    readonly id: string;
    readonly name: string;
    readonly duration: number;
    readonly requester: GuildMember;
    readonly thumbnail: string;

    constructor(type: Type, id: string, name: string, duration: number, requester: GuildMember, thumbnail: string) {
        this.type = type;
        this.id = id;
        this.name = name;
        this.duration = duration;
        this.requester = requester;
        this.thumbnail = thumbnail;
    }

    toTrack(server: Server): Track {
        return new Track(server, this);
    }

    getDurationAsString() {
        return Track.parseTime(this.duration);
    }
}
