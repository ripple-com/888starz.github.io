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

// MULTI-LANGUAGE DICTIONARY
const translations = {
    en: {
        subHeader: "INDEPENDENT AGENT SERVICE",
        heroTitle: "Fast Deposit<br><span>&amp; Withdrawal</span>",
        heroDescription: "Deposit and withdrawal assistance for 888Starz customers. Verify payment details with the agent before transactions.",
        slide1Small: "FAST SERVICE", slide1Title: "Deposit<br>Made Easy", slide1Desc: "Upload your receipt and submit your deposit details.",
        slide2Small: "EASY WITHDRAWAL", slide2Title: "Quick<br>Withdrawal", slide2Desc: "Send your withdrawal request through our agent.",
        slide3Small: "24 / 7 SUPPORT", slide3Title: "Agent<br>Support", slide3Desc: "Get assistance whenever you need it.",
        btnDeposit: "Deposit", btnDepositSub: "Submit payment receipt", btnWithdraw: "Withdrawal", btnWithdrawSub: "Request withdrawal",
        btnLogout: "Logout", homeNotice: "This is an independent agent service and is not the official 888Starz website.",
        depositTitle: "Deposit Request", depositDesc: "Upload payment receipt and complete the details below.",
        lblReceipt: "PAYMENT RECEIPT", txtUpload: "Upload Receipt", lblAmount: "DEPOSIT AMOUNT", lblName: "NAME", lblGameId: "GAME ID",
        lblWhatsapp: "WHATSAPP NUMBER", btnSubmitDeposit: "SUBMIT DEPOSIT REQUEST",
        withdrawTitle: "Withdrawal Request", withdrawDesc: "Enter your details for withdrawal processing.", txtImportant: "Important",
        txtWithdrawInfo: "Please double-check all details before submitting your withdrawal request.",
        lblWithdrawAmount: "WITHDRAWAL AMOUNT", lblBankDetails: "PAYMENT / BANK DETAILS", btnSubmitWithdraw: "SUBMIT WITHDRAWAL REQUEST",
        titleSettings: "Settings", lblLanguage: "Language", descLanguage: "Select system language",
        lblNotif: "Notifications", descNotif: "Receive transaction updates", lblSupport: "Agent Support", descSupport: "Contact WhatsApp support",
        navHome: "Home", navDeposit: "Deposit", navWithdraw: "Withdrawal", navSettings: "Setting",
        phAmount: "Enter deposit amount", phName: "Enter your name", phGameId: "Enter your Game ID", phWhatsapp: "Enter WhatsApp number",
        phWAmount: "Enter withdrawal amount", phDetails: "Enter payment details",
        msgFillAll: "Please fill all fields and upload receipt.", msgDepSuccess: "Deposit request submitted successfully!",
        msgFillAllW: "Please fill all fields.", msgWSuccess: "Withdrawal request submitted successfully!"
    },
    si: {
        subHeader: "ස්වාධීන නියෝජිත සේවාව",
        heroTitle: "ඉක්මන් තැන්පතු<br><span>සහ මුදල් ලබාගැනීම්</span>",
        heroDescription: "888Starz පාරිභෝගිකයින් සඳහා තැන්පතු සහ මුදල් ආපසු ගැනීමේ සහාය. ගනුදෙනුවකට පෙර නියෝජිතයා සමඟ විස්තර තහවුරු කරගන්න.",
        slide1Small: "වේගවත් සේවාව", slide1Title: "පහසු තැන්පතු", slide1Desc: "ඔබේ රිසිට්පත උඩුගත කර තැන්පතු විස්තර යොමු කරන්න.",
        slide2Small: "පහසු මුදල් ආපසු ගැනීම", slide2Title: "ඉක්මන් මුදල් ලබාගැනීම", slide2Desc: "ඔබේ මුදල් ආපසු ගැනීමේ ඉල්ලීම අපගේ නියෝජිතයා වෙත යවන්න.",
        slide3Small: "24/7 සහාය", slide3Title: "නියෝජිත සහාය", slide3Desc: "ඔබට අවශ්‍ය ඕනෑම වේලාවක සහාය ලබා ගන්න.",
        btnDeposit: "තැන්පතු (Deposit)", btnDepositSub: "ගෙවීම් රිසිට්පත යොමු කරන්න", btnWithdraw: "මුදල් ගැනීම (Withdrawal)", btnWithdrawSub: "මුදල් ලබාගැනීමට ඉල්ලන්න",
        btnLogout: "ඉවත් වන්න (Logout)", homeNotice: "මෙය ස්වාධීන නියෝජිත සේවාවක් වන අතර 888Starz නිල වෙබ් අඩවිය නොවේ.",
        depositTitle: "තැන්පතු ඉල්ලීම", depositDesc: "ගෙවීම් රිසිට්පත උඩුගත කර පහත විස්තර සම්පූර්ණ කරන්න.",
        lblReceipt: "ගෙවීම් රිසිට්පත", txtUpload: "රිසිට්පත Upload කරන්න", lblAmount: "තැන්පතු මුදල", lblName: "ඔබේ නම", lblGameId: "ගිණුම් අංකය (Game ID)",
        lblWhatsapp: "WHATSAPP අංකය", btnSubmitDeposit: "තැන්පතු ඉල්ලීම යොමු කරන්න",
        withdrawTitle: "මුදල් ලබාගැනීමේ ඉල්ලීම", withdrawDesc: "මුදල් ආපසු ගැනීම සඳහා ඔබගේ විස්තර ඇතුළත් කරන්න.", txtImportant: "වැදගත්",
        txtWithdrawInfo: "තොරතුරු යැවීමට පෙර සියලුම විස්තර නිවැරදි දැයි නැවත පරීක්ෂා කරන්න.",
        lblWithdrawAmount: "ලබාගන්නා මුදල", lblBankDetails: "ගෙවීම් / බැංකු විස්තර", btnSubmitWithdraw: "මුදල් ලබාගැනීමේ ඉල්ලීම යොමු කරන්න",
        titleSettings: "සැකසුම් (Settings)", lblLanguage: "භාෂාව (Language)", descLanguage: "පද්ධති භාෂාව තෝරන්න",
        lblNotif: "දැනුම්දීම්", descNotif: "ගනුදෙනු යාවත්කාලීන ලබාගන්න", lblSupport: "නියෝජිත සහාය", descSupport: "WhatsApp මගින් සම්බන්ධ වන්න",
        navHome: "මුල් පිටුව", navDeposit: "තැන්පතු", navWithdraw: "ලබාගැනීම්", navSettings: "සැකසුම්",
        phAmount: "තැන්පතු මුදල ඇතුළත් කරන්න", phName: "ඔබේ නම ඇතුළත් කරන්න", phGameId: "Game ID එක ඇතුළත් කරන්න", phWhatsapp: "WhatsApp අංකය ඇතුළත් කරන්න",
        phWAmount: "ලබාගන්නා මුදල ඇතුළත් කරන්න", phDetails: "බැංකු හෝ ගෙවීම් විස්තර ඇතුළත් කරන්න",
        msgFillAll: "කරුණාකර සියලු විස්තර පුරවා රිසිට්පත Upload කරන්න.", msgDepSuccess: "තැන්පතු ඉල්ලීම සාර්ථකව යොමු කෙරිණි!",
        msgFillAllW: "කරුණාකර සියලුම විස්තර ඇතුළත් කරන්න.", msgWSuccess: "මුදල් ලබාගැනීමේ ඉල්ලීම සාර්ථකව යොමු කෙරිණි!"
    },
    ta: {
        subHeader: "சுயாதீன முகவர் சேவை",
        heroTitle: "வேகமான வைப்பு<br><span>மற்றும் திரும்பப் பெறுதல்</span>",
        heroDescription: "888Starz வாடிக்கையாளர்களுக்கான வைப்பு மற்றும் திரும்பப் பெறல் உதவி. பரிவர்த்தனைக்கு முன் முகவருடன் சரிபார்க்கவும்.",
        slide1Small: "வேகமான சேவை", slide1Title: "எளிதான வைப்பு", slide1Desc: "உங்கள் ரசீதை பதிவேற்றி விவரங்களை சமர்ப்பிக்கவும்.",
        slide2Small: "எளிதான திரும்பப் பெறல்", slide2Title: "விரைவான திரும்பப் பெறல்", slide2Desc: "உங்கள் கோரிக்கையை முகவர் மூலம் அனுப்பவும்.",
        slide3Small: "24/7 ஆதரவு", slide3Title: "முகவர் ஆதரவு", slide3Desc: "உங்களுக்குத் தேவையான போதெல்லாம் உதவி பெறுங்கள்.",
        btnDeposit: "வைப்பு (Deposit)", btnDepositSub: "ரசீதை சமர்ப்பிக்கவும்", btnWithdraw: "திரும்பப் பெறல்", btnWithdrawSub: "பணத்தை கோருங்கள்",
        btnLogout: "வெளியேறு", homeNotice: "இது ஒரு சுயாதீன முகவர் சேவையாகும், அதிகாரப்பூர்வ வலைத்தளம் அல்ல.",
        depositTitle: "வைப்பு கோரிக்கை", depositDesc: "ரசீதை பதிவேற்றி கீழே உள்ள விவரங்களை பூர்த்தி செய்யவும்.",
        lblReceipt: "பணம் செலுத்திய ரசீது", txtUpload: "ரசீதை பதிவேற்றவும்", lblAmount: "வைப்புத் தொகை", lblName: "பெயர்", lblGameId: "கேம் ஐடி (Game ID)",
        lblWhatsapp: "வாட்ஸ்அப் எண்", btnSubmitDeposit: "வைப்பு கோரிக்கையை சமர்ப்பிக்கவும்",
        withdrawTitle: "திரும்பப் பெறல் கோரிக்கை", withdrawDesc: "செயலாக்கத்திற்கு உங்கள் விவரங்களை உள்ளிடவும்.", txtImportant: "முக்கியமானது",
        txtWithdrawInfo: "சமர்ப்பிப்பதற்கு முன் அனைத்து விவரங்களையும் மீண்டும் சரிபார்க்கவும்.",
        lblWithdrawAmount: "திரும்பப் பெறும் தொகை", lblBankDetails: "வங்கி / கட்டண விவரங்கள்", btnSubmitWithdraw: "திரும்பப் பெறல் கோரிக்கையை சமர்ப்பிக்கவும்",
        titleSettings: "அமைப்புகள்", lblLanguage: "மொழி (Language)", descLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
        lblNotif: "அறிவிப்புகள்", descNotif: "புதுப்பிப்புகளைப் பெறுங்கள்", lblSupport: "முகவர் ஆதரவு", descSupport: "வாட்ஸ்அப் ஆதரவை தொடர்பு கொள்ளவும்",
        navHome: "முகப்பு", navDeposit: "வைப்பு", navWithdraw: "திரும்பப் பெறல்", navSettings: "அமைப்புகள்",
        phAmount: "வைப்புத் தொகையை உள்ளிடவும்", phName: "உங்கள் பெயரை உள்ளிடவும்", phGameId: "Game ID ஐ உள்ளிடவும்", phWhatsapp: "வாட்ஸ்அப் எண்ணை உள்ளிடவும்",
        phWAmount: "தொகையை உள்ளிடவும்", phDetails: "வங்கி விவரங்களை உள்ளிடவும்",
        msgFillAll: "அனைத்து புலங்களையும் நிரப்பி ரசீதை பதிவேற்றவும்.", msgDepSuccess: "வைப்பு கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!",
        msgFillAllW: "அனைத்து புலங்களையும் நிரப்பவும்.", msgWSuccess: "திரும்பப் பெறல் கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!"
    }
};

