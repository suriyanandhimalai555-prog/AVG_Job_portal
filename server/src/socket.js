import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import pool from './config/db.js';

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        maxHttpBufferSize: 1e8
    });

    // Maps socket.id -> userId to safely handle multiple tabs/devices per user
    const activeSockets = new Map();

    // Auto-migrate database to support last_seen tracking
    pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP;`).catch(console.error);

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Authentication error: No token provided"));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (err) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on('connection', async (socket) => {
        const userId = socket.userId;
        activeSockets.set(socket.id, userId);

        console.log(`Socket connected: ${socket.id} for User: ${userId}`);

        // Get unique online users across all connected sockets
        const getOnlineUsers = () => [...new Set(Array.from(activeSockets.values()))];

        // 1. Give the newly connected user a list of EVERYONE currently online
        socket.emit('online_users', getOnlineUsers());

        // 2. Broadcast to others that this user is online (Only if this is their first active socket)
        const userSocketCount = Array.from(activeSockets.values()).filter(id => id === userId).length;
        if (userSocketCount === 1) {
            socket.broadcast.emit('user_status', { userId, online: true, lastSeen: null });
        }

        socket.on('send_message', async (data) => {
            const { receiverId, senderId, senderName, senderRole, text, time } = data;

            try {
                await pool.query(
                    'INSERT INTO chats (sender_id, receiver_id, ciphertext) VALUES ($1, $2, $3)',
                    [senderId, receiverId, text]
                );

                // Find ALL active sockets for the receiver and emit to them
                for (const [socketId, activeUserId] of activeSockets.entries()) {
                    if (String(activeUserId) === String(receiverId)) {
                        io.to(socketId).emit('receive_message', {
                            senderId, senderName, senderRole, text, time
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to save chat message:", err);
            }
        });

        socket.on('disconnect', async () => {
            console.log(`Socket disconnected: ${socket.id}`);
            activeSockets.delete(socket.id);

            // Check if the user completely closed the app (no other tabs open)
            const isStillOnline = Array.from(activeSockets.values()).includes(userId);

            if (!isStillOnline) {
                const lastSeen = new Date().toISOString();

                try {
                    // Update persistent database record so the offline time is saved globally
                    await pool.query('UPDATE users SET last_seen = $1 WHERE id = $2', [lastSeen, userId]);

                    // Broadcast to everyone that the user is now completely offline
                    io.emit('user_status', { userId, online: false, lastSeen });
                } catch (err) {
                    console.error("Error updating last seen status:", err);
                }
            }
        });
    });
};