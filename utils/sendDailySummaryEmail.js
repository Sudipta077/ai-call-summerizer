import 'dotenv/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAIL = 'sudipta@lifesciencetrust.com'; // <-- add the recipient email address here
const FROM_EMAIL = 'onboarding@resend.dev';

export const sendDailySummaryEmail = async (overAllSummary) => {
    if (!overAllSummary) {
        console.log('No overAllSummary to email, skipping.');
        return null;
    }

    if (!TO_EMAIL) {
        console.log('TO_EMAIL is empty in sendDailySummaryEmail.js, skipping send.');
        return null;
    }

    const subject = `Daily Call Summary${overAllSummary?.date ? ` - ${overAllSummary.date}` : ''}`;

    const html = buildHtml(overAllSummary);

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: TO_EMAIL,
            subject,
            html,
        });

        if (error) {
            console.error('Resend send failed:', error);
            throw error;
        }

        console.log('Daily summary email sent, id:', data?.id);
        return data;
    } catch (err) {
        console.error('sendDailySummaryEmail failed:', err?.message || err);
        throw err;
    }
};

const buildHtml = (s) => {
    const sb = s?.sentiment_breakdown || {};
    const topics = Array.isArray(s?.top_topics) ? s.top_topics : [];
    const highlights = Array.isArray(s?.key_highlights) ? s.key_highlights : [];

    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
            <h2>Daily Call Summary${s?.date ? ` &mdash; ${s.date}` : ''}</h2>
            <p><strong>Total calls:</strong> ${s?.total_calls ?? 'N/A'}</p>

            <h3>Overall summary</h3>
            <p>${s?.overall_summary || ''}</p>

            <h3>Sentiment breakdown</h3>
            <ul>
                <li>Positive: ${sb.positive ?? 0}</li>
                <li>Neutral: ${sb.neutral ?? 0}</li>
                <li>Negative: ${sb.negative ?? 0}</li>
            </ul>

            <h3>Top topics</h3>
            <ul>
                ${topics.map((t) => `<li>${t}</li>`).join('') || '<li>None</li>'}
            </ul>

            <h3>Key highlights</h3>
            <ul>
                ${highlights.map((h) => `<li>${h}</li>`).join('') || '<li>None</li>'}
            </ul>
        </div>
    `;
};
