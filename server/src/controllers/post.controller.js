import pool from '../config/db.js';

export const createPost = async (req, res) => {
    try {
        const { userId, authorName, authorTitle, content, image } = req.body;
        const result = await pool.query(
            'INSERT INTO posts (user_id, author_name, author_title, content, image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, authorName, authorTitle || 'Job Seeker', content, image]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPosts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, 
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comments_count,
            COALESCE((
                SELECT json_agg(json_build_object('id', pc.id, 'author_name', pc.author_name, 'content', pc.content))
                FROM post_comments pc WHERE pc.post_id = p.id
            ), '[]'::json) as comments_data
            FROM posts p
            ORDER BY p.created_at DESC
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;
        const check = await pool.query('SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
        
        if (check.rows.length > 0) {
            await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
            res.status(200).json({ message: 'Unliked', liked: false });
        } else {
            await pool.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
            res.status(200).json({ message: 'Liked', liked: true });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, authorName, content } = req.body;
        const result = await pool.query(
            'INSERT INTO post_comments (post_id, user_id, author_name, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [postId, userId, authorName, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const sharePost = async (req, res) => {
    try {
        const { postId } = req.params;
        await pool.query('UPDATE posts SET share_count = share_count + 1 WHERE id = $1', [postId]);
        res.status(200).json({ message: 'Shared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};