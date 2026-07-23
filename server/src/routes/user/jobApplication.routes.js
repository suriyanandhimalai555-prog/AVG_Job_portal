import express from 'express';
import { applyForJob, getUserApplications, getJobApplicants, updateApplicationStatus } from '../../controllers/user/jobApplication.controller.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/apply', verifyToken, applyForJob);
router.get('/my-applications', verifyToken, getUserApplications);

// Admin routes for managing applications (Secured with verifyToken for now)
router.get('/job/:jobId', verifyToken, getJobApplicants);
router.put('/:id/status', verifyToken, updateApplicationStatus);

export default router;