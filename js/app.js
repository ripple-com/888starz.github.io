// Dynamic UI Update Function
function updateUserInfo(user) {
    const nameEl = document.getElementById("userName");
    const emailEl = document.getElementById("userEmail");
    const settingsEmailEl = document.getElementById("settingsEmail");

    if (user) {
        // Firebase Auth එකෙන් ලොග් වුණු User ගේ විස්තර ගනී
        const name = user.displayName || localStorage.getItem("userName") || "User Account";
        const email = user.email || localStorage.getItem("userEmail") || "Active User";

        if (nameEl) nameEl.textContent = name;
        if (emailEl) emailEl.textContent = email;
        if (settingsEmailEl) settingsEmailEl.textContent = email;
    } else {
        // Login වෙලා නැත්නම් විතරක් "Not Logged In" පෙන්වයි
        if (nameEl) nameEl.textContent = "Guest User";
        if (emailEl) emailEl.textContent = "Not Logged In";
        if (settingsEmailEl) settingsEmailEl.textContent = "Not Logged In";
    }
}

// Auth State Listener Fix
onAuthStateChanged(auth, (user) => {
    if (user) {
        localStorage.setItem("firebaseLoggedIn", "true");
        localStorage.setItem("userName", user.displayName || "");
        localStorage.setItem("userEmail", user.email || "");
        updateUserInfo(user);
    } else {
        const isLogged = localStorage.getItem("firebaseLoggedIn");
        if (!isLogged && !window.location.pathname.includes("login.html")) {
            window.location.href = "login.html";
        } else {
            updateUserInfo(null);
        }
    }
});
