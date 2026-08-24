import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

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
const db = getFirestore(app);
const storage = getStorage(app);

// 1. Navigation Logic Function
function showPage(page) {
    document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
    const target = document.getElementById(page + "Page");
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.page === page);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// 2. Dynamic User Information Renderer
function renderUserInfo(user) {
    const nameEl = document.getElementById("userName");
    const emailEl = document.getElementById("userEmail");

    if (user) {
        if (nameEl) nameEl.textContent = user.displayName || "User Account";
        if (emailEl) emailEl.textContent = user.email || "Active User";
    } else {
        const cachedName = localStorage.getItem("userName");
        const cachedEmail = localStorage.getItem("userEmail");
        if (nameEl) nameEl.textContent = cachedName || "Guest User";
        if (emailEl) emailEl.textContent = cachedEmail || "Not Logged In";
    }
}

// 3. Main Initialization on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    // Render initial UI from local state immediately
    renderUserInfo(null);

    // Event Listener Routing for Navigation Buttons
    document.querySelectorAll("[data-page]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const page = e.currentTarget.getAttribute("data-page");
            if (page) showPage(page);
        });
    });

    // Image Slider Setup
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".slider-dot");
    let currentSlide = 0;

    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove("active");
            if (dots[currentSlide]) dots[currentSlide].classList.remove("active");
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add("active");
            if (dots[currentSlide]) dots[currentSlide].classList.add("active");
        }, 4000);
    }

    // Receipt File Preview Listener
    const receiptInput = document.getElementById("receipt");
    if (receiptInput) {
        receiptInput.addEventListener("change", function () {
            const file = this.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                const preview = document.getElementById("receiptPreview");
                const content = document.getElementById("uploadContent");
                if (preview && content) {
                    preview.src = e.target.result;
                    preview.style.display = "block";
                    content.style.display = "none";
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // Logout Click Handlers
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await signOut(auth);
                localStorage.clear();
                window.location.href = "login.html";
            } catch (err) {
                console.error("Logout Error:", err);
            }
        });
    }
});

// 4. Firebase Auth Sync
onAuthStateChanged(auth, (user) => {
    if (user) {
        localStorage.setItem("firebaseLoggedIn", "true");
        localStorage.setItem("userName", user.displayName || "");
        localStorage.setItem("userEmail", user.email || "");
        renderUserInfo(user);
    } else {
        const isLogged = localStorage.getItem("firebaseLoggedIn");
        if (!isLogged && !window.location.pathname.includes("login.html")) {
            window.location.href = "login.html";
        }
    }
});
