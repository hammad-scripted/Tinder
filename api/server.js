import 'dotenv/config'; // 👈 Loads .env BEFORE other imports execute!
import dns from 'node:dns/promises';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import { usersRouter } from './routes/users.route.js';
import { matchesRouter } from './routes/matches.route.js';
import { messagesRouter } from './routes/messages.route.js';
import chalk from 'chalk';
import { connectDB } from './db/connect.js';

const app = express();

// ? MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ? ROUTES
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/messages', messagesRouter);

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(chalk.blueBright(`Server running on port ${PORT}`));
    });
  } catch (err) {
    console.error(chalk.red(err.message), err);
  }
};

startServer();