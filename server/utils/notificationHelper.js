import Notification from "../models/Notification.js";
import { io, onlineUsers } from "../index.js";

export const createNotification = async ({
  sender,
  recipient,
  type,
  post = null,
  text = null
}) => {
  if (sender.toString() === recipient.toString()) return;

  const notification = await Notification.create({
    sender,
    recipient,
    type,
    post,
    text
  });

  const populatedNotification = await notification.populate([
    { path: "sender", select: "username profilePic" },
    { path: "post", populate: { path: "author", select: "username profilePic" } }
  ]);

  const receiverSocketId = onlineUsers.get(recipient.toString());

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newNotification", populatedNotification);
  }
};