let currentLang = localStorage.getItem("appLanguage") || "en";

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("appLanguage", lang);
    const t = translations[lang];

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (t[key]) el.innerHTML = t[key];
    });

    const heroTitle = document.getElementById("mainHeroTitle");
    if (heroTitle) heroTitle.innerHTML = t.heroTitle;

    document.getElementById("depositAmount").placeholder = t.phAmount;
    document.getElementById("depositName").placeholder = t.phName;
    document.getElementById("gameId").placeholder = t.phGameId;
    document.getElementById("depositWhatsapp").placeholder = t.phWhatsapp;

    document.getElementById("withdrawName").placeholder = t.phName;
    document.getElementById("withdrawGameId").placeholder = t.phGameId;
    document.getElementById("withdrawAmount").placeholder = t.phWAmount;
    document.getElementById("withdrawWhatsapp").placeholder = t.phWhatsapp;
    document.getElementById("withdrawDetails").placeholder = t.phDetails;

    // Custom UI selection update
    document.querySelectorAll(".lang-option-card").forEach(card => {
        const input = card.querySelector("input");
        if (card.dataset.lang === lang) {
            card.classList.add("active");
            if (input) input.checked = true;
        } else {
            card.classList.remove("active");
            if (input) input.checked = false;
        }
    });
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
}

