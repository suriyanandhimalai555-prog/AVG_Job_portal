import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

// Route Imports
import authRoutes from './src/routes/auth.routes.js';
import businessRoutes from './src/routes/admin/business.routes.js';
import jobRoutes from './src/routes/admin/job.routes.js';
import courseRoutes from './src/routes/admin/course.routes.js';
import userRoutes from './src/routes/user/user.routes.js';
import jobApplicationRoutes from './src/routes/user/jobApplication.routes.js';
import postRoutes from './src/routes/user/post.routes.js';
import chatRoutes from './src/routes/user/chat.routes.js'; // 1. Added chat routes import

// Model Imports
import { createUserTable } from './src/models/user/user.model.js';
import { createBusinessTable } from './src/models/admin/business.model.js';
import { createJobTable } from './src/models/admin/job.model.js';
import { createCourseTable } from './src/models/admin/course.model.js';
import { createJobApplicationTable } from './src/models/user/jobApplication.model.js';
import { createPostTables } from './src/models/user/post.model.js';
import { createChatTable } from './src/models/user/chat.model.js'; // 2. Added chat table import

// Socket Initialization
import { initializeSocket } from './src/socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://avgjobportal.avgprimetech.com/',
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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Apply Routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', jobApplicationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes); // 3. Registered the chat routes

app.get('/', (req, res) => {
    res.send('AVG Portal API is running cleanly.');
});

// Initialize Socket.io with the HTTP server
initializeSocket(server);

const startServer = async () => {
    // Initialize Database Tables
    await createUserTable();
    await createBusinessTable();
    await createJobTable();
    await createCourseTable();
    await createJobApplicationTable();
    await createPostTables();
    await createChatTable(); // 4. Execute table creation on startup

    const PORT = process.env.PORT || 5000;

    // Start listening on the server instance
    server.listen(PORT, () => {
        console.log(`Server executing live on port: ${PORT}`);
    });
};

startServer();