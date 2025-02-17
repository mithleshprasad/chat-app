const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const toggleRegister = document.getElementById("toggleRegister");

    // Toggle between login and register forms
    toggleRegister.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.style.display = "none";
        registerForm.style.display = "block";
    });

    // Login Logic
    loginForm?.addEventListener("submit", async (e) => {
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
    registerForm?.addEventListener("submit", async (e) => {
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
});