import { Router } from 'express';
import { protectRoute } from '../middlewares/protectRoute.js';
export const authRouter = Router();

import { signup, login, logout } from '../controllers/auth.controller.js';
authRouter.post('/register', signup);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});
