import pool from '../config/db.js';

// Automated Table Creation Logic
export const createBusinessTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS businesses (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            location VARCHAR(255) NOT NULL,
            status VARCHAR(50) DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(queryText);
        console.log('✅ Businesses table is ready.');
    } catch (error) {
        console.error('❌ Error creating businesses table:', error);
    }
};

const BusinessModel = {
    getAll: async () => {
        const query = 'SELECT * FROM businesses ORDER BY created_at DESC';
        const { rows } = await pool.query(query);
        return rows;
    },

    create: async (data) => {
        const { name, category, location, status } = data;
        const query = `
            INSERT INTO businesses (name, category, location, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [name, category, location, status]);
        return rows[0];
    },

    update: async (id, data) => {
        const { name, category, location, status } = data;
        const query = `
            UPDATE businesses 
            SET name = $1, category = $2, location = $3, status = $4 
            WHERE id = $5 
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [name, category, location, status, id]);
        return rows[0];
    },

    delete: async (id) => {
        const query = 'DELETE FROM businesses WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    }
};

export default BusinessModel;