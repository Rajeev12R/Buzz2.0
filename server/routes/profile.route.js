import express from "express";
import User from "../models/User.js";
import { acceptRequest, getProfileByUsername, getSuggestions, getUsersForSidebar, rejectRequest, toggleFollow, updateProfile, getConnections, removeFollower } from "../controllers/profile.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
router.get("/", authMiddleware, getUsersForSidebar);
router.get("/suggested", authMiddleware, getSuggestions);
router.get("/:username", getProfileByUsername);
router.put("/:username", upload.single("file"), updateProfile);
router.put("/:userId/follow", authMiddleware, toggleFollow);
router.put("/request/:senderId/accept", authMiddleware, acceptRequest);
router.put("/request/:senderId/reject", authMiddleware, rejectRequest);
router.get("/:username/connections", getConnections);
router.put("/:followerId/remove-follower", authMiddleware, removeFollower);

export default router;