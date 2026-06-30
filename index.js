import express from 'express'
import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';
import { getRecordingUrl } from './utils/getUrl.js';
import { transcribeAudio } from './utils/transcribe.js';
import { summarizeCall } from './utils/summarize.js';
import { insertCallLog } from './utils/insertCallLog.js';
import { getTodayCalls } from './utils/getTodayCalls.js';
import { summarizeDailyCalls } from './utils/summarizeDailyCalls.js';
import { sendDailySummaryEmail } from './utils/sendDailySummaryEmail.js';
const app = express();
const port = process.env.PORT

app.use(express.json());

app.get('/',(req,res)=>{
    console.log("Hiii")
    res.send("SERVER IS UP & RUNNING")
})

app.post('/webhook',async(req,res)=>{
    res.json({ success: true, message: `Webhook received` });
    

    try{
        console.log("data-->",req.body);
        const recordingFile = req.body?.payload?.recording_filename
        if (!recordingFile) {
            console.log('No recording_filename in payload, skipping download')
            return
        }

        const downloadUrl = await (async () => {
            await new Promise(resolve => setTimeout(resolve, 10000))
            return getRecordingUrl(recordingFile)
        })()

            try {
                const transcription = await transcribeAudio(downloadUrl)

                console.log("transcription--->",transcription)

                const summary = await summarizeCall(req.body, transcription)
                console.log("summary eeeee--->", summary)

                await insertCallLog(req.body, summary)

                const allCallDetails  =  await getTodayCalls();
                const overAllSummary = await summarizeDailyCalls(allCallDetails)
                console.log("overAllSummary--->", overAllSummary)

                await sendDailySummaryEmail(overAllSummary)


            } catch (err) {
                console.log('Transcribe error =>', err?.message || err)
            }
    }
    catch(err){
        console.log("error - >",err?.message || err)
    }
})

app.listen(port,()=>{
    console.log(`Server is running at ${port}`)
})