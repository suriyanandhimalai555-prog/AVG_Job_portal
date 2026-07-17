import pool from '../config/db.js';

export const createUserTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            full_name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(20),
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'User',
            status VARCHAR(50) DEFAULT 'Active',
            referral_code VARCHAR(50) UNIQUE,
            referred_by INTEGER REFERENCES users(id),
            referral_earnings NUMERIC DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(queryText);
        // Automatically add missing columns for existing tables
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'User';`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES users(id);`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_earnings NUMERIC DEFAULT 0;`);
        console.log('✅ Users table is ready.');
    } catch (error) {
        console.error('❌ Error creating users table:', error);
    }
};

const UserModel = {
    getAll: async () => {
        const query = 'SELECT id, full_name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC';
        const { rows } = await pool.query(query);
        return rows;
    },

    findByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        return rows[0];
    },

    create: async (userData) => {
        const { fullName, email, phone, passwordHash, referralCode } = userData;

        // Generate a unique referral code
        const namePrefix = fullName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const newReferralCode = `${namePrefix || 'AGILA'}${randomNum}`;

        let referredById = null;

        if (referralCode) {
            const refQuery = 'SELECT id FROM users WHERE referral_code = $1';
            const refResult = await pool.query(refQuery, [referralCode.toUpperCase()]);

            if (refResult.rows.length > 0) {
                referredById = refResult.rows[0].id;
                await pool.query('UPDATE users SET referral_earnings = referral_earnings + 50 WHERE id = $1', [referredById]);
            }
        }

        const query = `
            INSERT INTO users (full_name, email, phone, password_hash, referral_code, referred_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, full_name, email, phone, referral_code, created_at;
        `;
        const values = [fullName, email, phone, passwordHash, newReferralCode, referredById];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    update: async (id, data) => {
        const { full_name, email, phone, role, status } = data;
        const query = `
            UPDATE users 
            SET full_name = $1, email = $2, phone = $3, role = $4, status = $5
            WHERE id = $6 
            RETURNING id, full_name, email, phone, role, status;
        `;
        const { rows } = await pool.query(query, [full_name, email, phone, role, status, id]);
        return rows[0];
    },

    delete: async (id) => {
        const query = 'DELETE FROM users WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    },

    // Self-healing logic for old user accounts with null codes
    getUserStats: async (id) => {
        const checkQuery = 'SELECT referral_code, full_name, referral_earnings FROM users WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) return null;

        let userRow = checkResult.rows[0];

        // If the old user doesn't have a code yet, generate and save it now!
        if (!userRow.referral_code) {
            const namePrefix = userRow.full_name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const generatedCode = `${namePrefix || 'AGILA'}${randomNum}`;

            await pool.query('UPDATE users SET referral_code = $1 WHERE id = $2', [generatedCode, id]);
            userRow.referral_code = generatedCode;
        }

        // Fixed: Removed the stray "ƒ√" from the end of this query
        const statsQuery = `
            SELECT 
                $1::varchar as referral_code, 
                u.referral_earnings,
                (SELECT COUNT(*) FROM users WHERE referred_by = u.id) as total_referrals
            FROM users u
            WHERE u.id = $2;
        `;
        const { rows } = await pool.query(statsQuery, [userRow.referral_code, id]);
        return rows[0];
    }
};

export default UserModel;