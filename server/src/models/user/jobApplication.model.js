import pool from '../../config/db.js';

export const createJobApplicationTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS job_applications (
            id SERIAL PRIMARY KEY,
            job_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            applicant_name VARCHAR(100) NOT NULL,
            applicant_email VARCHAR(100) NOT NULL,
            resume_link VARCHAR(255),
            cover_letter TEXT,
            status VARCHAR(50) DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(queryText);
        console.log('✅ Job Applications table is ready.');
    } catch (error) {
        console.error('❌ Error creating job_applications table:', error);
    }
};

const JobApplicationModel = {
    create: async (applicationData) => {
        const { jobId, userId, applicantName, applicantEmail, resumeLink, coverLetter } = applicationData;
        const query = `
            INSERT INTO job_applications (job_id, user_id, applicant_name, applicant_email, resume_link, cover_letter)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [jobId, userId, applicantName, applicantEmail, resumeLink, coverLetter];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    getByUserId: async (userId) => {
        const query = `
            SELECT ja.id AS application_id, ja.status AS application_status, ja.created_at AS applied_date,
                   j.id AS job_id, j.title, j.company, j.location, j.type
            FROM job_applications ja
            JOIN jobs j ON ja.job_id = j.id
            WHERE ja.user_id = $1
            ORDER BY ja.created_at DESC;
        `;
        const { rows } = await pool.query(query, [userId]);
        return rows;
    },

    // NEW: Fetch all applicants for a specific job (For Admin)
    getByJobId: async (jobId) => {
        const query = `
            SELECT * FROM job_applications 
            WHERE job_id = $1 
            ORDER BY created_at DESC;
        `;
        const { rows } = await pool.query(query, [jobId]);
        return rows;
    },

    // NEW: Update application status (For Admin)
    updateStatus: async (applicationId, status) => {
        const query = `
            UPDATE job_applications 
            SET status = $1 
            WHERE id = $2 
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [status, applicationId]);
        return rows[0];
    }
};

export default JobApplicationModel;