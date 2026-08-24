import { auth, firebaseLogout } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const db = getFirestore();
const storage = getStorage();

window.firebaseLogout = firebaseLogout;

// USER DETAILS UPDATE
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

// DOM LOADED INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    const cachedName = localStorage.getItem("userName");
    const cachedEmail = localStorage.getItem("userEmail");

    if (cachedName || cachedEmail) {
        updateUI({ displayName: cachedName, email: cachedEmail });
    }

    const receiptInput = document.getElementById("receipt");
    if (receiptInput) {
        receiptInput.addEventListener("change", e => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = event => {
                const preview = document.getElementById("receiptPreview");
                const content = document.getElementById("uploadContent");
                if (preview && content) {
                    preview.src = event.target.result;
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

/* NAVIGATION */
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

function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

/* SUBMIT DEPOSIT */
window.submitDeposit = async function () {
    const user = auth.currentUser;
    const amount = document.getElementById("depositAmount").value.trim();
    const name = document.getElementById("depositName").value.trim();
    const gameId = document.getElementById("gameId").value.trim();
    const whatsapp = document.getElementById("depositWhatsapp").value.trim();
    const fileInput = document.getElementById("receipt");
    const file = fileInput.files[0];
    const btn = document.getElementById("depositSubmitBtn");

    if (!amount || !name || !gameId || !whatsapp || !file) {
        alert("Please fill in all fields and upload payment receipt.");
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
            userId, name, gameId, whatsapp,
            amount: Number(amount),
            receiptURL,
            status: "pending",
            createdAt: serverTimestamp()
        });

        showToast("Deposit request submitted successfully!");
        window.showPage("home");
    } catch (err) {
        console.error(err);
        alert("Submission failed: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "SUBMIT DEPOSIT REQUEST";
    }
};

/* SUBMIT WITHDRAWAL */
window.submitWithdrawal = async function () {
    const user = auth.currentUser;
    const name = document.getElementById("withdrawName").value.trim();
    const gameId = document.getElementById("withdrawGameId").value.trim();
    const amount = document.getElementById("withdrawAmount").value.trim();
    const whatsapp = document.getElementById("withdrawWhatsapp").value.trim();
    const details = document.getElementById("withdrawDetails").value.trim();
    const btn = document.getElementById("withdrawSubmitBtn");

    if (!name || !gameId || !amount || !whatsapp || !details) {
        alert("Please complete all details.");
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = "SUBMITTING...";

        const userId = user ? user.uid : "guest";
        await addDoc(collection(db, "withdrawalRequests"), {
            userId, name, gameId, amount: Number(amount), whatsapp,
            paymentDetails: details,
            status: "pending",
            createdAt: serverTimestamp()
        });

        showToast("Withdrawal request submitted successfully!");
        window.showPage("home");
    } catch (err) {
        console.error(err);
        alert("Submission failed: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "SUBMIT WITHDRAWAL REQUEST";
    }
};
