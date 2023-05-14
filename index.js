import { descriptions, sounds, usernames, lastNames, names } from './const.js';
import { config } from "dotenv";
import { getRandomItem } from "./random.js";
import { Telegraf } from "telegraf";
import fs from 'fs';
config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const avatarsPaths = await fs.promises.readdir('./avatars');
const avatarNames = avatarsPaths.filter(el => el.endsWith('.jpg'));

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);


bot.on('message', async msg => {
    const chatId = msg.update.message.from.id.toString();

    if (process.env.WITH_SOUND === 'true') {
        await msg.reply(getRandomItem(sounds));
    }

    if (chatId === process.env.CHAT1 || chatId === process.env.CHAT2) {
        await msg.reply(getRandomItem(usernames));
        await msg.reply(getRandomItem(names) + ' ' + capitalizeFirstLetter(getRandomItem(lastNames)));
        await msg.reply(getRandomItem(descriptions));
        await msg.replyWithPhoto({ source: `./avatars/${getRandomItem(avatarNames)}` });
    }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));