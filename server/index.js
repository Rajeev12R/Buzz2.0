import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http"
import authRoutes from "./routes/auth.route.js";
import getprofileRoute from "./routes/profile.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js"
import commentRoute from "./routes/comment.route.js";
import storiesRoute from "./routes/stories.route.js";
import notificationRoutes from "./routes/notification.route.js";
import searchRoute from "./routes/search.route.js";

const port = process.env.PORT || 3000;
const mongouri = process.env.MONGO_URI;
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    }
})

const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("addUser", (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log("User added:", socket.id);
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on("disconnect", () => {
        for (let [userId, socketId] of onlineUsers) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
        console.log("User disconnected:", socket.id);
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on("typing", ({ senderId, receiverId }) => {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing", senderId);
        }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("stopTyping", senderId);
        }
    });
})


//routes
app.use("/auth", authRoutes);
app.use("/users", getprofileRoute);
app.use("/posts", postRoute);
app.use("/messages", messageRoute);
app.use("/comments", commentRoute);
app.use("/stories", storiesRoute);
app.use("/notifications", notificationRoutes);
app.use("/search", searchRoute);

//MOGODB Connection 
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongouri);
        console.log(conn.connection.host);

    } catch (error) {
        console.log("Error connnecting MONGODB.");
        process.exit(1);
    }
}


const startServer = async () => {
    try {
        await connectDB();

        server.listen(port, () => {
            console.log(`Server running on PORT: ${port}`);
        });

    } catch (error) {
        console.log("Failed to start server");
    }
};

startServer();

export { io, onlineUsers };