import { Router } from 'express';
import { protectRoute } from '../middlewares/protectRoute.js';
import {
  swipeRight,
  swipeLeft,
  getMatches,
  getUserProfiles,
} from '../controllers/matches.controller.js';
export const matchesRouter = Router();

matchesRouter.post('/swipe-right/:likedUserId', protectRoute, swipeRight);

matchesRouter.post('/swipe-left/:dislikedUserId', protectRoute, swipeLeft);

matchesRouter.get('/', protectRoute, getMatches);
matchesRouter.get('/user-profiles', protectRoute, getUserProfiles);
