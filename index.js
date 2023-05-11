import { descriptions, sounds, usernames } from './const.js';
import { config } from "dotenv";
import TelegramBot from 'node-telegram-bot-api';
import { getRandomItem } from "./random.js";

config();

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});


bot.on('message', async msg => {
    const chatId = msg.chat.id.toString();

    if (chatId === process.env.CHAT1 || chatId === process.env.CHAT2) {
        await bot.sendMessage(chatId, getRandomItem(usernames));
        await bot.sendMessage(chatId, getRandomItem(descriptions));

        if (process.env.WITH_SOUND === 'true') {
            await bot.sendMessage(chatId, getRandomItem(sounds));
        }
    }
});
