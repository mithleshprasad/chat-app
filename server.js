<<<<<<< HEAD
=======

// require("dotenv").config(); // Load environment variables
// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const path = require("path");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: "https://humble-dollop-6xp4xjrvwrq355p7-5500.app.github.dev",  // Frontend URL
//         methods: ["GET", "POST"]
//     }
// });
// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// // 🔹 Load Environment Variables
// const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chatApp";
// const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// // 🔹 Connect to MongoDB
// mongoose.connect(MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(() => console.log("✅ MongoDB Connected")).catch(err => console.log(err));

// // 🔹 User Schema (for Authentication)
// const UserSchema = new mongoose.Schema({
//     username: { type: String, unique: true, required: true },
//     password: { type: String, required: true }
// });
// const User = mongoose.model("User", UserSchema);

// // 🔹 Chat Schema (for Storing Messages)
// const ChatSchema = new mongoose.Schema({
//     sender: String,
//     receiver: String, // "all" for public, username for private
//     message: String,
//     timestamp: { type: Date, default: Date.now }
// });
// const Chat = mongoose.model("Chat", ChatSchema);

// // 🔹 Store active users (in-memory)
// const users = {};

// // 🚀 **User Registration**
// app.post("/register", async (req, res) => {
//     const { username, password } = req.body;
//     if (!username || !password) return res.status(400).json({ error: "All fields required" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     try {
//         const user = await User.create({ username, password: hashedPassword });
//         res.json({ message: "User registered successfully" });
//     } catch (err) {
//         res.status(400).json({ error: "Username already exists" });
//     }
// });

// // 🚀 **User Login (Returns JWT)**
// app.post("/login", async (req, res) => {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username });
//     if (!user) return res.status(400).json({ error: "Invalid credentials" });

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

//     const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
//     res.json({ token });
// });
// // 🚀 **Middleware: Authenticate Token**
// const authenticate = (req, res, next) => {
//     const token = req.headers.authorization;
//     if (!token) return res.status(401).json({ error: "Unauthorized" });
    
//     jwt.verify(token, JWT_SECRET, (err, user) => {
//         if (err) return res.status(403).json({ error: "Invalid token" });
//         req.user = user;
//         next();
//     });
// };

// app.get('/', (req,res) =>{
//     res.json({message:'server run successfull!'});
// })
// // 🚀 **Protected Route (Test Authentication)**
// app.get("/protected", authenticate, (req, res) => {
//     res.json({ message: `Hello, ${req.user.username}! You are authenticated.` });
// });

// // 🔹 Socket.io for Real-time Chat
// io.on("connection", (socket) => {
//     console.log(`🔹 User connected: ${socket.id}`);

//     // 🟢 User joins chat
//     socket.on("join", async (username) => {
//         users[socket.id] = username;
//         io.emit("userList", Object.values(users));

//         // Load chat history
//         const messages = await Chat.find().sort({ timestamp: 1 });
//         socket.emit("chat history", messages);

//         io.emit("chat message", { user: "System", text: `${username} joined the chat!`, system: true });
//     });

//     // ✉️ **Handle chat messages**
//     socket.on("chat message", async ({ message, receiver }) => {
//         const sender = users[socket.id];
//         const chat = new Chat({ sender, receiver, message });
//         await chat.save();

//         if (receiver === "all") {
//             io.emit("chat message", { user: sender, text: message });
//         } else {
//             const receiverSocket = Object.keys(users).find(key => users[key] === receiver);
//             if (receiverSocket) {
//                 io.to(receiverSocket).emit("chat message", { user: sender, text: message, private: true });
//             }
//         }
//     });

//     // 🔴 User disconnects
//     socket.on("disconnect", () => {
//         if (users[socket.id]) {
//             io.emit("chat message", { user: "System", text: `${users[socket.id]} left the chat`, system: true });
//             delete users[socket.id];
//             io.emit("userList", Object.values(users));
//         }
//     });
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
require("dotenv").config(); // Load environment variables
>>>>>>> e79b9eefaa5b528b3390c0d214ff270a4911833f
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Initialize Express
const app = express();
const server = http.createServer(app);
<<<<<<< HEAD
const io = new Server(server, {
    cors: { origin: "*" },
});

// Middleware
app.use(express.json());
app.use(cors());
require('dotenv').config(); // Load environment variables from .env file
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
=======