function showPage(page) {
    document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
    const target = document.getElementById(page + "Page");
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.page === page);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderUserInfo(user) {
    const nameEl = document.getElementById("userName");
    const emailEl = document.getElementById("userEmail");
    const avatarTextEl = document.getElementById("avatarText");

    if (user) {
        const displayName = user.displayName || user.email || "User";
        if (nameEl) nameEl.textContent = user.displayName || "User Account";
        if (emailEl) emailEl.textContent = user.email || "Active User";
        
        if (avatarTextEl) {
            avatarTextEl.textContent = displayName.charAt(0).toUpperCase();
        }
    } else {
        const cachedName = localStorage.getItem("userName");
        const cachedEmail = localStorage.getItem("userEmail");
        if (nameEl) nameEl.textContent = cachedName || "Guest User";
        if (emailEl) emailEl.textContent = cachedEmail || "Not Logged In";
        
        if (avatarTextEl) {
            avatarTextEl.textContent = cachedName ? cachedName.charAt(0).toUpperCase() : "U";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setLanguage(currentLang);
    renderUserInfo(auth.currentUser);

    // Profile Avatar click -> Settings Page
    document.getElementById("headerProfileAvatar")?.addEventListener("click", () => {
        showPage("settings");
    });

    // Language selection card click event
    document.querySelectorAll(".lang-option-card").forEach(card => {
        card.addEventListener("click", () => {
            const selectedLang = card.getAttribute("data-lang");
            setLanguage(selectedLang);
        });
    });

    document.querySelectorAll("[data-page]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const page = e.currentTarget.getAttribute("data-page");
            if (page) showPage(page);
        });
    });

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

    const toggleBtn = document.getElementById("toggleNotifBtn");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            toggleBtn.classList.toggle("on");
        });
    }

    const whatsappBtn = document.getElementById("whatsappSupportBtn");
    if (whatsappBtn) {
        whatsappBtn.addEventListener("click", () => {
            window.open("https://wa.me/94702883324", "_blank");
        });
    }

    const depositSubmitBtn = document.getElementById("depositSubmitBtn");
    if (depositSubmitBtn) {
        depositSubmitBtn.addEventListener("click", async () => {
            const t = translations[currentLang];
            const user = auth.currentUser;
            const amount = document.getElementById("depositAmount").value.trim();
            const name = document.getElementById("depositName").value.trim();
            const gameId = document.getElementById("gameId").value.trim();
            const whatsapp = document.getElementById("depositWhatsapp").value.trim();
            const fileInput = document.getElementById("receipt");
            const file = fileInput ? fileInput.files[0] : null;

            if (!file || !amount || !name || !gameId || !whatsapp) {
                showToast(t.msgFillAll);
                return;
            }

            try {
                depositSubmitBtn.disabled = true;
                depositSubmitBtn.textContent = "...";

                const userId = user ? user.uid : "guest";
                const fileRef = ref(storage, `receipts/${userId}/${Date.now()}_${file.name}`);
                await uploadBytes(fileRef, file);
                const receiptURL = await getDownloadURL(fileRef);

                await addDoc(collection(db, "depositRequests"), {
                    userId, name, gameId, whatsapp, amount: Number(amount), receiptURL, status: "pending", createdAt: serverTimestamp()
                });

                showToast(t.msgDepSuccess);
                showPage("home");
            } catch (err) {
                showToast("Error: " + err.message);
            } finally {
                depositSubmitBtn.disabled = false;
                depositSubmitBtn.textContent = t.btnSubmitDeposit;
            }
        });
    }

    const withdrawSubmitBtn = document.getElementById("withdrawSubmitBtn");
    if (withdrawSubmitBtn) {
        withdrawSubmitBtn.addEventListener("click", async () => {
            const t = translations[currentLang];
            const user = auth.currentUser;
            const name = document.getElementById("withdrawName").value.trim();
            const gameId = document.getElementById("withdrawGameId").value.trim();
            const amount = document.getElementById("withdrawAmount").value.trim();
            const whatsapp = document.getElementById("withdrawWhatsapp").value.trim();
            const details = document.getElementById("withdrawDetails").value.trim();

            if (!name || !gameId || !amount || !whatsapp || !details) {
                showToast(t.msgFillAllW);
                return;
            }

            try {
                withdrawSubmitBtn.disabled = true;
                withdrawSubmitBtn.textContent = "...";

                const userId = user ? user.uid : "guest";
                await addDoc(collection(db, "withdrawalRequests"), {
                    userId, name, gameId, amount: Number(amount), whatsapp, paymentDetails: details, status: "pending", createdAt: serverTimestamp()
                });

                showToast(t.msgWSuccess);
                showPage("home");
            } catch (err) {
                showToast("Error: " + err.message);
            } finally {
                withdrawSubmitBtn.disabled = false;
                withdrawSubmitBtn.textContent = t.btnSubmitWithdraw;
            }
        });
    }
});

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
