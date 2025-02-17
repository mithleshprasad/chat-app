const API_URL = "https://chat-app-6l0e.onrender.com";
let socket = null;

document.addEventListener("DOMContentLoaded", () => {
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

    // Update online users count and list
    socket.on("onlineUsers", (users) => {
        document.getElementById("onlineUsersCount").textContent = users.length;
        document.getElementById("userNameList").textContent = users.join(", ");
    });
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
