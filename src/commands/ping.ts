import {Command} from './command';
import {Server} from "../server";
import {Message} from "discord.js";

export default new class extends Command {
    constructor() {
        super('ping');
    }

    handle(server: Server, message: Message, args: string[]): void {
        message.reply('Pong!');
    }
}
