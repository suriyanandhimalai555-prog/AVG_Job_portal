import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import pool from './config/db.js';

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    const userSockets = new Map();

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

    io.on('connection', (socket) => {
        console.log(`User connected to socket: ${socket.userId}`);
        userSockets.set(socket.userId, socket.id);

        socket.on('send_message', async (data) => {
            const { receiverId, senderId, senderName, senderRole, text, time } = data;

            try {
                await pool.query(
                    'INSERT INTO chats (sender_id, receiver_id, ciphertext) VALUES ($1, $2, $3)',
                    [senderId, receiverId, text]
                );

                const receiverSocketId = userSockets.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive_message', {
                        senderId, senderName, senderRole, text, time
                    });
                }
            } catch (err) {
                console.error("Failed to save chat message:", err);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected from socket: ${socket.userId}`);
            userSockets.delete(socket.userId);
        });
    });
};
