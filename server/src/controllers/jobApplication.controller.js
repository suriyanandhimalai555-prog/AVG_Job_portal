import JobApplicationModel from '../models/jobApplication.model.js';
import nodemailer from 'nodemailer';

// Configure the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const applyForJob = async (req, res) => {
    try {
        const { jobId, jobTitle, companyName, companyEmail, applicantName, applicantEmail, resumeLink, coverLetter } = req.body;
        const userId = req.user.id; // From your auth middleware

        // 1. Save to Database
        const application = await JobApplicationModel.create({
            jobId, userId, applicantName, applicantEmail, resumeLink, coverLetter
        });

        // 2. Email to User (Applicant)
        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: applicantEmail,
            subject: `Application Submitted: ${jobTitle} at ${companyName}`,
            html: `
                <h3>Hello ${applicantName},</h3>
                <p>Your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been successfully submitted!</p>
                <p>The company will review your profile and contact you if you are a good fit.</p>
                <br/>
                <p>Best Regards,</p>
                <p><strong>Job Portal Team</strong></p>
            `
        };

        // 3. Email to Company (Employer)
        // If companyEmail isn't provided in the payload, you can route it to an admin email for now
        const targetCompanyEmail = companyEmail || process.env.EMAIL_USER;

        const companyMailOptions = {
            from: process.env.EMAIL_USER,
            to: targetCompanyEmail,
            subject: `New Application for ${jobTitle} - ${applicantName}`,
            html: `
                <h3>New Job Application Received</h3>
                <p><strong>Applicant Name:</strong> ${applicantName}</p>
                <p><strong>Email:</strong> ${applicantEmail}</p>
                <p><strong>Resume Link:</strong> <a href="${resumeLink}">${resumeLink}</a></p>
                <p><strong>Cover Letter:</strong></p>
                <blockquote style="border-left: 4px solid #ccc; padding-left: 10px;">${coverLetter}</blockquote>
            `
        };

        // Send both emails simultaneously
        await Promise.all([
            transporter.sendMail(userMailOptions),
            transporter.sendMail(companyMailOptions)
        ]);

        res.status(201).json({ message: 'Application submitted and emails sent successfully!', application });
    } catch (error) {
        console.error('Job Application Error:', error);
        res.status(500).json({ message: 'Failed to process application' });
    }
};