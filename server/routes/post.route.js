import express from "express";
import { createPost, updatePost, deletePost, getAllPost, toggleLike } from "../controllers/post.controller.js";
import { getExplorePosts, searchExplore } from "../controllers/explore.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get("/", authMiddleware, getAllPost);
router.get("/explore", authMiddleware, getExplorePosts);
router.get("/explore/search", authMiddleware, searchExplore);
router.post("/", authMiddleware, upload.single("file"), createPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.put("/:postId/like", authMiddleware, toggleLike);

export default router;
