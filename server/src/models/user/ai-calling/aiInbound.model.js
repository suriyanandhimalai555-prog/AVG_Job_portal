import pool from '../../../config/db.js';

export const createAIInboundTables = async () => {
    const queries = `
        CREATE TABLE IF NOT EXISTS ai_inbound_numbers (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL,
            phone_number VARCHAR(20) NOT NULL,
            purpose VARCHAR(100),
            agent_name VARCHAR(50),
            status VARCHAR(20) DEFAULT 'Online',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ai_call_logs (
            id VARCHAR(50) PRIMARY KEY,
            user_id INT NOT NULL,
            customer_name VARCHAR(100),
            phone VARCHAR(20),
            call_type VARCHAR(20),
            purpose VARCHAR(100),
            call_date DATE DEFAULT CURRENT_DATE,
            call_time VARCHAR(20),
            duration VARCHAR(20),
            status VARCHAR(50),
            intent VARCHAR(50),
            sentiment VARCHAR(50),
            score INT,
            outcome VARCHAR(100),
            follow_up VARCHAR(50),
            appointment VARCHAR(50),
            recording_url TEXT,
            summary TEXT,
            transcript JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(queries);
        console.log('✅ AI Inbound tables configured successfully.');
    } catch (error) {
        console.error('❌ Error creating AI Inbound tables:', error);
    }
};

const AIInboundModel = {
    seedInitialInboundData: async (userId) => {
        const check = await pool.query('SELECT COUNT(*) FROM ai_inbound_numbers WHERE user_id = $1', [userId]);
        if (parseInt(check.rows[0].count) === 0) {
            await pool.query(`INSERT INTO ai_inbound_numbers (user_id, phone_number, purpose, agent_name) VALUES 
                ($1, '+91 98765 12345', 'General Support & Billing', 'Support AI'),
                ($1, '+91 87654 32109', 'Candidate Inquiries (HR)', 'Recruiter AI')`, [userId]);
        }

        const checkLogs = await pool.query("SELECT COUNT(*) FROM ai_call_logs WHERE user_id = $1 AND call_type = 'Inbound'", [userId]);
        if (parseInt(checkLogs.rows[0].count) === 0) {
            const transcript1 = JSON.stringify([
                { speaker: 'AI', text: 'Thank you for calling support. How can I help you today?' },
                { speaker: 'Jordan', text: 'I need help resetting my account password.' },
                { speaker: 'AI', text: 'I can help with that. I have sent a secure reset link to your registered email.' }
            ]);

            await pool.query(`INSERT INTO ai_call_logs 
                (id, user_id, customer_name, phone, call_type, purpose, call_time, duration, status, intent, sentiment, score, outcome, follow_up, appointment, summary, transcript) 
                VALUES 
                ('AI-10292', $1, 'Jordan Smith', '+91 98765 43210', 'Inbound', 'Customer Support', '10:05 AM', '02:15', 'Resolved', 'Support', 'Neutral', 85, 'Issue Resolved', 'None', 'None', 'Customer requested password reset. AI securely authenticated and dispatched reset protocol.', $2)
            `, [userId, transcript1]);
        }
    },

    getInboundNumbers: async (userId) => {
        const { rows } = await pool.query('SELECT * FROM ai_inbound_numbers WHERE user_id = $1 ORDER BY id ASC', [userId]);
        return rows;
    },

    getCallLogs: async (userId, type = null) => {
        let query = 'SELECT * FROM ai_call_logs WHERE user_id = $1';
        const params = [userId];
        if (type) {
            query += ' AND call_type = $2';
            params.push(type);
        }
        query += ' ORDER BY created_at DESC';
        const { rows } = await pool.query(query, params);

        return rows.map(row => ({
            ...row,
            date: row.call_date ? new Date(row.call_date).toISOString().split('T')[0] : 'Today',
            time: row.call_time,
            customer: row.customer_name
        }));
    },

    simulateIncomingCall: async (userId) => {
        const newId = 'AI-' + Math.floor(10000 + Math.random() * 90000);
        const transcript = JSON.stringify([
            { speaker: 'AI', text: 'Hello, you have reached Agila Vetri. How can I assist you today?' },
            { speaker: 'Customer', text: 'Hi, I would like to know the status of my recent application.' },
            { speaker: 'AI', text: 'Let me check that for you right away.' }
        ]);

        const query = `INSERT INTO ai_call_logs 
            (id, user_id, customer_name, phone, call_type, purpose, call_time, duration, status, intent, sentiment, score, outcome, follow_up, appointment, summary, transcript) 
            VALUES ($1, $2, 'Simulated Caller', '+91 99999 00000', 'Inbound', 'Inquiry', TO_CHAR(CURRENT_TIMESTAMP, 'HH12:MI AM'), '01:30', 'Resolved', 'Support', 'Positive', 95, 'Handled', 'None', 'None', 'Simulated inbound call handled gracefully.', $3) RETURNING *`;

        const { rows } = await pool.query(query, [newId, userId, transcript]);
        const row = rows[0];

        return {
            ...row,
            date: row.call_date ? new Date(row.call_date).toISOString().split('T')[0] : 'Today',
            time: row.call_time,
            customer: row.customer_name
        };
    }
};

export default AIInboundModel;