import {Metadata, Module, Type} from './module';
import * as config from '../../config';
import * as yt from 'ytdl-core';
import {Readable} from 'stream';
import {GuildMember} from 'discord.js';
import {YtResult} from 'youtube-node';
import {DurationInputObject} from 'moment';
import YouTubeNode = require('youtube-node');
import moment = require('moment');

export class YouTube implements Module {
    private youTube: YouTubeNode;
    private youtubeUrl: RegExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/i;

    constructor() {
        this.youTube = new YouTubeNode;
        this.youTube.setKey(config.youtubeToken);
    }

    search(text: string, member: GuildMember): Promise<Metadata[]> {
        return new Promise<Metadata[]>((resolve, reject) => {
            const match = text.match(this.youtubeUrl);
            if (match) {
                const id = match[1];
                this.getData(id)
                    .then(result => {
                        const results = [];
                        if (result && result.items.length > 0) {
                            const item = result.items[0];
                            if (item.kind === 'youtube#video') {
                                results.push(new Metadata(Type.YouTube, item.id, item.snippet.title, this.parseDuration(item.contentDetails.duration), member,
                                    `https://img.youtube.com/vi/${item.id}/0.jpg`));
                            }
                        }
                        resolve(results);
                    })
                    .catch(reject);
            } else {
                this.youTube.search(text, 5, async (error, result) => {
                    if (error) {
                        return reject(error);
                    }

                    const results = [];
                    const items = result.items.filter(item => item.id.kind === 'youtube#video');
                    for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        try {
                            const data = await this.getData(item.id.videoId);
                            results.push(new Metadata(Type.YouTube, item.id.videoId, item.snippet.title, this.parseDuration(data.items[0].contentDetails.duration),
                                member, `https://img.youtube.com/vi/${item.id.videoId}/0.jpg`));
                        } catch (error) {
                            return reject(error);
                        }
                    }

                    resolve(results);
                });
            }
        });
    }

    createStream(id: string): Readable {
        return yt(`https://youtube.com/watch?v=${id}`, {filter: 'audioonly'});
    }

    parseDuration(duration: DurationInputObject): number {
        return moment.duration(duration).asSeconds()
    }

    getData(id: string): Promise<YtResult> {
        return new Promise((resolve, reject) => {
            this.youTube.getById(id, (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            });
        });
    }
}
