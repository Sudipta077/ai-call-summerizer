import pool from '../config/db.js';

export const insertCallLog = async (callDetails, summary) => {
    const payload = callDetails?.payload || {};

    const myoperator_id =
        payload.uuid || payload.call_id || payload.id || null;

    const caller_number = summary?.caller || payload?.caller_number || null;
    const receiver_number = summary?.reciever || payload?.receiver_number || null;

    const allowedSentiments = ['positive', 'neutral', 'negative'];
    const sentiment = allowedSentiments.includes(summary?.sentiment)
        ? summary.sentiment
        : null;

    const summaryText = summary?.summary || null;
    const keyPoints = JSON.stringify(summary?.key_points || []);
    const actionItems = JSON.stringify(summary?.action_items || []);
    const topics = JSON.stringify(summary?.topics || []);

    const sql = `
        INSERT INTO call_details
            (myoperator_id, caller_number, receiver_number, sentiment, summary, key_points, action_items, topics)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            caller_number = VALUES(caller_number),
            receiver_number = VALUES(receiver_number),
            sentiment = VALUES(sentiment),
            summary = VALUES(summary),
            key_points = VALUES(key_points),
            action_items = VALUES(action_items),
            topics = VALUES(topics)
    `;

    try {
        const [result] = await pool.query(sql, [
            myoperator_id,
            caller_number,
            receiver_number,
            sentiment,
            summaryText,
            keyPoints,
            actionItems,
            topics,
        ]);

        console.log('Call log inserted, id:', result.insertId, 'myoperator_id:', myoperator_id);
        return result;
    } catch (err) {
        console.error('Insert call log failed:', err?.message || err);
        throw err;
    }
};
