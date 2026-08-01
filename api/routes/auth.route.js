import {Router} from 'express';

export const authRouter=Router(); 

import {register,login,logout} from '../controllers/auth.controller.js';
authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);  