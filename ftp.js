import * as ftp from 'basic-ftp';
import { config } from 'dotenv';

config();

const getFptClient = async () => {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        })
    }
    catch(err) {
        console.log(err)
    }

    return client;
};

export const getVideo = async (localVideoPath, remotePathToVideo) => {
    const client = await getFptClient();

    try {
        await client.downloadTo(localVideoPath, remotePathToVideo);
    }
    catch(err) {
        console.log(err);
    }

    client.close();
};

export const getVideosList = async () => {
    const client = await getFptClient();

    await client.cd(process.env.FTP_PATH_TO_CREOS);
    const list = await client.list();
    client.close();

    return list;
};

export const removeFile = async (path) => {
    const client = await getFptClient();

    await client.remove(path);
    client.close();
};

export const addVideo = async (localVideoPath, remotePathToVideo) => {
    const client = await getFptClient();

    try {
        await client.uploadFrom(localVideoPath, remotePathToVideo);
    }
    catch(err) {
        console.log(err);
    }

    client.close();
}