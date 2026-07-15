import express from 'express'; 
import { registerUser, loginUser, adminLogin } from '../controllers/auth.controller.js'; 

const router = express.Router(); 

// POST /api/auth/register
router.post('/register', registerUser); 

// POST /api/auth/login
router.post('/login', loginUser); 

// POST /api/auth/admin-login (Admin ONLY)
router.post('/admin-login', adminLogin);

export default router; 