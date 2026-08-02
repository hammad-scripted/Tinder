import mongoose from 'mongoose';
import chalk from 'chalk';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      chalk.greenBright(`MongoDB Connected: ${conn.connection.host}`),
    );
  } catch (err) {
    console.error(chalk.red(err.message), err);
    process.exit(1);
  }
};