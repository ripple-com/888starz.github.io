import { auth, firebaseLogout } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const db = getFirestore();
const storage = getStorage();

// Make Logout available globally
window.firebaseLogout = firebaseLogout;

/* PAGE NAVIGATION */
window.showPage = function (page) {
    document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
    
    const target = document.getElementById(page + "Page");
    if (target) {
        target.classList.add("active");
    }

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

/* UI UPDATE */
function updateUI(user) {
    const nameEl = document.getElementById("userName");
    const emailEl = document.getElementById("userEmail");
    const settingsEmailEl = document.getElementById("settingsEmail");

    const name = user?.displayName || localStorage.getItem("userName") || "Agent User";
    const email = user?.email || localStorage.getItem("userEmail") || "No email available";

    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.textContent = email;
    if (settingsEmailEl) settingsEmailEl.textContent = email;
}

/* INITIALIZATION & LISTENERS */
document.addEventListener("DOMContentLoaded", () => {
    // Immediate render from localStorage
    const cachedName = localStorage.getItem("userName");
    const cachedEmail = localStorage.getItem("userEmail");
    if (cachedName || cachedEmail) {
        updateUI({ displayName: cachedName, email: cachedEmail });
    }

    // Slider logic
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

    // Receipt Image Preview
    const receiptInput = document.getElementById("receipt");
    if (receiptInput) {
        receiptInput.addEventListener("change", function () {
            const file = this.files[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                showToast("Please select an image receipt.");
                return;
            }

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

/* AUTH CHECK */
onAuthStateChanged(auth, (user) => {
    if (user) {
        updateUI(user);
    } else {
        const cachedLoggedIn = localStorage.getItem("firebaseLoggedIn");
        if (!cachedLoggedIn) {
            window.location.href = "login.html";
        }
    }
});

/* TOAST SYSTEM */
let toastTimer;
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

/* DEPOSIT SUBMIT (FIRESTORE & STORAGE) */
window.submitDeposit = async function () {
    const user = auth.currentUser;
    const amount = document.getElementById("depositAmount").value.trim();
    const name = document.getElementById("depositName").value.trim();
    const gameId = document.getElementById("gameId").value.trim();
    const whatsapp = document.getElementById("depositWhatsapp").value.trim();
    const fileInput = document.getElementById("receipt");
    const file = fileInput ? fileInput.files[0] : null;
    const btn = document.getElementById("depositSubmitBtn");

    if (!file) {
        showToast("Please upload your receipt.");
        return;
    }

    if (!amount || !name || !gameId || !whatsapp) {
        showToast("Please complete all fields.");
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
            userId,
            name,
            gameId,
            whatsapp,
            amount: Number(amount),
            receiptURL,
            status: "pending",
            createdAt: serverTimestamp()
        });

        showToast("Deposit request submitted successfully!");
        window.showPage("home");
    } catch (err) {
        console.error(err);
        showToast("Submission failed: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "SUBMIT DEPOSIT REQUEST";
    }
};

/* WITHDRAWAL SUBMIT (FIRESTORE) */
window.submitWithdrawal = async function () {
    const user = auth.currentUser;
    const name = document.getElementById("withdrawName").value.trim();
    const gameId = document.getElementById("withdrawGameId").value.trim();
    const amount = document.getElementById("withdrawAmount").value.trim();
    const whatsapp = document.getElementById("withdrawWhatsapp").value.trim();
    const details = document.getElementById("withdrawDetails").value.trim();
    const btn = document.getElementById("withdrawSubmitBtn");

    if (!name || !gameId || !amount || !whatsapp || !details) {
        showToast("Please complete all fields.");
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = "SUBMITTING...";

        const userId = user ? user.uid : "guest";
        await addDoc(collection(db, "withdrawalRequests"), {
            userId,
            name,
            gameId,
            amount: Number(amount),
            whatsapp,
            paymentDetails: details,
            status: "pending",
            createdAt: serverTimestamp()
        });

        showToast("Withdrawal request submitted successfully!");
        window.showPage("home");
    } catch (err) {
        console.error(err);
        showToast("Submission failed: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "SUBMIT WITHDRAWAL REQUEST";
    }
};
