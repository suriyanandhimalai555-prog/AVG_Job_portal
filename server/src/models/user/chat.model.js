import pool from '../../config/db.js'; // Adjust based on your actual DB config

export const createChatTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS chats (
            id SERIAL PRIMARY KEY,
            sender_id INT NOT NULL,
            receiver_id INT NOT NULL,
            ciphertext TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_sender_receiver ON chats(sender_id, receiver_id);
    `;
    await pool.query(query);
};