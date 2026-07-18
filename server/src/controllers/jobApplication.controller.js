import JobApplicationModel from '../models/jobApplication.model.js';
import JobModel from '../models/job.model.js';
import nodemailer from 'nodemailer';

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
        const userId = req.user.id;

        const application = await JobApplicationModel.create({
            jobId, userId, applicantName, applicantEmail, resumeLink, coverLetter
        });

        await JobModel.incrementApplicants(jobId);

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

        await Promise.all([
            transporter.sendMail(userMailOptions),
            transporter.sendMail(companyMailOptions)
        ]);

        res.status(201).json({ message: 'Application submitted successfully!', application });
    } catch (error) {
        console.error('Job Application Error:', error);
        res.status(500).json({ message: 'Failed to process application' });
    }
};

export const getUserApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        const applications = await JobApplicationModel.getByUserId(userId);
        res.status(200).json(applications);
    } catch (error) {
        console.error('Fetch Applications Error:', error);
        res.status(500).json({ message: 'Failed to fetch your applications.' });
    }
};

// NEW: Fetch applicants for a job (Admin)
export const getJobApplicants = async (req, res) => {
    try {
        const { jobId } = req.params;
        const applicants = await JobApplicationModel.getByJobId(jobId);
        res.status(200).json(applicants);
    } catch (error) {
        console.error('Fetch Applicants Error:', error);
        res.status(500).json({ message: 'Failed to fetch applicants.' });
    }
};

// NEW: Update applicant status (Admin)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedApplication = await JobApplicationModel.updateStatus(id, status);
        if (!updatedApplication) {
            return res.status(404).json({ message: 'Application not found.' });
        }
        res.status(200).json(updatedApplication);
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ message: 'Failed to update status.' });
    }
};