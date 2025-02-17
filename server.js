const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

const JWT_SECRET = "supersecretkey";

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    room: { type: String, required: true }
});
const User = mongoose.model("User", UserSchema);

const MessageSchema = new mongoose.Schema({
    user: { type: String, required: true },
    message: { type: String, required: true },
    room: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model("Message", MessageSchema);

app.post("/register", async (req, res) => {
    const { username, password, room } = req.body;
    if (!username || !password || !room) return res.status(400).json({ error: "All fields required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const newUser = new User({ username, password: hashedPassword, room });
        await newUser.save();
        res.json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(400).json({ error: "Username already exists" });
    }
});

app.post("/login", async (req, res) => {
    const { username, password, room } = req.body;
    const user = await User.findOne({ username, room });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ username, room }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});

app.get("/messages", async (req, res) => {
    const { room } = req.query;
    try {
        const messages = await Message.find({ room }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        res.status(500).json({ error: "Failed to retrieve messages" });
    }
});

const onlineUsers = new Map();

// io.on("connection", (socket) => {
//     const { room } = socket.handshake.auth;
//     console.log(`✅ User connected: ${socket.id} to room: ${room}`);

//     // Add user to online users
//     onlineUsers.set(socket.id, room);
//     updateOnlineUsers(room);

//     socket.on("disconnect", () => {
//         console.log(`❌ User disconnected: ${socket.id}`);
//         onlineUsers.delete(socket.id);
//         updateOnlineUsers(room);
//     });

//     socket.on("chatMessage", async (data) => {
//         if (!data.user || !data.message || !data.room) return;
//         const newMessage = new Message({ user: data.user, message: data.message, room: data.room });
//         await newMessage.save();
//         io.to(data.room).emit("chatMessage", { user: data.user, message: data.message });
//     });

//     socket.join(room);
// });
// Server-side (Node.js with Socket.IO)
io.on("connection", (socket) => {
    const room = socket.handshake.auth.room;
    const username = socket.handshake.auth.username;

    socket.join(room);

    // Notify all users in the room about the new connection
    io.to(room).emit("onlineUsers", {
        count: io.sockets.adapter.rooms.get(room)?.size || 0,
        users: Array.from(io.sockets.adapter.rooms.get(room) || []).map(id => io.sockets.sockets.get(id)?.handshake.auth.username)
    });

    socket.on("disconnect", () => {
        // Notify all users in the room about the disconnection
        io.to(room).emit("onlineUsers", {
            count: io.sockets.adapter.rooms.get(room)?.size || 0,
            users: Array.from(io.sockets.adapter.rooms.get(room) || []).map(id => io.sockets.sockets.get(id)?.handshake.auth.username)
        });
    });
});
function updateOnlineUsers(room) {
    const usersInRoom = Array.from(onlineUsers.values()).filter(r => r === room).length;
    io.to(room).emit("onlineUsers", usersInRoom);
}

const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));