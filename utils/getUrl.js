import 'dotenv/config';
import axios from 'axios';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// MyOperator publishes the recording a short while after the call ends,
// so the webhook usually beats the file. Retry while the API says
// "no voice file found", then give up.
export const getRecordingUrl = async (
    fileName,
    { maxAttempts = 4, initialDelayMs = 10000 } = {}
) => {
    console.log('filename-->', fileName);

    let lastBody = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await axios.get(
                'https://developers.myoperator.co/recordings/link',
                {
                    params: {
                        token: process.env.MYOPERATOR_TEST_API_TOKEN,
                        file: fileName,
                    },
                }
            );

            console.log('response to get url --->', response?.data);

            if (response.data?.status === 'success') {
                return response?.data?.url;
            }

            lastBody = response.data;
        } catch (error) {
            const body = error.response?.data;
            lastBody = body || error.message;

            const notReadyYet =
                body?.code === 404 &&
                /no voice file/i.test(body?.message || '');

            if (!notReadyYet) {
                console.error('Error getting recording URL:', body || error.message);
                throw error;
            }

            console.log(
                `Attempt ${attempt}/${maxAttempts}: recording not ready yet on MyOperator, retrying...`
            );
        }

        if (attempt < maxAttempts) {
            await sleep(initialDelayMs * attempt);
        }
    }

    throw new Error(
        `Recording still unavailable after ${maxAttempts} attempts: ${JSON.stringify(lastBody)}`
    );
};
