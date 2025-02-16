const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// JWT Secret Key
const JWT_SECRET = "supersecretkey";

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

// Message Schema
const MessageSchema = new mongoose.Schema({
    user: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", MessageSchema);

// Register User
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "All fields required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(400).json({ error: "Username already exists" });
    }
});

// Login User
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});

// Fetch Messages
app.get("/messages", async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        res.status(500).json({ error: "Failed to retrieve messages" });
    }
});

// Socket.io Connection
io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });

    // Handle Chat Messages
    socket.on("chatMessage", async (data) => {
        if (!data.user || !data.message) return;
        const newMessage = new Message({ user: data.user, message: data.message });
        await newMessage.save();
        io.emit("chatMessage", { user: data.user, message: data.message });
    });

    // Handle WebRTC Signaling
    socket.on("offer", (offer, targetUser) => {
        console.log(`Sending offer to ${targetUser}`);
        socket.to(targetUser).emit("offer", offer, socket.id);
    });

    socket.on("answer", (answer, targetUser) => {
        console.log(`Sending answer to ${targetUser}`);
        socket.to(targetUser).emit("answer", answer, socket.id);
    });

    socket.on("ice-candidate", (candidate, targetUser) => {
        console.log(`Sending ICE candidate to ${targetUser}`);
        socket.to(targetUser).emit("ice-candidate", candidate, socket.id);
    });

    // Handle call acceptance
    socket.on("accept-call", (targetUser) => {
        console.log(`Call accepted by ${targetUser}`);
        socket.to(targetUser).emit("call-accepted");
    });

    // Handle call rejection
    socket.on("reject-call", (targetUser) => {
        console.log(`Call rejected by ${targetUser}`);
        socket.to(targetUser).emit("call-rejected");
    });

    // Handle screen share notification
    socket.on("screen-share-started", (targetUser) => {
        console.log(`Screen share started by ${socket.id}`);
        socket.to(targetUser).emit("screen-share-started", socket.id);
    });
});

// Start Server
const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
