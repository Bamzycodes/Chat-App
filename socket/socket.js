
const { Server } = require('socket.io')
const http = require('http')
const express = require('express')

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

 const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

// Object to track online users (userId -> array of socket IDs)
let onlineUsers = {};

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    // Handle userOnline event from clients (when user logs in)
    socket.on('userOnline', (userId) => {
        if (!onlineUsers[userId]) {
            onlineUsers[userId] = [];
        }
        onlineUsers[userId].push(socket.id);  // Add the socket ID for this user

        // Notify all clients about this user's online status
        io.emit('updateUserStatus', { userId, isOnline: true });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        // Find the userId associated with this socket ID
        let disconnectedUserId = null;
        for (const userId in onlineUsers) {
            const socketIndex = onlineUsers[userId].indexOf(socket.id);
            if (socketIndex !== -1) {
                onlineUsers[userId].splice(socketIndex, 1);
                if (onlineUsers[userId].length === 0) {
                    // No sockets left for this user, mark as offline
                    delete onlineUsers[userId];
                    io.emit('updateUserStatus', { userId, isOnline: false });
                }
                disconnectedUserId = userId;
                break;
            }
        }
        console.log(`User ${disconnectedUserId} disconnected.`);
    });
});

module.exports = { app, io, server, getReceiverSocketId};
