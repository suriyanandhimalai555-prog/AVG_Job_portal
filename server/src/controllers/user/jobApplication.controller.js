import JobApplicationModel from '../../models/user/jobApplication.model.js';
import JobModel from '../../models/admin/job.model.js';
import nodemailer from 'nodemailer';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from 'crypto';

// Setup S3 Client for PDF uploads
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const uploadPdfToS3 = async (file) => {
    if (!file) return null;
    const extension = 'pdf'; 
    const fileName = `resumes/${crypto.randomBytes(16).toString('hex')}.${extension}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype || 'application/pdf'
    });

    await s3.send(command);
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const applyForJob = async (req, res) => {
    try {
        const { jobId, jobTitle, companyName, companyEmail, applicantName, applicantEmail, coverLetter } = req.body;
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: 'Resume PDF file is required.' });
        }

        // Upload to S3 and get the secure URL
        const resumeLink = await uploadPdfToS3(req.file);

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
                <p><strong>Resume PDF:</strong> <a href="${resumeLink}">Download/View Applicant PDF</a></p>
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