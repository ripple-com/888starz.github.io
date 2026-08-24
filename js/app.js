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

import {
    auth,
    db,
    storage
} from "./firebase.js";

/* TOAST NOTIFICATION */
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/* AUTH MONITOR */
onAuthStateChanged(auth, user => {
    if (!user) {
        location.href = "login.html";
        return;
    }

    const nameEl = document.getElementById("userName");
    const emailEl = document.getElementById("userEmail");
    const settingsEmailEl = document.getElementById("settingsEmail");

    if (nameEl) nameEl.textContent = user.displayName || "User";
    if (emailEl) emailEl.textContent = user.email || "";
    if (settingsEmailEl) settingsEmailEl.textContent = user.email || "";
});

/* LOGOUT */
window.logout = async function () {
    try {
        await signOut(auth);
        location.href = "login.html";
    } catch (error) {
        console.error(error);
        alert("Logout failed.");
    }
};

/* WHATSAPP SUPPORT */
window.openWhatsApp = function () {
    window.open("https://wa.me/94702883324", "_blank");
};

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

/* RECEIPT PREVIEW */
const receiptInput = document.getElementById("receipt");
if (receiptInput) {
    receiptInput.addEventListener("change", event => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file (JPG, PNG, WEBP).");
            receiptInput.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Maximum file size allowed is 5MB.");
            receiptInput.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
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

function resetDepositForm() {
    document.getElementById("depositAmount").value = "";
    document.getElementById("depositName").value = "";
    document.getElementById("gameId").value = "";
    document.getElementById("depositWhatsapp").value = "";
    const receipt = document.getElementById("receipt");
    if (receipt) receipt.value = "";

    const preview = document.getElementById("receiptPreview");
    const content = document.getElementById("uploadContent");
    if (preview && content) {
        preview.src = "";
        preview.style.display = "none";
        content.style.display = "block";
    }
}

/* SUBMIT DEPOSIT */
window.submitDeposit = async function () {
    const user = auth.currentUser;
    if (!user) {
        location.href = "login.html";
        return;
    }

    const amount = document.getElementById("depositAmount").value.trim();
    const name = document.getElementById("depositName").value.trim();
    const gameId = document.getElementById("gameId").value.trim();
    const whatsapp = document.getElementById("depositWhatsapp").value.trim();
    const fileInput = document.getElementById("receipt");
    const file = fileInput ? fileInput.files[0] : null;
    const submitBtn = document.getElementById("depositSubmitBtn");

    if (!amount || !name || !gameId || !whatsapp || !file) {
        alert("Please fill in all fields and upload a payment receipt.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Receipt file must be below 5MB.");
        return;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "SUBMITTING...";
        }

        const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const fileRef = ref(storage, `receipts/${user.uid}/${safeFileName}`);

        await uploadBytes(fileRef, file);
        const receiptURL = await getDownloadURL(fileRef);

        await addDoc(collection(db, "depositRequests"), {
            userId: user.uid,
            name: name,
            gameId: gameId,
            whatsapp: whatsapp,
            amount: Number(amount),
            receiptURL: receiptURL,
            status: "pending",
            createdAt: serverTimestamp()
        });

        showToast("Deposit request submitted successfully!");
        resetDepositForm();
        window.showPage("home");

    } catch (error) {
        console.error("Deposit submission error:", error);
        alert("Deposit request failed. Please try again.");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "SUBMIT DEPOSIT REQUEST";
        }
    }
};

/* SUBMIT WITHDRAWAL */
window.submitWithdrawal = async function () {
    const user = auth.currentUser;
    if (!user) {
        location.href = "login.html";
        return;
    }

    const name = document.getElementById("withdrawName").value.trim();
    const gameId = document.getElementById("withdrawGameId").value.trim();
    const amount = document.getElementById("withdrawAmount").value.trim();
    const whatsapp = document.getElementById("withdrawWhatsapp").value.trim();
    const details = document.getElementById("withdrawDetails").value.trim();
    const submitBtn = document.getElementById("withdrawSubmitBtn");

    if (!name || !gameId || !amount || !whatsapp || !details) {
        alert("Please complete all withdrawal fields.");
        return;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "SUBMITTING...";
        }

        await addDoc(collection(db, "withdrawalRequests"), {
            userId: user.uid,
            name: name,
            gameId: gameId,
            amount: Number(amount),
            whatsapp: whatsapp,
            paymentDetails: details,
            status: "pending",
            createdAt: serverTimestamp()
        });

        showToast("Withdrawal request submitted successfully!");
        
        document.getElementById("withdrawName").value = "";
        document.getElementById("withdrawGameId").value = "";
        document.getElementById("withdrawAmount").value = "";
        document.getElementById("withdrawWhatsapp").value = "";
        document.getElementById("withdrawDetails").value = "";

        window.showPage("home");

    } catch (error) {
        console.error("Withdrawal submission error:", error);
        alert("Withdrawal request failed. Please try again.");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "SUBMIT WITHDRAWAL REQUEST";
        }
    }
};
    if (!user) {
        location.href = "login.html";
        return;
    }

    const nameEl = document.getElementById("userName");
    const emailEl = document.getElementById("userEmail");
    const settingsEmailEl = document.getElementById("settingsEmail");

    if (nameEl) nameEl.textContent = user.displayName || "User";
    if (emailEl) emailEl.textContent = user.email || "";
    if (settingsEmailEl) settingsEmailEl.textContent = user.email || "";
});

