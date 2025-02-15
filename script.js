const API_URL = "https://chat-app-6l0e.onrender.com";
let socket = null;

// Login
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
    
    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    
    if (res.ok) {
        const { token } = await res.json();
        localStorage.setItem("token", token);
        window.location.href = "chat.html";
    } else {
        alert("Invalid credentials");
    }
});

// Register
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    alert("User registered successfully!");
});

// Chat Page
if (window.location.pathname === "/chat.html") {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "index.html";

    const username = JSON.parse(atob(token.split(".")[1])).username;
    document.getElementById("username").innerText = username;

    socket = io.connect(API_URL);
    socket.emit("join", username);

    socket.on("userList", (users) => {
        document.getElementById("usersList").innerHTML = users.map((user) => `<li>${user}</li>`).join("");
    });

    socket.on("chatMessage", (msg) => {
        document.getElementById("chatBox").innerHTML += `<p><b>${msg.user}:</b> ${msg.text}</p>`;
    });
}

function sendMessage() {
    const message = document.getElementById("messageInput").value;
    socket.emit("chatMessage", message);
    document.getElementById("messageInput").value = "";
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}
