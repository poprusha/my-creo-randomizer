import { descriptions, sounds, usernames, lastNames, names } from './const.js';
import { config } from "dotenv";
import { getRandomItem } from "./random.js";
import { Telegraf } from "telegraf";
import fs from 'fs';
import * as ftp from 'basic-ftp';
import TelegramBot from 'node-telegram-bot-api';


config();

const getVideo = async (path) => {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        })
        await client.downloadTo('./test.mp4', path);
        // await client.uploadFrom("README.md", "README_FTP.md")
        // await client.downloadTo("README_COPY.md", "README_FTP.md")
    }
    catch(err) {
        console.log(err)
    }
    client.close()
};



// const bot = new Telegraf(process.env.BOT_TOKEN);
const botVideo = new TelegramBot(process.env.BOT_TOKEN, {polling: true});

const avatarsPaths = await fs.promises.readdir('./avatars');
const avatarNames = avatarsPaths.filter(el => el.endsWith('.jpg'));


const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

botVideo.on('message', async msg => {
    const chatId = msg.chat.id.toString();

    if (process.env.WITH_SOUND === 'true') {
        await msg.reply(getRandomItem(sounds));
    }

    if (chatId === process.env.CHAT1 || chatId === process.env.CHAT2) {
        await botVideo.sendMessage(chatId, getRandomItem(usernames));
        await botVideo.sendMessage(chatId, getRandomItem(names) + ' ' + capitalizeFirstLetter(getRandomItem(lastNames)));
        await botVideo.sendMessage(chatId, getRandomItem(descriptions));
        await botVideo.sendPhoto(chatId, `./avatars/${getRandomItem(avatarNames)}`);


        // const videosNames = list.filter(el => el.name.endsWith('.mp4')).map(el => el.name);
        for (let i = 0; i < 1; i++) {
            await getVideo(`/creos/1_video.mp4`);
            // const stream = await ftp.get(`/creos/${videosNames[i]}`);
            // const buffer = await createStream();
            const result = fs.readFileSync('./test.mp4', { encoding: 'utf-8' });
            // const writableStream = fs.createWriteStream(videosNames[i]);
            // const pipe = stream.pipe(writableStream);
            await botVideo.sendVideo(chatId, './test.mp4');

            // await msg.replyWithVideo('./test.mp4');
        }
    }
});

// bot.launch();

// process.once('SIGINT', () => bot.stop('SIGINT'));
// process.once('SIGTERM', () => bot.stop('SIGTERM'));