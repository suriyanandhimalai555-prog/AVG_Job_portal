import pool from '../../config/db.js';

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

    const followTable = `
        CREATE TABLE IF NOT EXISTS user_followers (
            follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (follower_id, following_id)
        );
    `;

    try {
        await pool.query(queryText);
        await pool.query(followTable);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'User';`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES users(id);`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_earnings NUMERIC DEFAULT 0;`);
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
        // FIXED: Destructure role and status, providing defaults if they aren't passed
        const { fullName, email, phone, passwordHash, referralCode, role = 'User', status = 'Active' } = userData;

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

        // FIXED: Inject role and status into the INSERT query
        const query = `
            INSERT INTO users (full_name, email, phone, password_hash, referral_code, referred_by, role, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, full_name, email, phone, referral_code, role, status, created_at;
        `;
        const { rows } = await pool.query(query, [fullName, email, phone, passwordHash, newReferralCode, referredById, role, status]);
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

    getUserStats: async (id) => {
        const checkQuery = 'SELECT referral_code, full_name, referral_earnings FROM users WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) return null;
        let userRow = checkResult.rows[0];

        if (!userRow.referral_code) {
            const namePrefix = userRow.full_name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const generatedCode = `${namePrefix || 'AGILA'}${randomNum}`;

            await pool.query('UPDATE users SET referral_code = $1 WHERE id = $2', [generatedCode, id]);
            userRow.referral_code = generatedCode;
        }

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
    },

    toggleFollow: async (followerId, followingId) => {
        const check = await pool.query('SELECT * FROM user_followers WHERE follower_id = $1 AND following_id = $2', [followerId, followingId]);
        if (check.rows.length > 0) {
            await pool.query('DELETE FROM user_followers WHERE follower_id = $1 AND following_id = $2', [followerId, followingId]);
            return { followed: false };
        } else {
            await pool.query('INSERT INTO user_followers (follower_id, following_id) VALUES ($1, $2)', [followerId, followingId]);
            return { followed: true };
        }
    },

    getFollowStats: async (userId) => {
        const followers = await pool.query('SELECT COUNT(*) FROM user_followers WHERE following_id = $1', [userId]);
        const following = await pool.query('SELECT COUNT(*) FROM user_followers WHERE follower_id = $1', [userId]);
        const followingList = await pool.query('SELECT following_id FROM user_followers WHERE follower_id = $1', [userId]);

        return {
            followers_count: parseInt(followers.rows[0].count),
            following_count: parseInt(following.rows[0].count),
            following_ids: followingList.rows.map(r => r.following_id)
        };
    }
};

export default UserModel;