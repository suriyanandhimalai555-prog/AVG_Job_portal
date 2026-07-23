import pool from '../../config/db.js';

// Automated Table Creation & Patching Logic
export const createBusinessTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS businesses (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            location VARCHAR(255) NOT NULL,
            status VARCHAR(50) DEFAULT 'Active',
            logo_url VARCHAR(500),
            description TEXT,
            contact_person VARCHAR(100),
            phone VARCHAR(50),
            email VARCHAR(100),
            website VARCHAR(255),
            google_maps_url VARCHAR(500),
            social_links TEXT,
            is_featured BOOLEAN DEFAULT false,
            is_verified BOOLEAN DEFAULT false,
            views INTEGER DEFAULT 0,
            clicks INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // Auto-patch existing databases with the new advanced fields
    const alterQueryText = `
        ALTER TABLE businesses 
        ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500),
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS contact_person VARCHAR(100),
        ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
        ADD COLUMN IF NOT EXISTS email VARCHAR(100),
        ADD COLUMN IF NOT EXISTS website VARCHAR(255),
        ADD COLUMN IF NOT EXISTS google_maps_url VARCHAR(500),
        ADD COLUMN IF NOT EXISTS social_links TEXT,
        ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;
    `;

    try {
        await pool.query(queryText);
        await pool.query(alterQueryText);
        console.log('✅ Businesses table is ready and patched with advanced fields.');
    } catch (error) {
        console.error('❌ Error creating/updating businesses table:', error);
    }
};

const BusinessModel = {
    getAll: async () => {
        const query = 'SELECT * FROM businesses ORDER BY created_at DESC';
        const { rows } = await pool.query(query);
        return rows;
    },

    create: async (data) => {
        const {
            name, category, location, status, logo_url, description,
            contact_person, phone, email, website, google_maps_url,
            social_links, is_featured, is_verified, views, clicks
        } = data;

        const query = `
            INSERT INTO businesses (
                name, category, location, status, logo_url, description, 
                contact_person, phone, email, website, google_maps_url, 
                social_links, is_featured, is_verified, views, clicks
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [
            name, category, location, status || 'Active', logo_url || '', description || '',
            contact_person || '', phone || '', email || '', website || '', google_maps_url || '',
            social_links || '', is_featured || false, is_verified || false, views || 0, clicks || 0
        ]);
        return rows[0];
    },

    update: async (id, data) => {
        const {
            name, category, location, status, logo_url, description,
            contact_person, phone, email, website, google_maps_url,
            social_links, is_featured, is_verified, views, clicks
        } = data;

        const query = `
            UPDATE businesses 
            SET name = $1, category = $2, location = $3, status = $4, 
                logo_url = $5, description = $6, contact_person = $7, 
                phone = $8, email = $9, website = $10, google_maps_url = $11, 
                social_links = $12, is_featured = $13, is_verified = $14, 
                views = $15, clicks = $16
            WHERE id = $17 
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [
            name, category, location, status, logo_url || '', description || '',
            contact_person || '', phone || '', email || '', website || '', google_maps_url || '',
            social_links || '', is_featured || false, is_verified || false, views || 0, clicks || 0,
            id
        ]);
        return rows[0];
    },

    delete: async (id) => {
        const query = 'DELETE FROM businesses WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    }
};

export default BusinessModel;