// 🔹 **CORS Middleware for Express**
const allowedOrigins = ["https://mithleshprasad.github.io"];
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// 🔹 **CORS for Socket.io**
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// 🔹 Load Environment Variables
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chatApp";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// 🔹 Connect to MongoDB
mongoose.connect(MONGO_URI, {
>>>>>>> e79b9eefaa5b528b3390c0d214ff270a4911833f
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
<<<<<<< HEAD

// Socket.io Connection
=======

// 🚀 **Middleware: Authenticate Token**
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};

app.get('/', (req, res) => {
    res.json({ message: 'Server running successfully!' });
});

// 🚀 **Protected Route (Test Authentication)**
app.get("/protected", authenticate, (req, res) => {
    res.json({ message: `Hello, ${req.user.username}! You are authenticated.` });
});

// 🔹 Socket.io for Real-time Chat
>>>>>>> e79b9eefaa5b528b3390c0d214ff270a4911833f
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
        socket.to(targetUser).emit("offer", offer, socket.id);
    });

    socket.on("answer", (answer, targetUser) => {
        socket.to(targetUser).emit("answer", answer, socket.id);
    });

    socket.on("ice-candidate", (candidate, targetUser) => {
        socket.to(targetUser).emit("ice-candidate", candidate, socket.id);
    });
});

<<<<<<< HEAD
// Start Server
const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
=======
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));



// require("dotenv").config(); // Load environment variables
// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const path = require("path");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: "https://mithleshprasad.github.io/chat-app/",  // Frontend URL
//         methods: ["GET", "POST"]
//     }
// });
// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// // 🔹 Load Environment Variables
// const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chatApp";
// const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// // 🔹 Connect to MongoDB
// mongoose.connect(MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(() => console.log("✅ MongoDB Connected")).catch(err => console.log(err));

// // 🔹 User Schema (for Authentication)
// const UserSchema = new mongoose.Schema({
//     username: { type: String, unique: true, required: true },
//     password: { type: String, required: true }
// });
// const User = mongoose.model("User", UserSchema);

// // 🔹 Chat Schema (for Storing Messages)
// const ChatSchema = new mongoose.Schema({
//     sender: String,
//     receiver: String, // "all" for public, username for private
//     message: String,
//     timestamp: { type: Date, default: Date.now }
// });
// const Chat = mongoose.model("Chat", ChatSchema);

// // 🔹 Store active users (in-memory)
// const users = {};

// // 🚀 **User Registration**
// app.post("/register", async (req, res) => {
//     const { username, password } = req.body;
//     if (!username || !password) return res.status(400).json({ error: "All fields required" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     try {
//         const user = await User.create({ username, password: hashedPassword });
//         res.json({ message: "User registered successfully" });
//     } catch (err) {
//         res.status(400).json({ error: "Username already exists" });
//     }
// });

// // 🚀 **User Login (Returns JWT)**
// app.post("/login", async (req, res) => {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username });
//     if (!user) return res.status(400).json({ error: "Invalid credentials" });

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

//     const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
//     res.json({ token });
// });
// // 🚀 **Middleware: Authenticate Token**
// const authenticate = (req, res, next) => {
//     const token = req.headers.authorization;
//     if (!token) return res.status(401).json({ error: "Unauthorized" });
    
//     jwt.verify(token, JWT_SECRET, (err, user) => {
//         if (err) return res.status(403).json({ error: "Invalid token" });
//         req.user = user;
//         next();
//     });
// };

// app.get('/', (req,res) =>{
//     res.json({message:'server run successfull!'});
// })
// // 🚀 **Protected Route (Test Authentication)**
// app.get("/protected", authenticate, (req, res) => {
//     res.json({ message: `Hello, ${req.user.username}! You are authenticated.` });
// });

// // 🔹 Socket.io for Real-time Chat
// io.on("connection", (socket) => {
//     console.log(`🔹 User connected: ${socket.id}`);

//     // 🟢 User joins chat
//     socket.on("join", async (username) => {
//         users[socket.id] = username;
//         io.emit("userList", Object.values(users));

//         // Load chat history
//         const messages = await Chat.find().sort({ timestamp: 1 });
//         socket.emit("chat history", messages);

//         io.emit("chat message", { user: "System", text: `${username} joined the chat!`, system: true });
//     });

//     // ✉️ **Handle chat messages**
//     socket.on("chat message", async ({ message, receiver }) => {
//         const sender = users[socket.id];
//         const chat = new Chat({ sender, receiver, message });
//         await chat.save();

//         if (receiver === "all") {
//             io.emit("chat message", { user: sender, text: message });
//         } else {
//             const receiverSocket = Object.keys(users).find(key => users[key] === receiver);
//             if (receiverSocket) {
//                 io.to(receiverSocket).emit("chat message", { user: sender, text: message, private: true });
//             }
//         }
//     });

//     // 🔴 User disconnects
//     socket.on("disconnect", () => {
//         if (users[socket.id]) {
//             io.emit("chat message", { user: "System", text: `${users[socket.id]} left the chat`, system: true });
//             delete users[socket.id];
//             io.emit("userList", Object.values(users));
//         }
//     });
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
>>>>>>> e79b9eefaa5b528b3390c0d214ff270a4911833f
