import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { auth } from "./firebase.js";

/* DOM Elements */
const nameEl = document.getElementById("userName");
const emailEl = document.getElementById("userEmail");
const settingsEmailEl = document.getElementById("settingsEmail");

/* AUTH MONITOR FIX */
onAuthStateChanged(auth, (user) => {
    if (user) {
        const nameToShow = user.displayName || user.email.split('@')[0];
        if (nameEl) nameEl.textContent = nameToShow;
        if (emailEl) emailEl.textContent = user.email;
        if (settingsEmailEl) settingsEmailEl.textContent = user.email;
    } else {
        // Log වී නැත්නම් login.html එකට යැවීම
        window.location.href = "login.html";
    }
});

/* PAGE TOGGLE FIX */
window.showPage = function (pageName) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(p => p.classList.remove("active"));

    const target = document.getElementById(pageName + "Page");
    if (target) {
        target.classList.add("active");
    }

    const navBtns = document.querySelectorAll(".nav-btn");
    navBtns.forEach(b => {
        b.classList.toggle("active", b.dataset.page === pageName);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
};

/* LOGOUT */
window.logout = function () {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    }).catch((err) => {
        console.error("Logout error:", err);
    });
};

/* WHATSAPP */
window.openWhatsApp = function () {
    window.open("https://wa.me/94702883324", "_blank");
};
: "pending",
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
