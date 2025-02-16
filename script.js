const API_URL = "https://chat-app-6l0e.onrender.com";
// const API_URL = "http://localhost:3000";

let socket = null;
let localStream;
let remoteStream;
let peerConnection;
let screenStream;
let isCalling = false;

const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, // Free STUN server
    ],
};

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

        socket.on("answer", async (answer) => {
            console.log("Received answer:", answer);
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("ice-candidate", async (candidate) => {
            console.log("Received ICE candidate:", candidate);
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error("Error adding ICE candidate:", error);
            }
        });

        socket.on("call-accepted", () => {
            console.log("Call accepted by the other user");
            // Proceed with the call setup
        });

        socket.on("call-rejected", () => {
            console.log("Call rejected by the other user");
            alert("Call rejected");
            stopCall(); // End the call
        });

        socket.on("screen-share-started", (fromSocketId) => {
            console.log(`${fromSocketId} started screen sharing`);
            showNotification(`${fromSocketId} started screen sharing`, fromSocketId);
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

// WebRTC Functions
async function startCall() {
    try {
        // Get local media stream (camera and microphone)
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById("localVideo").srcObject = localStream;

        // Create and configure the PeerConnection
        await createPeerConnection();

        // Create an offer and set it as the local description
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log("Sending offer to:", socket.id);

        // Send the offer to the remote peer via signaling
        socket.emit("offer", offer, socket.id);

        // Show/Hide buttons
        document.getElementById("startCallButton").style.display = "none";
        document.getElementById("stopCallButton").style.display = "inline-block";
        isCalling = true;
    } catch (error) {
        console.error("Error starting call:", error);
    }
}

function stopCall() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
        peerConnection.close();
    }
    document.getElementById("localVideo").srcObject = null;
    document.getElementById("remoteVideo").srcObject = null;

    // Show/Hide buttons
    document.getElementById("startCallButton").style.display = "inline-block";
    document.getElementById("stopCallButton").style.display = "none";
    isCalling = false;
}

async function shareScreen() {
    try {
        // Check if peerConnection exists and is open
        if (!peerConnection || peerConnection.connectionState === "closed") {
            console.error("PeerConnection is not initialized or is closed. Start a call first.");
            return;
        }

        // Get screen stream
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        console.log("Screen track:", screenTrack);

        // Replace the existing video track with the screen track
        const sender = peerConnection.getSenders().find(s => s.track?.kind === "video");
        if (sender) {
            console.log("Replacing video track with screen track");
            await sender.replaceTrack(screenTrack);
        } else {
            console.error("No video sender found in PeerConnection.");
        }

        // Show the screen share in the local video element
        document.getElementById("localVideo").srcObject = screenStream;

        // Notify the other user
        socket.emit("screen-share-started", socket.id);
    } catch (error) {
        console.error("Error sharing screen:", error);
    }
}

async function createPeerConnection() {
    try {
        // Create a new RTCPeerConnection
        peerConnection = new RTCPeerConnection(servers);

        // Create a remote stream and set it to the remote video element
        remoteStream = new MediaStream();
        document.getElementById("remoteVideo").srcObject = remoteStream;

        // Add local tracks to the PeerConnection
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        // Handle incoming remote tracks
        peerConnection.ontrack = (event) => {
            console.log("Received remote track:", event.track);
            event.streams[0].getTracks().forEach(track => {
                remoteStream.addTrack(track);
            });
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("Sending ICE candidate:", event.candidate);
                socket.emit("ice-candidate", event.candidate, socket.id);
            }
        };

        // Log ICE connection state changes
        peerConnection.oniceconnectionstatechange = () => {
            console.log("ICE connection state:", peerConnection.iceConnectionState);
        };

        // Log PeerConnection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log("Connection state:", peerConnection.connectionState);
        };
    } catch (error) {
        console.error("Error creating PeerConnection:", error);
    }
}

// Notification Functions
function showNotification(message, fromSocketId) {
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notification-message");
    notificationMessage.textContent = message;
    notification.style.display = "block";

    document.getElementById("accept-call").onclick = () => {
        acceptCall(fromSocketId);
        notification.style.display = "none";
    };

    document.getElementById("reject-call").onclick = () => {
        rejectCall(fromSocketId);
        notification.style.display = "none";
    };
}

function acceptCall(fromSocketId) {
    createPeerConnection().then(() => {
        socket.emit("accept-call", fromSocketId);
    });
}

function rejectCall(fromSocketId) {
    socket.emit("reject-call", fromSocketId);
}
