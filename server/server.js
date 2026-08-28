import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';

// Route Imports
import authRoutes from './src/routes/auth.routes.js';
import businessRoutes from './src/routes/admin/business.routes.js';
import jobRoutes from './src/routes/admin/job.routes.js';
import courseRoutes from './src/routes/admin/course.routes.js';
import userRoutes from './src/routes/user/user.routes.js';
import jobApplicationRoutes from './src/routes/user/jobApplication.routes.js';
import postRoutes from './src/routes/user/post.routes.js';
import chatRoutes from './src/routes/user/chat.routes.js';

// Separated AI Calling Routes
import aiInboundRoutes from './src/routes/user/ai-calling/aiInbound.routes.js';
import subscriptionRoutes from './src/routes/user/ai-calling/subscription.routes.js';

// Model Imports
import { createUserTable } from './src/models/user/user.model.js';
import { createBusinessTable } from './src/models/admin/business.model.js';
import { createJobTable } from './src/models/admin/job.model.js';
import { createCourseTable } from './src/models/admin/course.model.js';
import { createJobApplicationTable } from './src/models/user/jobApplication.model.js';
import { createPostTables } from './src/models/user/post.model.js';
import { createChatTable } from './src/models/user/chat.model.js';
import { createAIInboundTables } from './src/models/user/ai-calling/aiInbound.model.js'; // <-- Updated import

// Controller for Twilio WebSocket
import { setupTwilioMediaStream } from './src/controllers/user/ai-calling/aiInbound.controller.js';

// Socket Initialization
import { initializeSocket } from './src/socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTENDURL,
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

// Body parsing limits already allow large media files
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Apply Standard Routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', jobApplicationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);

// Apply Separated AI Calling Routes
app.use('/api/ai-calling', aiInboundRoutes);
app.use('/api/ai-calling', subscriptionRoutes);

app.get('/', (req, res) => {
    res.send('AVG Portal API is running cleanly.');
});

// Initialize Socket.io (For React Frontend)
const io = initializeSocket(server);
if (io) global.io = io;

const startServer = async () => {
    await createUserTable();
    await createBusinessTable();
    await createJobTable();
    await createCourseTable();
    await createJobApplicationTable();
    await createPostTables();
    await createChatTable();
    await createAIInboundTables(); // <-- Updated table initialization

    const PORT = process.env.PORT || 5001;

    // WebSocket routing: /media for Twilio, everything else for Socket.io
    const wss = new WebSocketServer({ noServer: true });
    setupTwilioMediaStream(wss);

    server.on('upgrade', (request, socket, head) => {
        const pathname = request.url;
        if (pathname === '/media') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        }
    });

    server.listen(PORT, () => {
        console.log(`Server executing live on port: ${PORT}`);
        console.log(`Twilio Media Stream listening on ws://localhost:${PORT}/media`);
    });
};

startServer();