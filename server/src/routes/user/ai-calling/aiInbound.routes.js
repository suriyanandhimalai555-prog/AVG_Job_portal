import express from 'express';
import { verifyToken } from '../../../middleware/auth.middleware.js';
import {
    getInboundData,
    simulateInboundCall,
    handleTwilioWebhook
} from '../../../controllers/user/ai-calling/aiInbound.controller.js';

const router = express.Router();

router.post('/twiml', handleTwilioWebhook);
router.get('/inbound', verifyToken, getInboundData);
router.post('/inbound/simulate', verifyToken, simulateInboundCall);

export default router;