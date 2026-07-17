import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.routes.js';
import businessRoutes from './src/routes/business.routes.js';
import jobRoutes from './src/routes/job.routes.js'; 
import courseRoutes from './src/routes/course.routes.js'; 
import userRoutes from './src/routes/user.routes.js';
import { createUserTable } from './src/models/user.model.js';
import { createBusinessTable } from './src/models/business.model.js';
import { createJobTable } from './src/models/job.model.js';
import { createCourseTable } from './src/models/course.model.js';
import { createJobApplicationTable } from './src/models/jobApplication.model.js';
import jobApplicationRoutes from './src/routes/jobApplication.routes.js';

dotenv.config();

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://avgmart.com',
    'http://localhost:5173'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Main Routing mount
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/jobs', jobRoutes); 
app.use('/api/courses', courseRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/applications', jobApplicationRoutes);

// Root path test
app.get('/', (req, res) => {
    res.send('AVG Portal API is running cleanly.');
});

// Initialize Database Tables and Start Server
const startServer = async () => {
    // Automatically setup tables on server start
    await createUserTable();
    await createBusinessTable();
    await createJobTable(); 
    await createCourseTable();
    await createJobApplicationTable();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server executing live on port: ${PORT}`);
    });
};

startServer();