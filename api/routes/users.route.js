import {Router} from "express";
import { protectRoute } from "../middlewares/protectRoute";
import {updateProfile} from "../controllers/users.controller.js"
export const usersRouter = Router();


usersRouter.put("/update",protectRoute,updateProfile);
