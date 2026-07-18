import pool from '../config/db.js';

export const createJobTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS jobs (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            company VARCHAR(255) NOT NULL,
            location VARCHAR(255) DEFAULT 'Not specified',
            type VARCHAR(100) NOT NULL,
            status VARCHAR(50) DEFAULT 'Active',
            experience VARCHAR(100) DEFAULT 'Not specified',
            salary VARCHAR(100) DEFAULT 'Not Disclosed',
            openings INTEGER DEFAULT 1,
            applicants INTEGER DEFAULT 0,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // Auto-patch to add the description column to your existing table
    const alterQueryText = `
        ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description TEXT;
    `;

    try {
        await pool.query(queryText);
        await pool.query(alterQueryText);
        console.log('✅ Jobs table is ready and patched with description field.');
    } catch (error) {
        console.error('❌ Error creating/updating jobs table:', error);
    }
};

const JobModel = {
    getAll: async () => {
        const query = 'SELECT * FROM jobs ORDER BY created_at DESC';
        const { rows } = await pool.query(query);
        return rows;
    },

    create: async (data) => {
        const { title, company, location, type, status, experience, salary, openings, description } = data;
        const query = `
            INSERT INTO jobs (title, company, location, type, status, experience, salary, openings, applicants, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9)
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [
            title,
            company,
            location || 'Not specified',
            type,
            status,
            experience || 'Not specified',
            salary || 'Not Disclosed',
            openings || 1,
            description || ''
        ]);
        return rows[0];
    },

    update: async (id, data) => {
        const { title, company, location, type, status, experience, salary, openings, description } = data;
        const query = `
            UPDATE jobs 
            SET title = $1, company = $2, location = $3, type = $4, status = $5, experience = $6, salary = $7, openings = $8, description = $9
            WHERE id = $10 
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [
            title,
            company,
            location,
            type,
            status,
            experience,
            salary,
            openings,
            description || '',
            id
        ]);
        return rows[0];
    },

    delete: async (id) => {
        const query = 'DELETE FROM jobs WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    },

    incrementApplicants: async (id) => {
        const query = 'UPDATE jobs SET applicants = applicants + 1 WHERE id = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
};

export default JobModel;