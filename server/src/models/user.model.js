import pool from '../config/db.js';

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