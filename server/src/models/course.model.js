import pool from '../config/db.js';

export const createCourseTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS courses (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            price VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'Active',
            thumbnail_url VARCHAR(500),
            description TEXT,
            instructor_name VARCHAR(150),
            duration VARCHAR(50),
            course_level VARCHAR(50) DEFAULT 'Beginner',
            language VARCHAR(100) DEFAULT 'English',
            lessons_count INTEGER DEFAULT 0,
            has_certificate BOOLEAN DEFAULT false,
            is_featured BOOLEAN DEFAULT false,
            discount_price VARCHAR(50),
            preview_video_url VARCHAR(500),
            start_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const alterQueryText = `
        ALTER TABLE courses 
        ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500),
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS instructor_name VARCHAR(150),
        ADD COLUMN IF NOT EXISTS duration VARCHAR(50),
        ADD COLUMN IF NOT EXISTS course_level VARCHAR(50) DEFAULT 'Beginner',
        ADD COLUMN IF NOT EXISTS language VARCHAR(100) DEFAULT 'English',
        ADD COLUMN IF NOT EXISTS lessons_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS has_certificate BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS discount_price VARCHAR(50),
        ADD COLUMN IF NOT EXISTS preview_video_url VARCHAR(500),
        ADD COLUMN IF NOT EXISTS start_date DATE;
    `;

    // NEW: Create Enrollment and Wishlist Tables
    const enrollmentsTable = `
        CREATE TABLE IF NOT EXISTS course_enrollments (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, course_id)
        );
    `;

    const wishlistTable = `
        CREATE TABLE IF NOT EXISTS course_wishlist (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, course_id)
        );
    `;

    try {
        await pool.query(queryText);
        await pool.query(alterQueryText);
        await pool.query(enrollmentsTable);
        await pool.query(wishlistTable);
        console.log('✅ Courses, Enrollments, and Wishlist tables are ready.');
    } catch (error) {
        console.error('❌ Error building/patching courses tables:', error);
    }
};

const CourseModel = {
    getAll: async () => {
        const query = 'SELECT * FROM courses ORDER BY created_at DESC';
        const { rows } = await pool.query(query);
        return rows;
    },

    create: async (data) => {
        const {
            title, category, price, status, thumbnail_url, description,
            instructor_name, duration, course_level, language, lessons_count,
            has_certificate, is_featured, discount_price, preview_video_url, start_date
        } = data;

        const query = `
            INSERT INTO courses (
                title, category, price, status, thumbnail_url, description, 
                instructor_name, duration, course_level, language, lessons_count, 
                has_certificate, is_featured, discount_price, preview_video_url, start_date
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [
            title, category, price, status || 'Active', thumbnail_url || '', description || '',
            instructor_name || '', duration || '', course_level || 'Beginner', language || 'English',
            lessons_count || 0, has_certificate || false, is_featured || false,
            discount_price || '', preview_video_url || '', start_date || null
        ]);
        return rows[0];
    },

    update: async (id, data) => {
        const {
            title, category, price, status, thumbnail_url, description,
            instructor_name, duration, course_level, language, lessons_count,
            has_certificate, is_featured, discount_price, preview_video_url, start_date
        } = data;

        const query = `
            UPDATE courses 
            SET title = $1, category = $2, price = $3, status = $4, 
                thumbnail_url = $5, description = $6, instructor_name = $7, 
                duration = $8, course_level = $9, language = $10, 
                lessons_count = $11, has_certificate = $12, is_featured = $13, 
                discount_price = $14, preview_video_url = $15, start_date = $16
            WHERE id = $17 
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [
            title, category, price, status, thumbnail_url || '', description || '',
            instructor_name || '', duration || '', course_level || 'Beginner', language || 'English',
            lessons_count || 0, has_certificate || false, is_featured || false,
            discount_price || '', preview_video_url || '', start_date || null,
            id
        ]);
        return rows[0];
    },

    delete: async (id) => {
        const query = 'DELETE FROM courses WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    },

    // --- NEW: User Interaction Methods ---

    getEnrollments: async (userId) => {
        const query = 'SELECT course_id FROM course_enrollments WHERE user_id = $1';
        const { rows } = await pool.query(query, [userId]);
        return rows.map(r => r.course_id);
    },

    enrollUser: async (userId, courseId) => {
        const query = `
            INSERT INTO course_enrollments (user_id, course_id) 
            VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *;
        `;
        const { rows } = await pool.query(query, [userId, courseId]);
        return rows[0];
    },

    getWishlist: async (userId) => {
        const query = 'SELECT course_id FROM course_wishlist WHERE user_id = $1';
        const { rows } = await pool.query(query, [userId]);
        return rows.map(r => r.course_id);
    },

    toggleWishlist: async (userId, courseId) => {
        // Check if exists
        const checkQuery = 'SELECT id FROM course_wishlist WHERE user_id = $1 AND course_id = $2';
        const { rows: existing } = await pool.query(checkQuery, [userId, courseId]);

        if (existing.length > 0) {
            // Remove if exists
            await pool.query('DELETE FROM course_wishlist WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
            return { action: 'removed' };
        } else {
            // Add if not exists
            await pool.query('INSERT INTO course_wishlist (user_id, course_id) VALUES ($1, $2)', [userId, courseId]);
            return { action: 'added' };
        }
    }
};

export default CourseModel;