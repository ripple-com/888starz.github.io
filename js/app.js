import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
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

// Toast Alert
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
}

// Navigation Function
function showPage(page) {
    document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
    const target = document.getElementById(page + "Page");
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.page === page);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Dynamic Profile Details Update
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

// DOM Handlers Init
document.addEventListener("DOMContentLoaded", () => {
    renderUserInfo(null);

    // Event Listener Routing for Navigation
    document.querySelectorAll("[data-page]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const page = e.currentTarget.getAttribute("data-page");
            if (page) showPage(page);
        });
    });

    // Image Slider
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

    // File Preview
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

    // Logout Action
    const logoutBtn = document.getElementById("logoutBtn");
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

    // Toggle Notifications
    const toggleBtn = document.getElementById("toggleNotifBtn");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            toggleBtn.classList.toggle("on");
        });
    }

    // Support Link
    const whatsappBtn = document.getElementById("whatsappSupportBtn");
    if (whatsappBtn) {
        whatsappBtn.addEventListener("click", () => {
            window.open("https://wa.me/94702883324", "_blank");
        });
    }

    // Deposit Submit Action
    const depositSubmitBtn = document.getElementById("depositSubmitBtn");
    if (depositSubmitBtn) {
        depositSubmitBtn.addEventListener("click", async () => {
            const user = auth.currentUser;
            const amount = document.getElementById("depositAmount").value.trim();
            const name = document.getElementById("depositName").value.trim();
            const gameId = document.getElementById("gameId").value.trim();
            const whatsapp = document.getElementById("depositWhatsapp").value.trim();
            const fileInput = document.getElementById("receipt");
            const file = fileInput ? fileInput.files[0] : null;

            if (!file || !amount || !name || !gameId || !whatsapp) {
                showToast("Please fill all fields and upload receipt.");
                return;
            }

            try {
                depositSubmitBtn.disabled = true;
                depositSubmitBtn.textContent = "SUBMITTING...";

                const userId = user ? user.uid : "guest";
                const fileRef = ref(storage, `receipts/${userId}/${Date.now()}_${file.name}`);
                await uploadBytes(fileRef, file);
                const receiptURL = await getDownloadURL(fileRef);

                await addDoc(collection(db, "depositRequests"), {
                    userId, name, gameId, whatsapp, amount: Number(amount), receiptURL, status: "pending", createdAt: serverTimestamp()
                });

                showToast("Deposit request submitted successfully!");
                showPage("home");
            } catch (err) {
                showToast("Error: " + err.message);
            } finally {
                depositSubmitBtn.disabled = false;
                depositSubmitBtn.textContent = "SUBMIT DEPOSIT REQUEST";
            }
        });
    }

    // Withdrawal Submit Action
    const withdrawSubmitBtn = document.getElementById("withdrawSubmitBtn");
    if (withdrawSubmitBtn) {
        withdrawSubmitBtn.addEventListener("click", async () => {
            const user = auth.currentUser;
            const name = document.getElementById("withdrawName").value.trim();
            const gameId = document.getElementById("withdrawGameId").value.trim();
            const amount = document.getElementById("withdrawAmount").value.trim();
            const whatsapp = document.getElementById("withdrawWhatsapp").value.trim();
            const details = document.getElementById("withdrawDetails").value.trim();

            if (!name || !gameId || !amount || !whatsapp || !details) {
                showToast("Please fill all fields.");
                return;
            }

            try {
                withdrawSubmitBtn.disabled = true;
                withdrawSubmitBtn.textContent = "SUBMITTING...";

                const userId = user ? user.uid : "guest";
                await addDoc(collection(db, "withdrawalRequests"), {
                    userId, name, gameId, amount: Number(amount), whatsapp, paymentDetails: details, status: "pending", createdAt: serverTimestamp()
                });

                showToast("Withdrawal request submitted successfully!");
                showPage("home");
            } catch (err) {
                showToast("Error: " + err.message);
            } finally {
                withdrawSubmitBtn.disabled = false;
                withdrawSubmitBtn.textContent = "SUBMIT WITHDRAWAL REQUEST";
            }
        });
    }
});

// Auth Listener
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
