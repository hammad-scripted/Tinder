import { Server } from 'socket.io';
import http from 'http';
import { config } from 'dotenv';
config();

let io;
const connectedUsers = new Map();
//{ userId: socketId }
export const initializeWebSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    },
  });
  //? Middleware for authentication
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error('Authentication error,Invalid user id'));
    }
    socket.userId = userId;
    next();
  });
  io.on('connection', (socket) => {
    console.log(` New user connected with id ${socket.id}`);
    connectedUsers.set(socket.userId, socket.id);

    socket.on('disconnect', () => {
      console.log(` User disconnected with id ${socket.id}`);
      connectedUsers.delete(socket.userId);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const getConnectedUsers = () => {
  return connectedUsers;
};
