import express from 'express';
import pool from '../../config/db.js'; // Adjust path if needed
import { verifyToken } from '../../middleware/auth.middleware.js'; // Adjust path if needed

const router = express.Router();

// 1. Fetch historical contacts for a user (Fixes the Dashboard Live Messages issue)
router.get('/contacts/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;
    try {
        // Safe query: Requests u.* instead of forcing strict column names that might crash
        const query = `
            WITH RecentChats AS (
                SELECT 
                    CASE 
                        WHEN sender_id = $1 THEN receiver_id 
                        ELSE sender_id 
                    END AS contact_id,
                    ciphertext,
                    created_at,
                    ROW_NUMBER() OVER(
                        PARTITION BY 
                            CASE 
                                WHEN sender_id = $1 THEN receiver_id 
                                ELSE sender_id 
                            END 
                        ORDER BY created_at DESC
                    ) as rn
                FROM chats
                WHERE sender_id = $1 OR receiver_id = $1
            )
            SELECT 
                rc.contact_id AS id,
                rc.ciphertext AS "lastMessage",
                u.*
            FROM RecentChats rc
            JOIN users u ON u.id = rc.contact_id
            WHERE rc.rn = 1
            ORDER BY rc.created_at DESC;
        `;
        const { rows } = await pool.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching contacts:", err);
        res.status(500).json({ error: "Failed to fetch contacts" });
    }
});

// 2. Fetch ordered chat history between two specific users
router.get('/history/:user1/:user2', verifyToken, async (req, res) => {
    const { user1, user2 } = req.params;
    try {
        const query = `
            SELECT * FROM chats 
            WHERE (sender_id = $1 AND receiver_id = $2) 
               OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY created_at ASC
            LIMIT 100;
        `;
        const { rows } = await pool.query(query, [user1, user2]);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching chat history:", err);
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
});

export default router;