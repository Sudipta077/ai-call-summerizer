import 'dotenv/config';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const summarizeDailyCalls = async (calls) => {
    console.log('Summarizing daily calls...', 'count:', calls?.length || 0);

    if (!Array.isArray(calls) || calls.length === 0) {
        console.log('No calls to summarize for today.');
        return null;
    }

    const compactCalls = calls.map((c) => ({
        caller_number: c.caller_number,
        receiver_number: c.receiver_number,
        sentiment: c.sentiment,
        summary: c.summary,
        key_points: safeParse(c.key_points),
        topics: safeParse(c.topics),
    }));

    const systemPrompt = `You are an assistant that produces a daily roll-up report from a list of phone call summaries.
You will be given an array of individual call summaries for a single day.

IMPORTANT: All textual values in your output MUST be written in English.

Return ONLY a valid JSON object with the following fields:
{
  "date": "DD-MM-YYYY of the day being summarized",
  "total_calls": number,
  "overall_summary": "a 4-6 sentence narrative of the day's calls as a whole, in English",
  "sentiment_breakdown": { "positive": number, "neutral": number, "negative": number },
  "top_topics": ["topic 1", "topic 2", "..."],
  "key_highlights": ["notable point across calls in English", "..."],
}
Do not include any text outside the JSON object.`;

    const userPrompt = `Today's calls (JSON array):
${JSON.stringify(compactCalls, null, 2)}`;

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
        const dailySummary = JSON.parse(content);

        console.log('--- Daily summary full result ---');
        console.log(content);
        console.log('---------------');

        console.log('--- Daily summary ---');
        console.log(JSON.stringify(dailySummary, null, 2));
        console.log('---------------');

        return dailySummary;
    } catch (err) {
        console.error('Daily summarization failed:', err?.response?.data || err?.message || err);
        throw err;
    }
};

const safeParse = (val) => {
    if (val == null) return [];
    if (Array.isArray(val) || typeof val === 'object') return val;
    try {
        return JSON.parse(val);
    } catch {
        return [];
    }
};
