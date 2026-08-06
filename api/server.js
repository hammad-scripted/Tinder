import dns from 'node:dns/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.route.js';
import { usersRouter } from './routes/users.route.js';
import { matchesRouter } from './routes/matches.route.js';
import { messagesRouter } from './routes/messages.route.js';
import chalk from 'chalk';
import { connectDB } from './db/connect.js';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import { initializeWebSocketServer } from './socket/socket.server.js';

const app = express();
const httpServer = createServer(app);
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', process.env.CLIENT_URL].filter(Boolean);

initializeWebSocketServer(httpServer);
// ? MIDDLEWARES
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'OPTIONS',
      'HEAD',
      'CONNECT',
      'TRACE',
      'PATCH',
    ],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
// CORS must run before the body parsers. Otherwise a parser error (such as a
// 413 for a large base64 image) is returned without CORS headers and the
// browser incorrectly reports it as a CORS/network error.
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(morgan('dev'));

// ? ROUTES
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/messages', messagesRouter);

// Return a useful JSON response when Express rejects an oversized request.
app.use((err, req, res, next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Image is too large. Please choose an image smaller than 80 MB.',
    });
  }

  return next(err);
});

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(chalk.blueBright(`Server running on port ${PORT}`));
    });
  } catch (err) {
    console.error(chalk.red(err.message), err);
  }
};

startServer();
