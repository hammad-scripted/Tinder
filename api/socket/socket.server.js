import { Server } from 'socket.io';
import http from 'http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

let io;
const connectedUsers = new Map();
//{ userId: socketId }
export const initializeWebSocketServer = (server) => {
  const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', process.env.CLIENT_URL].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
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
