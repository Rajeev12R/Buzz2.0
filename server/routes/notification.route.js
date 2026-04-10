import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  markAsRead
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.put("/read", authMiddleware, markAsRead);

export default router;