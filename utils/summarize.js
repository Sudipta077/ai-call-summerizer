import 'dotenv/config';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const summarizeCall = async (callDetails, transcript) => {
    console.log('Summarizing call...');

    const systemPrompt = `You are an assistant that summarizes phone call recordings.
You will be given the call metadata (from a webhook payload) and the transcript of the conversation.

IMPORTANT: All textual values in your output (summary, key_points, action_items, topics, sentiment, etc.) MUST be written in English.
If the conversation is in any language other than English, translate the meaning into English when producing the summary.
The "language" field should still report the original detected language of the conversation (e.g., "Hindi", "Spanish", "English").

Return ONLY a valid JSON object with the following fields:
{
  "summary": "a concise 2-4 sentence overview of the call, in English",
  "key_points": ["bullet point in English", "..."],
  "action_items": ["follow-up action in English", "..."],
  "sentiment": "positive | neutral | negative",
  "caller": "number of the caller if available, else null",
  "reciever": "number of the callee if available, else null",
  "topics": ["topic 1 in English", "..."],
}
Do not include any text outside the JSON object.`;

    const userPrompt = `Call metadata: s${JSON.stringify(callDetails, null, 2)}
Transcript: ${transcript}`;

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
        });

        const content = completion.choices[0]?.message?.content || '{}';
        const summary = JSON.parse(content);

           console.log('--- Summary fulll result ---');
        console.log(content);
        console.log('---------------');

        console.log('--- Summary ---');
        console.log(JSON.stringify(summary, null, 2));
        console.log('---------------');

        return summary;
    } catch (err) {
        console.error('Summarization failed:', err?.response?.data || err?.message || err);
        throw err;
    }
};
