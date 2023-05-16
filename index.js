import { descriptions, sounds, usernames, lastNames, names } from './const.js';
import { config } from 'dotenv';
import { getRandomItem, randInt } from './random.js';
import fs from 'fs';
import * as ftp from 'basic-ftp';
import TelegramBot from 'node-telegram-bot-api';


config();

const getVideo = async (outputVideoName, RemotePathToVideo) => {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        })
        await client.downloadTo(outputVideoName, RemotePathToVideo);
    }
    catch(err) {
        console.log(err)
    }
    client.close()
};

const getVideosList = async () => {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    await client.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD,
        secure: false
    })
    await client.cd(process.env.FTP_PATH_TO_CREOS);
    const list = await client.list();
    client.close();

    return list;
};

const removeFile = async (path) => {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    await client.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD,
        secure: false
    })
    await client.remove(path);
    client.close();
};



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

        const list = await getVideosList();
        const videosNames = list.filter(el => el.name.endsWith('.mp4')).map(el => el.name);
        videosNames.length = Number(process.env.VIDEOS_COUNT);

        for (let i = 0; i < videosNames.length; i++) {
            const inputVideoPath = `${process.env.FTP_PATH_TO_CREOS}/${videosNames[i]}`;
            const outputVideoName = `./VIDEO_${randInt()}.mp4`;
            await getVideo(outputVideoName, inputVideoPath);
            fs.readFileSync(outputVideoName, { encoding: 'utf-8' });
            await botVideo.sendVideo(chatId, outputVideoName);
            await removeFile(inputVideoPath);
        }
    }
});