import express from "express";
import { addComment, getComments, getReplies } from "../controllers/comment.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, addComment);
router.get("/:postId", getComments);
router.get("/replies/:commentId", getReplies);

export default router;