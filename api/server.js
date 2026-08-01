import { config } from 'dotenv';
config();
import express from 'express';
import {authRouter} from './routes/auth.route.js';
import {usersRouter} from './routes/users.route.js';
import {matchesRouter} from './routes/matches.route.js';
import {messagesRouter} from './routes/messages.route.js';
const app=express();


// ? MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({extended:true}));



// ? ROUTES
app.use("/api/auth",authRouter);
app.use("/api/users",usersRouter);
app.use("/api/matches",matchesRouter);
app.use("/api/messages",messagesRouter  );


app.listen(process.env.PORT,()=>console.log(`server is running on port ${process.env.PORT}`));