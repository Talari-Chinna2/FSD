import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './src/config/database.js';
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import bookRoutes from './src/routes/books.js';
import transactionRoutes from './src/routes/transactions.js';
import requestRoutes from './src/routes/requests.js';
import adminRoutes from './src/routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 3000;
const MAX_PORT_RETRIES = 10;

// 📁 Fix frontend path safely
const frontendPublicDir = fs.existsSync(path.join(__dirname, '..', 'frontend', 'public'))
    ? path.join(__dirname, '..', 'frontend', 'public')
    : path.join(__dirname, 'public');

// 🔐 Rate limiters
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, message: 'Too many requests, try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    skipSuccessfulRequests: true,
    message: { success: false, message: 'Too many login attempts, try later.' },
    standardHeaders: true,
    legacyHeaders: false
});

// 🌐 Middleware
app.use(cors({
    origin: '*', // change in production
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);

// 📦 Static files
app.use(express.static(frontendPublicDir));

// ❤️ Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        time: new Date()
    });
});

// 🔗 Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);

// ❌ 404 handler (important)
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found'
    });
});

// ⚠️ Error handler
app.use((err, req, res, next) => {
    console.error('🔥 Error:', err.message);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 🌐 SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPublicDir, 'index.html'));
});

// 🚀 Start server
const startServer = async () => {
    try {
        console.log('⏳ Connecting to database...');
        await connectDB();
        console.log('✅ Database connected');

        const tryListen = (port, attempt = 0) => {
            const server = app.listen(port, () => {
                console.log(`🚀 Server running at http://localhost:${port}`);
            });

            server.on('error', (error) => {
                if (error.code === 'EADDRINUSE' && attempt < MAX_PORT_RETRIES) {
                    const nextPort = port + 1;
                    console.warn(`⚠️ Port ${port} is in use. Trying port ${nextPort}...`);
                    tryListen(nextPort, attempt + 1);
                    return;
                }

                console.error('❌ Server failed to start:', error.message);
                process.exit(1);
            });
        };

        tryListen(DEFAULT_PORT);

    } catch (error) {
        console.error('❌ Server failed to start:', error.message);
        process.exit(1);
    }
};

startServer();