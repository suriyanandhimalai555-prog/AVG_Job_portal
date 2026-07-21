import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.routes.js';
import businessRoutes from './src/routes/business.routes.js';
import jobRoutes from './src/routes/job.routes.js'; 
import courseRoutes from './src/routes/course.routes.js'; 
import userRoutes from './src/routes/user.routes.js';
import jobApplicationRoutes from './src/routes/jobApplication.routes.js';
import postRoutes from './src/routes/post.routes.js';
import { createUserTable } from './src/models/user.model.js';
import { createBusinessTable } from './src/models/business.model.js';
import { createJobTable } from './src/models/job.model.js';
import { createCourseTable } from './src/models/course.model.js';
import { createJobApplicationTable } from './src/models/jobApplication.model.js';
import { createPostTables } from './src/models/post.model.js';

dotenv.config();

const app = express();

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

app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/jobs', jobRoutes); 
app.use('/api/courses', courseRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/applications', jobApplicationRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => {
    res.send('AVG Portal API is running cleanly.');
});

const startServer = async () => {
    await createUserTable();
    await createBusinessTable();
    await createJobTable(); 
    await createCourseTable();
    await createJobApplicationTable();
    await createPostTables();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server executing live on port: ${PORT}`);
    });
};

startServer();