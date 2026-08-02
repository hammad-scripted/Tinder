import { Router } from 'express';
import { protectRoute } from '../middlewares/protectRoute.js';
import {sendMessage, getConversation} from '../controllers/messages.controller.js'
export const messagesRouter = Router();

messagesRouter.post('/send', protectRoute, sendMessage);
messagesRouter.get('/conversation/:userId', protectRoute, getConversation);
