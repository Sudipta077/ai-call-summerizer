import pool from '../config/db.js';

export const getTodayCalls = async () => {
    const sql = `
        SELECT *
        FROM call_details
        WHERE DATE(call_time) = CURDATE()
    `;

    try {
        const [rows] = await pool.query(sql);
        console.log('Today\'s call_details rows:', rows);
        return rows;
    } catch (err) {
        console.error('Fetch today call_details failed:', err?.message || err);
        throw err;
    }
};
