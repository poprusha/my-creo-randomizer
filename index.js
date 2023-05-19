import { descriptions, sounds, usernames, lastNames, names } from './const.js';
import { config } from 'dotenv';
import { getRandomItem, randInt } from './random.js';
import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import { getVideo, getVideosList, removeFile } from "./ftp.js";


config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const avatarsPaths = await fs.promises.readdir('./avatars');
const avatarNames = avatarsPaths.filter(el => el.endsWith('.jpg'));


const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

bot.on('message', async msg => {
    const chatId = msg.chat.id.toString();
    const msgText = msg.text.split(':');
    const creoGeo = msgText[0];
    const crepFolder = msgText[1];

    if (chatId === process.env.CHAT1 || chatId === process.env.CHAT2) {
        await getVideosList(`${process.env.FTP_PATH_TO_CREOS}/${creoGeo}/${crepFolder}`)
            .then(async (data) => {
                const username = getRandomItem(names) + ' ' + capitalizeFirstLetter(getRandomItem(lastNames));

                if (process.env.WITH_SOUND === 'true') {
                    await msg.reply(getRandomItem(sounds));
                }

                await bot.sendMessage(chatId, getRandomItem(usernames));
                await bot.sendMessage(chatId, username);
                await bot.sendMessage(chatId, username.split(' ').join('_').toLowerCase());
                await bot.sendMessage(chatId, getRandomItem(descriptions));
                await bot.sendPhoto(chatId, `./avatars/${getRandomItem(avatarNames)}`);

                const videosNames = data.filter(el => el.name.endsWith('.mp4')).map(el => el.name);
                videosNames.length = Number(process.env.VIDEOS_COUNT);

                for (let i = 0; i < videosNames.length; i++) {
                    const inputVideoPath = `${process.env.FTP_PATH_TO_CREOS}/${creoGeo}/${crepFolder}/${videosNames[i]}`;
                    const outputVideoName = `./VIDEO_${randInt()}.mp4`;
                    await getVideo(outputVideoName, inputVideoPath);
                    fs.readFileSync(outputVideoName, { encoding: 'utf-8' });
                    await bot.sendVideo(chatId, outputVideoName);
                    await removeFile(inputVideoPath);
                }
            })
            .catch(async () => await bot.sendMessage(chatId, 'Данная директория на FTP не найдена'));
    }
});