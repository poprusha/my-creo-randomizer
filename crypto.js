import ffmpeg from 'fluent-ffmpeg';
import { lastNames, names, messages } from './const.js';
import { config } from 'dotenv';
import { getRandomItem, randInt, randIntInRange } from './random.js';
import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import { getVideo, getVideosList, removeFile } from "./ftp.js";


config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const rndArray = ['IMG', 'IMAGE', 'PHOTO', 'img', 'image', 'photo'];


const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

bot.on('message', async msg => {
    const chatId = msg.chat.id.toString();
    const msgText = msg.text;

    if (chatId === process.env.CHAT1 || chatId === process.env.CHAT2 || chatId === process.env.CHAT3) {
        const username = getRandomItem(names) + ' ' + capitalizeFirstLetter(getRandomItem(lastNames));
        await bot.sendMessage(chatId, username);
        await bot.sendMessage(chatId, getRandomItem(names).toLowerCase() + getRandomItem(lastNames) + '_' + 'crypto');

        for (let k = 0; k < 6; k++) {
            let mediaArray = [];
            for (let i = 0; i < 8; i++) {
                const currentFolderIndex = i + 1;

                await getVideosList(`${process.env.FTP_PATH_TO_CREOS}/crt/${msgText}/${currentFolderIndex}`)
                    .then(async (data) => {
                        const isWithoutText = currentFolderIndex === 2;
                        const photoNames = data.filter(el => el.name.endsWith('.jpg')).map(el => el.name);
                        const inputPhotoPath = `${process.env.FTP_PATH_TO_CREOS}/crt/${msgText}/${currentFolderIndex}/${getRandomItem(photoNames)}`;
                        const outputPhotoName = `./IMAGE_${randInt()}.jpg`;
                        await getVideo(outputPhotoName, inputPhotoPath);
                        fs.readFileSync(outputPhotoName, { encoding: 'utf-8' });

                        const outputPath = `./IMAGE_${randInt()}_output.jpg`;
                        const fontFile = `./fonts/${randIntInRange(1, 3)}.ttf`;

                        isWithoutText
                            ? mediaArray.push({
                                type: 'photo',
                                media: outputPhotoName,
                            })
                            : await ffmpeg(outputPhotoName)
                            .videoFilters([
                                {
                                    filter: 'drawtext',
                                    options: {
                                        text: getRandomItem(messages(msgText)[currentFolderIndex]),
                                        x: 100,
                                        y: 100,
                                        fontsize: randIntInRange(32, 38),
                                        fontcolor: 'black',
                                        box: 1,
                                        boxcolor: 'white@0.7',
                                        boxborderw: 20,
                                        fontfile: fontFile,
                                    },
                                }
                            ])
                            .output(outputPath)
                            .on('end', async () => {
                                console.log('Конвертация завершена');

                                mediaArray.push({
                                    type: 'photo',
                                    media: outputPath,
                                });
                            })
                            .on('error', (err) => {
                                console.error('Ошибка при конвертации:', err);
                            })
                            .run();
                        // await removeFile(inputPhotoPath);

                        // await bot.sendMediaGroup(chatId, mediaArray);
                    })
                    .catch(async () => await bot.sendMessage(chatId, 'Error'));
            }
            console.log('mediaArray: ', mediaArray)
            await bot.sendMediaGroup(chatId, mediaArray);
        }
    }
});