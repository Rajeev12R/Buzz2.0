import express from "express";
import multer from "multer";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getStories, createStory } from "../controllers/story.controller.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/", authMiddleware, upload.single("media"), createStory);
router.get("/", authMiddleware, getStories);

export default router;