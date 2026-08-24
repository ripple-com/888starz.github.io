import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

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

// GOOGLE LOGIN
window.googleLogin = async function () {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        localStorage.setItem("firebaseLoggedIn", "true");
        localStorage.setItem("userName", user.displayName || "");
        localStorage.setItem("userEmail", user.email || "");

        window.location.href = "index.html";
    } catch (error) {
        console.error("Google Login Error:", error);
        alert("Login failed: " + error.message);
    }
};

// LOGOUT
window.firebaseLogout = async function () {
    try {
        await signOut(auth);
        localStorage.clear();
        window.location.href = "login.html";
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        localStorage.setItem("firebaseLoggedIn", "true");
        localStorage.setItem("userName", user.displayName || "");
        localStorage.setItem("userEmail", user.email || "");
    }
});

export { app, auth, firebaseLogout };
