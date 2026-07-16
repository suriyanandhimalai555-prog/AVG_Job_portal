import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

// Choose between the single DATABASE_URL or the fallback object structure
const isProduction = process.env.DATABASE_URL ? true : false;

const pool = new Pool({
    // If DATABASE_URL exists (Production), use it. Otherwise, use local config.
    connectionString: process.env.DATABASE_URL,
    
    ...(isProduction 
        ? {
            ssl: {
                rejectUnauthorized: false // Required for Railway/Render production
            }
        }
        : {
            // Your old local config fallback
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            ssl: false,
        }
    )
});

// Test connection instantly when server mounts
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Database connection error:', err.stack);
    }
    console.log('Connected to PostgreSQL Database successfully.');
    if (release) release();
});

export default pool;