/* LOGOUT */
window.logout = async function () {
    try {
        await signOut(auth);
        location.href = "login.html";
    } catch (error) {
        console.error(error);
        alert("Logout failed.");
    }
};

/* WHATSAPP SUPPORT */
window.openWhatsApp = function () {
    window.open("https://wa.me/94702883324", "_blank");
};

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

/* RECEIPT PREVIEW */
const receiptInput = document.getElementById("receipt");
if (receiptInput) {
    receiptInput.addEventListener("change", event => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file (JPG, PNG, WEBP).");
            receiptInput.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Maximum file size allowed is 5MB.");
            receiptInput.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
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

function resetDepositForm() {
    document.getElementById("depositAmount").value = "";
    document.getElementById("depositName").value = "";
    document.getElementById("gameId").value = "";
    document.getElementById("depositWhatsapp").value = "";
    const receipt = document.getElementById("receipt");
    if (receipt) receipt.value = "";

    const preview = document.getElementById("receiptPreview");
    const content = document.getElementById("uploadContent");
    if (preview && content) {
        preview.src = "";
        preview.style.display = "none";
        content.style.display = "block";
    }
}

/* SUBMIT DEPOSIT */
window.submitDeposit = async function () {
    const user = auth.currentUser;
    if (!user) {
        location.href = "login.html";
        return;
    }

    const amount = document.getElementById("depositAmount").value.trim();
    const name = document.getElementById("depositName").value.trim();
    const gameId = document.getElementById("gameId").value.trim();
    const whatsapp = document.getElementById("depositWhatsapp").value.trim();
    const fileInput = document.getElementById("receipt");
    const file = fileInput ? fileInput.files[0] : null;
    const submitBtn = document.getElementById("depositSubmitBtn");

    if (!amount || !name || !gameId || !whatsapp || !file) {
        alert("Please fill in all fields and upload a payment receipt.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Receipt file must be below 5MB.");
        return;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "SUBMITTING...";
        }

        const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const fileRef = ref(storage, `receipts/${user.uid}/${safeFileName}`);

        await uploadBytes(fileRef, file);
        const receiptURL = await getDownloadURL(fileRef);

        await addDoc(collection(db, "depositRequests"), {
            userId: user.uid,
            name: name,
            gameId: gameId,
            whatsapp: whatsapp,
            amount: Number(amount),
            receiptURL: receiptURL,
            status: "pending",
            createdAt: serverTimestamp()
        });

        showToast("Deposit request submitted successfully!");
        resetDepositForm();
        window.showPage("home");

    } catch (error) {
        console.error("Deposit submission error:", error);
        alert("Deposit request failed. Please try again.");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "SUBMIT DEPOSIT REQUEST";
        }
    }
};

/* SUBMIT WITHDRAWAL */
window.submitWithdrawal = async function () {
    const user = auth.currentUser;
    if (!user) {
        location.href = "login.html";
        return;
    }

    const name = document.getElementById("withdrawName").value.trim();
    const gameId = document.getElementById("withdrawGameId").value.trim();
    const amount = document.getElementById("withdrawAmount").value.trim();
    const whatsapp = document.getElementById("withdrawWhatsapp").value.trim();
    const details = document.getElementById("withdrawDetails").value.trim();
    const submitBtn = document.getElementById("withdrawSubmitBtn");

    if (!name || !gameId || !amount || !whatsapp || !details) {
        alert("Please complete all withdrawal fields.");
        return;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "SUBMITTING...";
        }

        await addDoc(collection(db, "withdrawalRequests"), {
            userId: user.uid,
            name: name,
            gameId: gameId,
            amount: Number(amount),
            whatsapp: whatsapp,
            paymentDetails: details,
            status: "pending",
            createdAt: serverTimestamp()
        });

        showToast("Withdrawal request submitted successfully!");
        
        document.getElementById("withdrawName").value = "";
        document.getElementById("withdrawGameId").value = "";
        document.getElementById("withdrawAmount").value = "";
        document.getElementById("withdrawWhatsapp").value = "";
        document.getElementById("withdrawDetails").value = "";

        window.showPage("home");

    } catch (error) {
        console.error("Withdrawal submission error:", error);
        alert("Withdrawal request failed. Please try again.");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "SUBMIT WITHDRAWAL REQUEST";
        }
    }
};
