import {Router} from 'express';

export const authRouter=Router(); 

import {signup,login,logout} from '../controllers/auth.controller.js';
authRouter.post('/register',signup);
authRouter.post('/login',login);
authRouter.post('/logout',logout);  