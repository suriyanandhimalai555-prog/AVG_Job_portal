import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 
import UserModel from '../models/user.model.js'; 

export const registerUser = async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body; 

        if (!fullName || !email || !password) {
            return res.status(400).json({ error: 'Please provide all required fields.' }); 
        }

        const existingUser = await UserModel.findByEmail(email); 
        if (existingUser) {
            return res.status(409).json({ error: 'Email is already registered.' }); 
        }

        const saltRounds = 10; 
        const passwordHash = await bcrypt.hash(password, saltRounds); 

        const newUser = await UserModel.create({
            fullName, 
            email, 
            phone, 
            passwordHash 
        });

        res.status(201).json({
            message: 'User registered successfully!', 
            user: newUser 
        });

    } catch (error) {
        console.error('Registration Error:', error); 
        res.status(500).json({ error: 'Internal server error during registration.' }); 
    }
};

// Login Logic
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; 

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password.' }); 
        }

        const user = await UserModel.findByEmail(email); 
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' }); 
        }

        const isMatch = await bcrypt.compare(password, user.password_hash); 
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' }); 
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } // Token expires in 1 day[cite: 20]
        );

        res.status(200).json({
            message: 'Login successful', 
            token, 
            user: { id: user.id, fullName: user.full_name, email: user.email } 
        });

    } catch (error) {
        console.error('Login Error:', error); 
        res.status(500).json({ error: 'Internal server error during login.' }); 
    }
};

// NEW: Admin Login Logic
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password.' });
        }

        // 1. STRICT SECURITY GATE
        // Only allow this specific email to attempt an admin login.
        const authorizedAdminEmail = 'admin@agilavetri.com'; 
        
        if (email.toLowerCase() !== authorizedAdminEmail.toLowerCase()) {
            return res.status(403).json({ error: 'Access denied. Unauthorized personnel.' });
        }

        // 2. Verify existence in database
        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid admin credentials.' });
        }

        // 3. Verify password hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid admin credentials.' });
        }

        // 4. Generate Admin JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: 'superadmin' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } 
        );

        res.status(200).json({
            message: 'Admin login successful',
            token,
            user: { id: user.id, fullName: user.full_name, email: user.email }
        });

    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ error: 'Internal server error during admin login.' });
    }
};