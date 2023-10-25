import ffmpeg from 'fluent-ffmpeg';
import { lastNames, names, messages } from './const.js';
import { exec } from 'child_process';
import { config } from 'dotenv';
import moment from 'moment';
import { getRandomItem, randInt, randIntInRange } from './random.js';
import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import { getVideo, getVideosList, removeFile } from "./ftp.js";


config();


const CREO_PATH = `${process.env.FTP_PATH_TO_CREOS}/dating/creo`;
const END_PATH = `${process.env.FTP_PATH_TO_CREOS}/dating/end`;
// const command = (outputCreoName, outputEndPath, outputPath) => `ffmpeg -i "${outputCreoName}" -i "${outputEndPath}" -filter_complex "[0:v]scale=464:848,setsar=1[v0];[1:v]scale=464:848,setsar=1[v1];[v0][0:a][v1][1:a]concat=n=2:v=1:a=1[outv][outa]" -map "[outv]" -map "[outa]" -c:v libx264 -c:a aac "${outputPath}"`;

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const rndArray = ['VIDEO', 'MOVIE', 'movie', 'video'];


const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

bot.on('message', async msg => {
    const chatId = msg.chat.id.toString();
    const msgText = msg.text;

    if (chatId === process.env.CHAT1) {

    const endName = await getVideosList(END_PATH)
        .then(async (data) => {
            return getRandomItem(data.filter(el => el.name.endsWith('.mp4')).map(el => el.name));
        });

    let outputEndPath;
    let videosToRemove = [];

    for (let i = 0; i < process.env.VIDEOS_COUNT; i++) {
        await getVideosList(CREO_PATH)
            .then(async (data) => {
                if(i === 0) {
                    const inputEndPath = `${END_PATH}/${endName}`;
                    outputEndPath = `./${getRandomItem(rndArray)}_${randInt()}_end.mp4`;
                    await getVideo(outputEndPath, inputEndPath);
                    await fs.readFile(outputEndPath, { encoding: 'utf-8' }, () => {});
                }
                const creos = data;
                creos.length = Number(process.env.VIDEOS_COUNT);
                const creoName = creos.filter(el => el.name.endsWith('.mp4')).map(el => el.name)[i];
                const inputCreoPath = `${CREO_PATH}/${creoName}`;
                const outputCreoName = `./${getRandomItem(rndArray)}_${randInt()}.mp4`;
                await getVideo(outputCreoName, inputCreoPath);
                await fs.readFile(outputCreoName, { encoding: 'utf-8' }, () => {});

                const outputPath = moment().format('YYYYMMDD_HHmmss') + '.mp4';
                // exec(command(outputCreoName, outputEndPath, outputPath), async (error, stdout, stderr) => {
                //     if (error) {
                //         console.error(`Ошибка: ${error}`);
                //         return;
                //     }
                //     await bot.sendVideo(chatId, outputPath).then(() => videosToRemove.push(inputCreoPath));
                // });

                // ffmpeg()
                //     .input(outputCreoName)
                //     .input(outputEndPath)
                //     .inputOptions('-filter_complex "[0:v]scale=464:848,setsar=1[v0];[1:v]scale=464:848,setsar=1[v1];[v0][0:a][v1][1:a]concat=n=2:v=1:a=1[outv][outa]"')
                //     .outputOptions(['-map "[outv]"', '-map "[outa]"', '-c:v libx264', '-c:a aac'])
                //     .output(outputPath)
                //     .on('end', async () => {
                //         await bot.sendVideo(chatId, outputPath).then(() => videosToRemove.push(inputCreoPath));
                //     })
                //     .on('error', (err) => {
                //         console.error('Ошибка: ' + err.message);
                //     })
                //     .run();

                ffmpeg()
                    .input(outputCreoName)
                    .input(outputEndPath)
                    .complexFilter([
                        '[0:v]scale=464:848,setsar=1[v0]',
                        '[1:v]scale=464:848,setsar=1[v1]',
                        '[v0][0:a][v1][1:a]concat=n=2:v=1:a=1[outv][outa]'
                    ])
                    .outputOptions('-map', '[outv]', '-map', '[outa]')
                    .videoCodec('libx264')
                    .audioCodec('aac')
                    .output(outputPath)
                    .on('end', async () => {
                        await bot.sendVideo(chatId, outputPath).then(() => videosToRemove.push(inputCreoPath));
                    })
                    .on('error', (err) => {
                        console.error('Ошибка: ' + err.message);
                    })
                    .run();

            });
    }
    for (let i = 0; i < videosToRemove.length; i ++) {
        await removeFile(videosToRemove[i])
    }
    }
});
