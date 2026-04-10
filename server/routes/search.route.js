import express from "express";
import { searchUser } from "../controllers/search.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, searchUser);

export default router;