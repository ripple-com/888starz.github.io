import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

import { auth, db, storage } from "./firebase.js";

/* TOAST */
function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

/* AUTH MONITOR */
onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const nameEl = document.getElementById("userName");
    const emailEl = document.getElementById("userEmail");
    const settingsEmailEl = document.getElementById("settingsEmail");

    const displayName = user.displayName || (user.email ? user.email.split('@')[0] : "User");

    if (nameEl) nameEl.textContent = displayName;
    if (emailEl) emailEl.textContent = user.email || "";
    if (settingsEmailEl) settingsEmailEl.textContent = user.email || "";
});

/* NAVIGATION */
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

/* LOGOUT */
window.logout = function () {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    });
};

/* WHATSAPP */
window.openWhatsApp = function () {
    window.open("https://wa.me/94702883324", "_blank");
};

/* FILE PREVIEW */
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

/* DEPOSIT SUBMIT */
window.submitDeposit = async function () {
    const user = auth.currentUser;
    if (!user) return;

    const amount = document.getElementById("depositAmount").value.trim();
    const name = document.getElementById("depositName").value.trim();
    const gameId = document.getElementById("gameId").value.trim();
    const whatsapp = document.getElementById("depositWhatsapp").value.trim();
    const file = document.getElementById("receipt").files[0];
    const btn = document.getElementById("depositSubmitBtn");

    if (!amount || !name || !gameId || !whatsapp || !file) {
        alert("Please fill in all fields and upload payment receipt.");
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = "SUBMITTING...";

        const fileRef = ref(storage, `receipts/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const receiptURL = await getDownloadURL(fileRef);

        await addDoc(collection(db, "depositRequests"), {
            userId: user.uid,
            name, gameId, whatsapp,
            amount: Number(amount),
            receiptURL,
            status: "pending",
            createdAt: serverTimestamp()
        });

        showToast("Deposit request submitted successfully!");
        window.showPage("home");
    } catch (err) {
        console.error(err);
        alert("Submission failed. Try again.");
    } finally {
        btn.disabled = false;
        btn.textContent = "SUBMIT DEPOSIT REQUEST";
    }
};

/* WITHDRAWAL SUBMIT */
window.submitWithdrawal = async function () {
    const user = auth.currentUser;
    if (!user) return;

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

        await addDoc(collection(db, "withdrawalRequests"), {
            userId: user.uid,
            name, gameId, amount: Number(amount), whatsapp,
            paymentDetails: details,
            status: "pending",
            createdAt: serverTimestamp()
        });

        showToast("Withdrawal request submitted successfully!");
        window.showPage("home");
    } catch (err) {
        console.error(err);
        alert("Submission failed. Try again.");
    } finally {
        btn.disabled = false;
        btn.textContent = "SUBMIT WITHDRAWAL REQUEST";
    }
};
