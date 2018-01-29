import {Metadata, Module, Type} from './module';
import {Readable} from 'stream';
import {GuildMember} from 'discord.js';
import * as config from '../../config';
import * as request from 'request';

export class Soundcloud implements Module {
    private clientId: number = config.soundcloudClientId;
    private url: RegExp = /https?:\/\/soundcloud.com\/.*\/.*/i;

    search(text: string, member: GuildMember): Promise<Metadata[]> {
        return new Promise((resolve, reject) => {
            const match = text.match(this.url);
            if (match) {
                request(`https://api.soundcloud.com/resolve?url=${text}&client_id=${this.clientId}`, (error, response, data) => {
                    if (error) {
                        return reject(error);
                    }

                    data = JSON.parse(data);

                    const metadata = [];
                    if (data.streamable) {
                        metadata.push(new Metadata(Type.Soundcloud, data.id, `${data.user.username} - ${data.title}`, data.duration / 1000, member,
                            data.artwork_url));
                    }
                    resolve(metadata);
                });
            } else {
                resolve([]);
            }
        });
    }

    createStream(id: string): Readable {
        return request(`https://api.soundcloud.com/tracks/${id}/stream?client_id=${this.clientId}`);
    }
}
