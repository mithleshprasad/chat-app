// const API_URL = "https://chat-app-6l0e.onrender.com";

// document.addEventListener("DOMContentLoaded", () => {
//     const loginForm = document.getElementById("loginForm");
//     const registerForm = document.getElementById("registerForm");
//     const toggleRegister = document.getElementById("toggleRegister");

//     // Toggle between login and register forms
//     toggleRegister.addEventListener("click", (e) => {
//         e.preventDefault();
//         loginForm.style.display = "none";
//         registerForm.style.display = "block";
//     });

//     // Login Logic
//     loginForm?.addEventListener("submit", async (e) => {
//         e.preventDefault();
//         const username = document.getElementById("loginUsername").value.trim();
//         const room = document.getElementById("loginRoom").value.trim();
//         const password = document.getElementById("loginPassword").value.trim();

//         const res = await fetch(`${API_URL}/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ username, password, room })
//         });

//         if (!res.ok) return alert("Invalid credentials");

//         const { token } = await res.json();
//         localStorage.setItem("token", token);
//         localStorage.setItem("username", username);
//         localStorage.setItem("room", room);
//         window.location.replace("chat.html");
//     });

//     // Register Logic
//     registerForm?.addEventListener("submit", async (e) => {
//         e.preventDefault();
//         const username = document.getElementById("registerUsername").value.trim();
//         const room = document.getElementById("registerRoom").value.trim();
//         const password = document.getElementById("registerPassword").value.trim();

//         const res = await fetch(`${API_URL}/register`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ username, password, room })
//         });

//         const data = await res.json();
//         alert(data.message || data.error);
//     });
// });
const API_URL = "https://chat-app-6l0e.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const toggleRegister = document.getElementById("toggleRegister");
    const loadingSpinner = document.getElementById("loadingSpinner"); // The loading spinner element

    // Toggle between login and register forms
    toggleRegister.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.style.display = "none";
        registerForm.style.display = "block";
    });

    // Show the loading spinner while submitting
    const showLoading = () => {
        loadingSpinner.style.display = "block"; // Show spinner
    };

    // Hide the loading spinner once the API call is done
    const hideLoading = () => {
        loadingSpinner.style.display = "none"; // Hide spinner
    };

    // Login Logic
    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("loginUsername").value.trim();
        const room = document.getElementById("loginRoom").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        showLoading(); // Show spinner

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, room })
            });

            if (!res.ok) {
                hideLoading(); // Hide spinner if error
                return alert("Invalid credentials");
            }

            const { token } = await res.json();
            localStorage.setItem("token", token);
            localStorage.setItem("username", username);
            localStorage.setItem("room", room);
            window.location.replace("chat.html");
        } catch (error) {
            hideLoading(); // Hide spinner in case of network errors
            console.error("Login error:", error);
            alert("Something went wrong, please try again.");
        }
    });

    // Register Logic
    registerForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("registerUsername").value.trim();
        const room = document.getElementById("registerRoom").value.trim();
        const password = document.getElementById("registerPassword").value.trim();

        showLoading(); // Show spinner

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, room })
            });

            const data = await res.json();
            hideLoading(); // Hide spinner
            alert(data.message || data.error);
        } catch (error) {
            hideLoading(); // Hide spinner in case of network errors
            console.error("Registration error:", error);
            alert("Something went wrong, please try again.");
        }
    });
});
