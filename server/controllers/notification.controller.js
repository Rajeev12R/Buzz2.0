import { createNotification } from "../utils/notificationHelper.js";
import Notification from "../models/Notification.js";

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id
    })
      .populate("sender", "username profilePic")
      .populate({ path: "post", populate: { path: "author", select: "username profilePic" } })
      .sort({ createdAt: -1 });

    res.json({ notifications });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const markAsRead = async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id },
    { isRead: true }
  );

  res.json({ message: "Marked as read" });
};

export {getNotifications, markAsRead};