import pool from '../config/db.js';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from 'crypto';

// Initialize AWS S3 Client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Helper function to upload multiple base64 images to S3
const uploadImagesToS3 = async (imagesArray) => {
    if (!imagesArray || !Array.isArray(imagesArray)) return [];

    const uploadedUrls = [];
    for (const img of imagesArray) {
        if (img.startsWith('http')) {
            // Already an uploaded URL (used during edits)
            uploadedUrls.push(img);
        } else if (img.startsWith('data:image')) {
            // Process base64 string
            const matches = img.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const buffer = Buffer.from(matches[2], 'base64');
                const extension = matches[1].split('/')[1] || 'jpg';
                const fileName = `posts/${crypto.randomBytes(16).toString('hex')}.${extension}`;

                const command = new PutObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: fileName,
                    Body: buffer,
                    ContentType: matches[1]
                });

                await s3.send(command);
                const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
                uploadedUrls.push(s3Url);
            }
        }
    }
    return uploadedUrls;
};

export const createPost = async (req, res) => {
    try {
        const { userId, authorName, authorTitle, content, images } = req.body;
        let uId = parseInt(userId, 10);
        if (isNaN(uId)) uId = 0;

        const uploadedImages = await uploadImagesToS3(images || []);

        const result = await pool.query(
            'INSERT INTO posts (user_id, author_name, author_title, content, images) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [uId, authorName, authorTitle || 'Job Seeker', content, JSON.stringify(uploadedImages)]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Create post error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getPosts = async (req, res) => {
    try {
        let userId = parseInt(req.query.userId, 10);
        if (isNaN(userId)) userId = 0;

        const result = await pool.query(`
            SELECT p.*, 
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comments_count,
            (SELECT reaction_type FROM post_likes WHERE post_id = p.id AND user_id = $1 LIMIT 1) as user_reaction,
            COALESCE((
                SELECT json_agg(DISTINCT reaction_type)
                FROM post_likes WHERE post_id = p.id AND reaction_type IS NOT NULL
            ), '[]'::json) as reaction_types,
            COALESCE((
                SELECT json_agg(json_build_object('id', pc.id, 'author_name', pc.author_name, 'content', pc.content, 'created_at', pc.created_at) ORDER BY pc.created_at ASC)
                FROM post_comments pc WHERE pc.post_id = p.id
            ), '[]'::json) as comments_data
            FROM posts p
            ORDER BY p.created_at DESC
        `, [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Get posts error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, reactionType = 'like' } = req.body;
        let uId = parseInt(userId, 10);
        if (isNaN(uId)) uId = 0;

        const check = await pool.query('SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, uId]);

        if (check.rows.length > 0) {
            if (check.rows[0].reaction_type === reactionType) {
                await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, uId]);
                res.status(200).json({ message: 'Unliked', liked: false });
            } else {
                await pool.query('UPDATE post_likes SET reaction_type = $1 WHERE post_id = $2 AND user_id = $3', [reactionType, postId, uId]);
                res.status(200).json({ message: 'Reaction updated', liked: true, reactionType });
            }
        } else {
            await pool.query('INSERT INTO post_likes (post_id, user_id, reaction_type) VALUES ($1, $2, $3)', [postId, uId, reactionType]);
            res.status(200).json({ message: 'Liked', liked: true, reactionType });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, authorName, content } = req.body;
        let uId = parseInt(userId, 10);
        if (isNaN(uId)) uId = 0;

        const result = await pool.query(
            'INSERT INTO post_comments (post_id, user_id, author_name, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [postId, uId, authorName, content]
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

export const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, content, images } = req.body;
        let uId = parseInt(userId, 10);
        if (isNaN(uId)) uId = 0;

        const uploadedImages = await uploadImagesToS3(images || []);

        const result = await pool.query(
            'UPDATE posts SET content = $1, images = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
            [content, JSON.stringify(uploadedImages), postId, uId]
        );
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        let userId = parseInt(req.query.userId, 10);
        if (isNaN(userId)) return res.status(400).json({ error: "Invalid User ID" });

        await pool.query('DELETE FROM posts WHERE id = $1 AND user_id = $2', [postId, userId]);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};