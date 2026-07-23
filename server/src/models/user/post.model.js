import pool from '../../config/db.js';

export const createPostTables = async () => {
    const postsTable = `
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            author_name VARCHAR(255) NOT NULL,
            author_title VARCHAR(255),
            content TEXT NOT NULL,
            image TEXT,
            images JSONB DEFAULT '[]'::jsonb,
            share_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const likesTable = `
        CREATE TABLE IF NOT EXISTS post_likes (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL,
            reaction_type VARCHAR(50) DEFAULT 'like',
            UNIQUE(post_id, user_id)
        );
    `;

    const commentsTable = `
        CREATE TABLE IF NOT EXISTS post_comments (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL,
            author_name VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(postsTable);
        await pool.query(likesTable);
        await pool.query(commentsTable);

        await pool.query(`ALTER TABLE post_likes ADD COLUMN IF NOT EXISTS reaction_type VARCHAR(50) DEFAULT 'like'`);
        await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb`);
    } catch (error) {
        console.error("Error creating post tables:", error.message);
    }
};