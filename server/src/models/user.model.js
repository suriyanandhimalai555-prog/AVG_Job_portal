import pool from '../config/db.js';

// 1. Automated Table Creation Logic
export const createUserTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            full_name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(20),
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(queryText);
        console.log('✅ Users table is ready (created if not exists).');
    } catch (error) {
        console.error('❌ Error creating users table:', error);
    }
};

// 2. Existing Model Queries
const UserModel = {
    findByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        return rows[0];
    },

    create: async (userData) => {
        const { fullName, email, phone, passwordHash } = userData;
        const query = `
            INSERT INTO users (full_name, email, phone, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING id, full_name, email, phone, created_at;
        `;
        const values = [fullName, email, phone, passwordHash];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }
};

export default UserModel;