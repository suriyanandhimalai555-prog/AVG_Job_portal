import pool from '../config/db.js';

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
    }
};

export default JobApplicationModel;