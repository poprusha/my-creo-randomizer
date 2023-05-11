import { descriptions, sounds, usernames } from './const.js';
import { config } from "dotenv";
import { getRandomItem } from "./random.js";
import { Telegraf } from "telegraf";

config();

const bot = new Telegraf(process.env.BOT_TOKEN);


bot.on('message', async msg => {
    const chatId = msg.update.message.from.id.toString();

    if (process.env.WITH_SOUND === 'true') {
        await msg.reply(getRandomItem(sounds));
    }

    if (chatId === process.env.CHAT1 || chatId === process.env.CHAT2) {
        await msg.reply(getRandomItem(usernames));
        await msg.reply(getRandomItem(descriptions));
    }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));