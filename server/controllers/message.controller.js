import Message from "../models/Message.js";
import { io, onlineUsers } from "../index.js";

const sendMessage = async (req, res) => {
    try {
        const { receiverId, text } = req.body;
        const message = await Message.create({
            sender: req.user.id,
            receiver: receiverId,
            text
        })
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", message);
        }
        res.status(201).json({ message });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: userId },
                { sender: userId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 });

        res.json({ messages });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export { sendMessage, getMessages };