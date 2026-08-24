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
const googleProvider = new GoogleAuthProvider();

// Bind Page Navigation to Window
window.showPage = function (page) {
    document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
    const target = document.getElementById(page + "Page");
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.page === page);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
};

window.openWhatsApp = function () {
    window.open("https://wa.me/94702883324", "_blank");
};

window.toggleSetting = function (button) {
    button.classList.toggle("on");
};

window.googleLogin = async function () {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        localStorage.setItem("firebaseLoggedIn", "true");
        localStorage.setItem("userName", user.displayName || "");
        localStorage.setItem("userEmail", user.email || "");
        window.location.href = "index.html";
    } catch (error) {
        alert("Login failed: " + error.message);
    }
};

window.firebaseLogout = async function () {
    try {
        await signOut(auth);
        localStorage.clear();
        window.location.href = "login.html";
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

// UI Update Function with Instant Fallback
function updateUserInfo(name, email) {
    const nameEl = document.getElementById("userName");
    const emailEl = document.getElementById("userEmail");
    const settingsEmailEl = document.getElementById("settingsEmail");

    const finalName = name || localStorage.getItem("userName") || "Authorized Agent";
    const finalEmail = email || localStorage.getItem("userEmail") || "Agent Account Active";

    if (nameEl) nameEl.textContent = finalName;
    if (emailEl) emailEl.textContent = finalEmail;
    if (settingsEmailEl) settingsEmailEl.textContent = finalEmail;
}

// Immediate Execution on Load
document.addEventListener("DOMContentLoaded", () => {
    // 1. Instantly set user info from cache or default
    updateUserInfo();

    // 2. Image Slider
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

    // 3. Receipt Upload Preview
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
});

// Auth State Sync
onAuthStateChanged(auth, (user) => {
    if (user) {
        localStorage.setItem("firebaseLoggedIn", "true");
        localStorage.setItem("userName", user.displayName || "");
        localStorage.setItem("userEmail", user.email || "");
        updateUserInfo(user.displayName, user.email);
    } else {
        updateUserInfo();
    }
});

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
}

// Submit Functions
window.submitDeposit = async function () {
    const user = auth.currentUser;
    const amount = document.getElementById("depositAmount").value.trim();
    const name = document.getElementById("depositName").value.trim();
    const gameId = document.getElementById("gameId").value.trim();
    const whatsapp = document.getElementById("depositWhatsapp").value.trim();
    const fileInput = document.getElementById("receipt");
    const file = fileInput ? fileInput.files[0] : null;
    const btn = document.getElementById("depositSubmitBtn");

    if (!file || !amount || !name || !gameId || !whatsapp) {
        showToast("Please fill all fields and attach receipt.");
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = "SUBMITTING...";

        const userId = user ? user.uid : "guest";
        const fileRef = ref(storage, `receipts/${userId}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const receiptURL = await getDownloadURL(fileRef);

        await addDoc(collection(db, "depositRequests"), {
            userId, name, gameId, whatsapp, amount: Number(amount), receiptURL, status: "pending", createdAt: serverTimestamp()
        });

        showToast("Deposit request submitted successfully!");
        window.showPage("home");
    } catch (err) {
        showToast("Error: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "SUBMIT DEPOSIT REQUEST";
    }
};

window.submitWithdrawal = async function () {
    const user = auth.currentUser;
    const name = document.getElementById("withdrawName").value.trim();
    const gameId = document.getElementById("withdrawGameId").value.trim();
    const amount = document.getElementById("withdrawAmount").value.trim();
    const whatsapp = document.getElementById("withdrawWhatsapp").value.trim();
    const details = document.getElementById("withdrawDetails").value.trim();
    const btn = document.getElementById("withdrawSubmitBtn");

    if (!name || !gameId || !amount || !whatsapp || !details) {
        showToast("Please fill all fields.");
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = "SUBMITTING...";

        const userId = user ? user.uid : "guest";
        await addDoc(collection(db, "withdrawalRequests"), {
            userId, name, gameId, amount: Number(amount), whatsapp, paymentDetails: details, status: "pending", createdAt: serverTimestamp()
        });

        showToast("Withdrawal request submitted successfully!");
        window.showPage("home");
    } catch (err) {
        showToast("Error: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "SUBMIT WITHDRAWAL REQUEST";
    }
};
