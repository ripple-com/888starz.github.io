import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCdLAlDB0GK6_GhvpgFLnjmwO_VRbvRIms",
    authDomain: "suwahas-sathsara.firebaseapp.com",
    projectId: "suwahas-sathsara",
    storageBucket: "suwahas-sathsara.firebasestorage.app",
    messagingSenderId: "394222087823",
    appId: "1:394222087823:web:1ae06879cb6e3763860afa",
    measurementId: "G-Z782V6MDGM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {
    const googleBtn = document.getElementById("googleLoginBtn");

    if (googleBtn) {
        googleBtn.addEventListener("click", async () => {
            try {
                googleBtn.style.opacity = "0.6";
                googleBtn.disabled = true;

                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;

                // Cache user details locally
                localStorage.setItem("firebaseLoggedIn", "true");
                localStorage.setItem("userName", user.displayName || "");
                localStorage.setItem("userEmail", user.email || "");

                // Redirect to Dashboard
                window.location.href = "index.html";
            } catch (error) {
                console.error("Login Error:", error);
                alert("Google Login Error: " + error.message);
                googleBtn.style.opacity = "1";
                googleBtn.disabled = false;
            }
        });
    }
});
