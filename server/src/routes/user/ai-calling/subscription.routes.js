import express from 'express';
import { verifyToken } from '../../../middleware/auth.middleware.js';
import {
    handleSubscription,
    createRazorpayOrder,
    verifyRazorpayPayment
} from '../../../controllers/user/ai-calling/subscription.controller.js';

const router = express.Router();

router.post('/subscribe', verifyToken, handleSubscription);
router.post('/create-order', verifyToken, createRazorpayOrder);
router.post('/verify-payment', verifyToken, verifyRazorpayPayment);

export default router;