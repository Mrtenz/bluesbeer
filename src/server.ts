import {Guild, GuildMember, Message, Snowflake, VoiceChannel, VoiceConnection} from 'discord.js';
import {App} from './app';
import {Queue} from './queue';
import {Metadata, Type} from './modules/module';
import {Track} from './track';
import * as I18n from 'i18n-2';

export class Server {
    readonly app: App;
    readonly id: Snowflake;
    readonly guild: Guild;
    public prefix: string;
    readonly queue: Queue;
    readonly pendingSelections: Map<Snowflake, PendingSelection> = new Map<string, PendingSelection>();
    public current: Track;
    public channel: VoiceChannel;
    public connection: VoiceConnection;
    readonly i18n: I18n;
    private leaveTimeout: number;

    constructor(app: App, id: Snowflake, guild: Guild) {
        this.app = app;
        this.id = id;
        this.guild = guild;
        this.prefix = '>';
        this.queue = new Queue(this);
        this.i18n = new I18n({
            locales: ['en', 'de', 'nl', 'nds-gos', 'nl-rs'],
            extension: '.json'
        });

        this.load()
            .catch(console.error);
        setInterval(this.clearPending.bind(this), 5000);
    }

    load(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.app.database.get('SELECT * FROM servers WHERE serverId = ?', this.id, (error, row) => {
                if (error) {
                    return reject(error);
                }
                if (row) {
                    this.prefix = row.prefix;
                    this.setLocale(row.locale);
                }
                resolve();
            });
        });
    }

    save(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.run('UPDATE servers SET prefix = ?, locale = ? WHERE serverId = ?', [this.prefix, this.i18n.getLocale(), this.id])
                .then(changes => {
                    if (changes === 0) {
                        this.run('INSERT INTO servers (serverId, prefix, locale) VALUES (?, ?, ?)',[this.id, this.prefix, this.i18n.getLocale()])
                            .then(resolve)
                            .catch(reject);
                    } else {
                        resolve();
                    }
                })
                .catch(reject);
        });
    }

    private run(query: string, params: any[]): Promise<number> {
        return new Promise((resolve, reject) => {
            this.app.database.run(query, params, function (error) {
                if (error) {
                    return reject(error);
                }
                resolve(this.changes);
            });
        });
    }

    handle(message: Message): void {
        const content = message.content.trim();
        if (!content.startsWith(this.prefix)) {
            if (message.mentions.users.first() && message.mentions.users.first().id === this.app.client.user.id) {
                message.reply(this.__('My command prefix for this server is %s. Use %s for more info.', `\`${this.prefix}\``, `\`${this.prefix}info\``));
            }
            return;
        }

        const commandName = content.split(' ')[0].replace(this.prefix, '');
        const command = this.app.findCommand(commandName);
        if (command) {
            const args = content.split(' ');
            args.shift();

            let data: object = {};
            if (command.middleware) {
                for (let i = 0; i < command.middleware.length; i++) {
                    const result = command.middleware[i].check(this, message, args);
                    if (!result) {
                        return;
                    }

                    if (typeof result === 'object') {
                        data = result;
                    }
                }
            }

            command.handle(this, message, args, data);
        }
    }

    select(message: Message, channel: VoiceChannel, selection: number): boolean {
        const pendingSelection = this.pendingSelections.get(message.member.id);
        if (pendingSelection && pendingSelection.results.length > selection) {
            const result = pendingSelection.results[selection];
            this.enqueue(message, channel, result);
            this.pendingSelections.delete(message.member.id);
            return true;
        }
        return false;
    }

    playNext(): void {
        if (!this.current && this.queue.count() > 0) {
            this.getConnection().then(connection => {
                this.connection = connection;
                this.current = this.queue.next();
                this.current.play(connection, this.channel);
            });
            if (this.leaveTimeout) {
                clearInterval(this.leaveTimeout);
                this.leaveTimeout = null;
            }
        } else {
            if (this.queue.count() === 0 && this.connection) {
                this.leaveTimeout = setTimeout(this.disconnect.bind(this), 30000);
            }
        }
    }

    disconnect() {
        if (this.connection) {
            this.connection.disconnect();
            this.connection = null;
            this.leaveTimeout = null;
        }
    }

    getConnection(): Promise<VoiceConnection> {
        return new Promise<VoiceConnection>((resolve, reject) => {
            if (this.connection) {
                return resolve(this.connection);
            }
            this.channel.join()
                .then(resolve)
                .catch(reject);
        });
    }

    enqueue(message: Message, channel: VoiceChannel, metadata: Metadata) {
        if (!this.current) {
            this.channel = channel;
        }
        this.queue.enqueue(message, metadata.toTrack(this));
    }

    search(message: Message, text: string, type: Type, channel: VoiceChannel, playFirst: boolean = false) {
        const module = this.getModule(type);
        module.search(text, message.member)
            .then(results => {
                if (results.length === 0) {
                    message.reply(this.__('No songs found.'));
                } else if (results.length === 1 || playFirst) {
                    this.enqueue(message, channel, results[0]);
                } else {
                    this.pendingSelections.set(message.member.id, new PendingSelection(message.member, results));

                    let list = `${this.__('Multiple songs found, select one with `>select [number]`.')}\n\n`;
                    let separator = '';
                    for (let i = 0; i < results.length; i++) {
                        const result: Metadata = results[i];
                        list += `${separator}\`${i + 1}.\` ${result.name} | \`${Track.parseTime(result.duration)}\``;
                        separator = '\n';
                    }
                    message.reply(list);
                }
            })
            .catch(console.error);
    }

    getModule(type: Type) {
        switch (type) {
            case Type.YouTube:
                return this.app.youtube;
            case Type.Soundcloud:
                return this.app.soundcloud;
        }
    }

    clearPending() {
        const now = new Date().getTime();
        for (const key of this.pendingSelections.keys()) {
            const value = this.pendingSelections.get(key);
            if (now - value.createdAt > 30000) {
                this.pendingSelections.delete(key);
            }
        }
    }

    __(...args: any[]) {
        return this.i18n.__(...args);
    }

    __n(...args: any[]) {
        return this.i18n.__n(...args);
    }

    setLocale(locale: string): boolean {
        if (!this.i18n.locales.hasOwnProperty(locale)) {
            return false;
        }
        this.i18n.setLocale(locale);
        return true;
    }
}

export class PendingSelection {
    readonly member: GuildMember;
    readonly results: Metadata[];
    readonly createdAt;

    constructor(member: GuildMember, results: Metadata[]) {
        this.member = member;
        this.results = results;
        this.createdAt = new Date().getTime();
    }
}
