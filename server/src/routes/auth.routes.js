import express from 'express'; 
import { registerUser, loginUser, adminLogin, registerAdmin } from '../controllers/auth.controller.js'; 

const router = express.Router(); 

// POST /api/auth/register
router.post('/register', registerUser); 

// POST /api/auth/login
router.post('/login', loginUser); 

// POST /api/auth/admin-login (Admin ONLY Verification)
router.post('/admin-login', adminLogin);

// POST /api/auth/create-admin (Secure Creation Endpoint for Postman)
router.post('/create-admin', registerAdmin);

export default router;