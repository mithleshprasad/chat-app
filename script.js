const API_URL = "https://chat-app-6l0e.onrender.com";
// const API_URL = "http://localhost:3000";
let socket = null;
let localStream;
let remoteStream;
let peerConnection;

const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
    ],
};

document.addEventListener("DOMContentLoaded", () => {
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

    if (window.location.pathname.includes("chat.html")) {
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");
        if (!token) window.location.replace("index.html");

        socket = io.connect(API_URL, { auth: { token } });

        // Fetch previous messages when chat loads
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
            await createPeerConnection();
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit("answer", answer, fromSocketId);
        });

        socket.on("answer", async (answer) => {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("ice-candidate", async (candidate) => {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error("Error adding ICE candidate:", error);
            }
        });
    }
});

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

    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `
        <div class="message ${messageClass}">
            <b>${msg.user}:</b> ${msg.message}
        </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
}

function logout() {
    localStorage.clear();
    window.location.replace("index.html");
}

async function startCall() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById("localVideo").srcObject = localStream;

    await createPeerConnection();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", offer, socket.id);
}

async function createPeerConnection() {
    peerConnection = new RTCPeerConnection(servers);

    remoteStream = new MediaStream();
    document.getElementById("remoteVideo").srcObject = remoteStream;

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        });
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("ice-candidate", event.candidate, socket.id);
        }
    };
}