import express from 'express';
import multer from 'multer';
import { applyForJob, getUserApplications, getJobApplicants, updateApplicationStatus } from '../../controllers/user/jobApplication.controller.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 }
});

const router = express.Router();

const handleUpload = (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File is too large. Maximum size allowed is 3MB.' });
            }
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(500).json({ message: 'An unknown error occurred during file upload.' });
        }
        
        next();
    });
};

router.post('/apply', verifyToken, handleUpload, applyForJob);
router.get('/my-applications', verifyToken, getUserApplications);

router.get('/job/:jobId', verifyToken, getJobApplicants);
router.put('/:id/status', verifyToken, updateApplicationStatus);

export default router;