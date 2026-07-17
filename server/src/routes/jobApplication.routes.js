import express from 'express';
import { applyForJob } from '../controllers/jobApplication.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js'; // Ensure your auth middleware path is correct

const router = express.Router();

// Protected route: Only logged-in users can apply
router.post('/apply', verifyToken, applyForJob);

export default router;