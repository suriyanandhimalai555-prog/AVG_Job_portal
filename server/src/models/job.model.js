import pool from '../config/db.js';

// Automated Table Creation Logic
export const createJobTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS jobs (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            company VARCHAR(255) NOT NULL,
            type VARCHAR(100) NOT NULL,
            status VARCHAR(50) DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(queryText);
        console.log('✅ Jobs table is ready.');
    } catch (error) {
        console.error('❌ Error creating jobs table:', error);
    }
};

const JobModel = {
    getAll: async () => {
        const query = 'SELECT * FROM jobs ORDER BY created_at DESC';
        const { rows } = await pool.query(query);
        return rows;
    },

    create: async (data) => {
        const { title, company, type, status } = data;
        const query = `
            INSERT INTO jobs (title, company, type, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [title, company, type, status]);
        return rows[0];
    },

    update: async (id, data) => {
        const { title, company, type, status } = data;
        const query = `
            UPDATE jobs 
            SET title = $1, company = $2, type = $3, status = $4 
            WHERE id = $5 
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [title, company, type, status, id]);
        return rows[0];
    },

    delete: async (id) => {
        const query = 'DELETE FROM jobs WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    }
};

export default JobModel;