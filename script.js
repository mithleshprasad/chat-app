const API_URL = "https://chat-app-6l0e.onrender.com";
let socket = null;
let localStream;


document.addEventListener("DOMContentLoaded", () => {
    // Login and Register Logic
    document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) return alert("Invalid credentials");

        const { token } = await res.json();
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        window.location.replace("chat.html");
    });

    document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("registerUsername").value.trim();
        const password = document.getElementById("registerPassword").value.trim();

        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        alert(data.message || data.error);
    });

    // Chat and Video Call Logic
    if (window.location.pathname.includes("chat.html")) {
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");
        if (!token) window.location.replace("index.html");

        socket = io.connect(API_URL, { auth: { token } });

        // Fetch previous messages
        fetch(`${API_URL}/messages`)
            .then(res => res.json())
            .then(messages => {
                messages.forEach(msg => displayMessage(msg));
            });

        // Listen for new messages
        socket.on("chatMessage", (msg) => {
            displayMessage(msg);
        });

        // WebRTC Signaling
        socket.on("offer", async (offer, fromSocketId) => {
            console.log("Received offer from:", fromSocketId);
            showNotification(`Incoming call from ${fromSocketId}`, fromSocketId);
        });


    }
});

// Helper Functions
function sendMessage() {
    const message = document.getElementById("messageInput").value.trim();
    const user = localStorage.getItem("username");
    if (!message) return;
    socket.emit("chatMessage", { user, message });
    document.getElementById("messageInput").value = "";
}
function displayMessage(msg) {
    const username = localStorage.getItem("username");
    const isSender = msg.user === username;
    const messageClass = isSender ? "sent" : "received";

    // Get current time and format it
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `
        <div class="message ${messageClass}">
            <b>${msg.user}:</b> ${msg.message}
            <span class="timestamp">${time}</span>
        </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
}


function logout() {
    localStorage.clear();
    window.location.replace("index.html");
}

