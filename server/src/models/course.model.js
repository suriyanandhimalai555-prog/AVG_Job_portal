import pool from '../config/db.js';

// Automated Table Creation Logic
export const createCourseTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS courses (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            price VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(queryText);
        console.log('✅ Courses table is ready.');
    } catch (error) {
        console.error('❌ Error creating courses table:', error);
    }
};

const CourseModel = {
    getAll: async () => {
        const query = 'SELECT * FROM courses ORDER BY created_at DESC';
        const { rows } = await pool.query(query);
        return rows;
    },

    create: async (data) => {
        const { title, category, price, status } = data;
        const query = `
            INSERT INTO courses (title, category, price, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [title, category, price, status]);
        return rows[0];
    },

    update: async (id, data) => {
        const { title, category, price, status } = data;
        const query = `
            UPDATE courses 
            SET title = $1, category = $2, price = $3, status = $4 
            WHERE id = $5 
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [title, category, price, status, id]);
        return rows[0];
    },

    delete: async (id) => {
        const query = 'DELETE FROM courses WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    }
};

export default CourseModel;