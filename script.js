const API_URL = "http://localhost:3000";
let socket = null;

document.addEventListener("DOMContentLoaded", () => {
    // Login Logic
    document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("loginUsername").value.trim();
        const room = document.getElementById("loginRoom").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, room })
        });

        if (!res.ok) return alert("Invalid credentials");

        const { token } = await res.json();
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("room", room);
        window.location.replace("chat.html");
    });

    // Register Logic
    document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("registerUsername").value.trim();
        const room = document.getElementById("registerRoom").value.trim();
        const password = document.getElementById("registerPassword").value.trim();

        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, room })
        });

        const data = await res.json();
        alert(data.message || data.error);
    });

    // Chat Logic
    if (window.location.pathname.includes("chat.html")) {
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");
        const room = localStorage.getItem("room");

        if (!token || !username || !room) window.location.replace("index.html");

        // Display room name
        document.getElementById("roomName").textContent = room;

        // Connect to Socket.IO
        socket = io.connect(API_URL, { auth: { token, room } });

        // Fetch previous messages
        fetch(`${API_URL}/messages?room=${room}`)
            .then(res => res.json())
            .then(messages => {
                messages.forEach(msg => displayMessage(msg));
            });

        // Listen for new messages
        socket.on("chatMessage", (msg) => {
            displayMessage(msg);
        });

        // Update online users count
        socket.on("onlineUsers", (count) => {
            document.getElementById("onlineUsersCount").textContent = count;
        });
    }
});

// Helper Functions
function sendMessage() {
    const message = document.getElementById("messageInput").value.trim();
    const user = localStorage.getItem("username");
    const room = localStorage.getItem("room");
    if (!message) return;
    socket.emit("chatMessage", { user, message, room });
    document.getElementById("messageInput").value = "";
}

function displayMessage(msg) {
    const username = localStorage.getItem("username");
    const isSender = msg.user === username;
    const messageClass = isSender ? "sent" : "received";

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `
        <div class="message ${messageClass}">
            <b>${msg.user}:</b> ${msg.message}
            <span class="timestamp">${time}</span>
        </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight;
}

function logout() {
    localStorage.clear();
    window.location.replace("index.html");
}