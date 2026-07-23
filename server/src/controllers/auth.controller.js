import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user/user.model.js';

export const registerUser = async (req, res) => {
    try {
        const { fullName, email, phone, password, referralCode } = req.body;

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
            passwordHash,
            referralCode,
            role: 'User',
            status: 'Active'
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

        // FIXED: Block Admin users from logging in via the standard user portal
        if (user.role && user.role.toLowerCase() === 'admin') {
            return res.status(403).json({ error: 'Administrative accounts must use the Admin Portal to log in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // FIXED: Added 'role' to the JWT payload so the frontend double-checks work
        const token = jwt.sign(
            { id: user.id, email: user.email, fullName: user.full_name, role: user.role || 'User' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error during login.' });
    }
};

export const registerAdmin = async (req, res) => {
    try {
        const { fullName, email, phone, password, creationSecret } = req.body;

        if (!fullName || !email || !password || !creationSecret) {
            return res.status(400).json({ error: 'Please provide all required fields, including creationSecret.' });
        }

        if (creationSecret !== process.env.ADMIN_CREATION_SECRET) {
            return res.status(403).json({ error: 'Access Denied. Invalid creation secret key.' });
        }

        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email is already registered.' });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // This will now successfully insert "Admin" due to the user.model.js update
        const newAdmin = await UserModel.create({
            fullName,
            email,
            phone,
            passwordHash,
            role: 'Admin',
            status: 'Active'
        });

        res.status(201).json({
            message: 'Administrative account initialized successfully!',
            admin: {
                id: newAdmin.id || newAdmin.insertId,
                fullName,
                email,
                role: 'Admin'
            }
        });

    } catch (error) {
        console.error('Admin Creation Error:', error);
        res.status(500).json({ error: 'Internal server error during admin creation.' });
    }
};

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password.' });
        }

        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid admin credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid admin credentials.' });
        }

        const userRole = user.role ? user.role.toLowerCase() : 'user';

        // Allow explicitly created admins OR your hardcoded emails to bypass
        const authorizedEmails = ['avgadmin@agilavetri.com', 'admin@agilavetri.com'];
        const isAuthorizedEmail = authorizedEmails.includes(email.toLowerCase());

        if (user.status && user.status.toLowerCase() !== 'active') {
            return res.status(403).json({ error: 'This administrative account is currently suspended.' });
        }

        if (userRole !== 'admin' && !isAuthorizedEmail) {
            return res.status(403).json({ error: 'Access denied. Unauthorized personnel accounts.' });
        }

        // Add fullName to payload to prevent UI errors
        const token = jwt.sign(
            { id: user.id, email: user.email, fullName: user.full_name, role: userRole === 'user' ? 'Admin' : 'Admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Admin login successful',
            token,
            user: { id: user.id, fullName: user.full_name, email: user.email, role: 'Admin' }
        });

    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ error: 'Internal server error during admin login.' });
    }
};