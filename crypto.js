import { lastNames, names } from './const.js';
import { config } from 'dotenv';
import { getRandomItem, randInt } from './random.js';
import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import { getVideo, getVideosList, removeFile } from "./ftp.js";

config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const rndArray = ['IMG', 'IMAGE', 'PHOTO', 'img', 'image', 'photo'];


const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

bot.on('message', async msg => {
    const chatId = msg.chat.id.toString();

    if (chatId === process.env.CHAT1 || chatId === process.env.CHAT2) {
        const username = getRandomItem(names) + ' ' + capitalizeFirstLetter(getRandomItem(lastNames));
        await bot.sendMessage(chatId, username);
        await bot.sendMessage(chatId, getRandomItem(names).toLowerCase() + getRandomItem(lastNames) + '_' + 'crypto');

        for (let k = 0; k < 6; k++) {
            let mediaArray = [];
            for (let i = 0; i < 7; i++) {
                const currentFolderIndex = i + 1;

                await getVideosList(`${process.env.FTP_PATH_TO_CREOS}/cr/${currentFolderIndex}`)
                    .then(async (data) => {
                        const photoNames = data.filter(el => el.name.endsWith('.jpg')).map(el => el.name);
                        const inputPhotoPath = `${process.env.FTP_PATH_TO_CREOS}/cr/${currentFolderIndex}/${getRandomItem(photoNames)}`;
                        const outputPhotoName = `./${getRandomItem(rndArray)}_${randInt()}.jpg`;
                        await getVideo(outputPhotoName, inputPhotoPath);
                        fs.readFileSync(outputPhotoName, { encoding: 'utf-8' });
                        mediaArray.push({
                            type: 'photo',
                            media: outputPhotoName,
                        });
                        // await bot.sendMediaGroup(chatId, mediaArray);
                    })
                    .catch(async () => await bot.sendMessage(chatId, 'Error'));
            }
            await bot.sendMediaGroup(chatId, mediaArray);
        }
    }
});