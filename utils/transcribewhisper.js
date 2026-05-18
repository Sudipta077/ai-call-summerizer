import 'dotenv/config';
import fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const transcribeAudio = async (filePath) => {
    console.log('Transcribing:', filePath);

    try {
        const result = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: 'whisper-1',
        });

        console.log('--- Transcription ---');
        console.log(result.text);
        console.log('---------------------');

        return result.text;
    } catch (err) {
        console.error('Transcription failed:', err?.response?.data || err?.message || err);
        throw err;
    }
};
