import 'dotenv/config';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const transcribeAudio = async (downloadUrl) => {
    console.log('Transcribing (Groq):', downloadUrl);

    try {
        const result = await groq.audio.transcriptions.create({
            url: downloadUrl,
            model: 'whisper-large-v3',
        });

        return result.text;
    } catch (err) {
        console.error('Transcription failed:', err?.response?.data || err?.message || err);
        throw err;
    }
};
