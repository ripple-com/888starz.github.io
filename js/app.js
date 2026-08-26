import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// TELEGRAM BOT CONFIGURATION
const TELEGRAM_BOT_TOKEN = "8842393659:AAEK-X-hY4C_KjEtMfUCjMXWQWq_XcjbwfQ"; 
const TELEGRAM_CHAT_ID = "7135887501";     

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

const chatsCollection = collection(db, "live_chats");

// ONLINE AGENTS LIST FOR DEPOSIT SUGGESTIONS
const onlineAgents = [
    {
        id: "agent_suwahas",
        name: "Agent Suwahas (VIP Agent)",
        avatar: "S1",
        role: "Assigned Agent for Deposit (Fast & 24/7)",
        banks: [
            { bankName: "Commercial Bank", accNum: "8009847120", accName: "S. Sathsara" },
            { bankName: "Bank of Ceylon (BOC)", accNum: "89124410", accName: "S. Sathsara" },
            { bankName: "Sampath Bank", accNum: "1202541198", accName: "S. Sathsara" }
        ]
    },
    {
        id: "agent_nimal",
        name: "Agent Nimal (Online Fast)",
        avatar: "A2",
        role: "Verified Agent (Instant Transfer)",
        banks: [
            { bankName: "Commercial Bank", accNum: "8120098112", accName: "K. Nimal" },
            { bankName: "HNB Bank", accNum: "0030104881", accName: "K. Nimal" }
        ]
    },
    {
        id: "agent_kamal",
        name: "Agent Kamal (Express)",
        avatar: "A3",
        role: "Authorized Deposit Partner",
        banks: [
            { bankName: "Commercial Bank", accNum: "8772349001", accName: "W. Kamal" },
            { bankName: "BOC Bank", accNum: "7611094321", accName: "W. Kamal" }
        ]
    }
];

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
        btnLogout: "Logout", descLogout: "Sign out from your account", homeNotice: "This is an independent agent service and is not the official 888Starz website.",
        depositTitle: "Deposit Request", depositDesc: "Transfer funds to the agent bank account below and upload the payment receipt.",
        lblSelectAgent: "SELECT AGENT", lblReceipt: "PAYMENT RECEIPT", txtUpload: "Upload Receipt", lblAmount: "DEPOSIT AMOUNT", lblName: "NAME", lblGameId: "GAME ID",
        lblWhatsapp: "WHATSAPP NUMBER", btnSubmitDeposit: "SUBMIT DEPOSIT REQUEST",
        withdrawTitle: "Withdrawal Request", withdrawDesc: "Enter your details for withdrawal processing.", txtImportant: "Important",
        txtWithdrawInfo: "Please double-check all details before submitting your withdrawal request.",
        lblWithdrawAmount: "WITHDRAWAL AMOUNT", lblBankDetails: "PAYMENT / BANK DETAILS", btnSubmitWithdraw: "SUBMIT WITHDRAWAL REQUEST",
        titleSettings: "Settings", lblTheme: "Dark Mode", descTheme: "Switch between Light and Dark mode",
        lblLanguage: "Language", descLanguage: "Select system language",
        lblNotif: "Notifications", descNotif: "Receive transaction updates", lblSupport: "Agent Support", descSupport: "Open Live Chat Support",
        navHome: "Home", navDeposit: "Deposit", navWithdraw: "Withdrawal", navSettings: "Setting",
        phAmount: "Enter deposit amount", phName: "Enter your name", phGameId: "Enter your Game ID", phWhatsapp: "Enter WhatsApp number",
        phWAmount: "Enter withdrawal amount", phDetails: "Enter payment details",
        msgFillAll: "Please fill all fields and upload receipt.", msgDepSuccess: "Deposit request submitted successfully! Average time: 15 mins.",
        msgFillAllW: "Please fill all required fields.", msgWSuccess: "Withdrawal request submitted successfully!"
    },
    si: {
        subHeader: "ස්වාධීන නියෝජිත සේවාව",
        heroTitle: "ඉක්මන් තැන්පතු<br><span>සහ මුදල් ලබාගැනීම්</span>",
        heroDescription: "888Starz පාරිභෝගිකයින් සඳහා තැන්පතු සහ මුදල් ආපසු ගැනීමේ සහාය. ගනුදෙනුවකට පෙර නියෝජිතයා සමඟ විස්තර තහවුරු කරගන්න.",
        slide1Small: "වේගවත් සේවාව", slide1Title: "පහසු තැන්පතු", slide1Desc: "ඔබේ රිසිට්පත උඩුගත කර තැන්පතු විස්තර යොමු කරන්න.",
        slide2Small: "පහසු මුදල් ආපසු ගැනීම", slide2Title: "ඉක්මන් මුදල් ලබාගැනීම", slide2Desc: "ඔබේ මුදල් ආපසු ගැනීමේ ඉල්ලීම අපගේ නියෝජිතයා වෙත යවන්න.",
        slide3Small: "24/7 සහාය", slide3Title: "නියෝජිත සහාය", slide3Desc: "ඔබට අවශ්‍ය ඕනෑම වේලාවක සහාය ලබා ගන්න.",
        btnDeposit: "තැන්පතු (Deposit)", btnDepositSub: "ගෙවීම් රිසිට්පත යොමු කරන්න", btnWithdraw: "මුදල් ගැනීම (Withdrawal)", btnWithdrawSub: "මුදල් ලබාගැනීමට ඉල්ලන්න",
        btnLogout: "ඉවත් වන්න (Logout)", descLogout: "ගිණුමෙන් ඉවත් වන්න", homeNotice: "මෙය ස්වාධීන නියෝජිත සේවාවක් වන අතර 888Starz නිල වෙබ් අඩවිය නොවේ.",
        depositTitle: "තැන්පතු ඉල්ලීම", depositDesc: "පහත නියෝජිත බැංකු ගිණුමකට මුදල් බැර කර රිසිට්පත Upload කරන්න.",
        lblSelectAgent: "නියෝජිතයා (Agent) තෝරන්න", lblReceipt: "ගෙවීම් රිසිට්පත", txtUpload: "රිසිට්පත Upload කරන්න", lblAmount: "තැන්පතු මුදල", lblName: "ඔබේ නම", lblGameId: "ගිණුම් අංකය (Game ID)",
        lblWhatsapp: "WHATSAPP අංකය", btnSubmitDeposit: "තැන්පතු ඉල්ලීම යොමු කරන්න",
        withdrawTitle: "මුදල් ලබාගැනීමේ ඉල්ලීම", withdrawDesc: "මුදල් ආපසු ගැනීම සඳහා ඔබගේ විස්තර ඇතුළත් කරන්න.", txtImportant: "වැදගත්",
        txtWithdrawInfo: "තොරතුරු යැවීමට පෙර සියලුම විස්තර නිවැරදි දැයි නැවත පරීක්ෂා කරන්න.",
        lblWithdrawAmount: "ලබාගන්නා මුදල", lblBankDetails: "ගෙවීම් / බැංකු විස්තර", btnSubmitWithdraw: "මුදල් ලබාගැනීමේ ඉල්ලීම යොමු කරන්න",
        titleSettings: "සැකසුම් (Settings)", lblTheme: "Dark Mode", descTheme: "Light සහ Dark තිම මාරු කරන්න",
        lblLanguage: "භාෂාව (Language)", descLanguage: "පද්ධති භාෂාව තෝරන්න",
        lblNotif: "දැනුම්දීම්", descNotif: "ගනුදෙනු යාවත්කාලීන ලබාගන්න", lblSupport: "නියෝජිත සහාය", descSupport: "Live Chat පහසුකම භාවිත කරන්න",
        navHome: "මුල් පිටුව", navDeposit: "තැන්පතු", navWithdraw: "ලබාගැනීම්", navSettings: "සැකසුම්",
        phAmount: "තැන්පතු මුදල ඇතුළත් කරන්න", phName: "ඔබේ නම ඇතුළත් කරන්න", phGameId: "Game ID එක ඇතුළත් කරන්න", phWhatsapp: "WhatsApp අංකය ඇතුළත් කරන්න",
        phWAmount: "ලබාගන්නා මුදල ඇතුළත් කරන්න", phDetails: "බැංකු හෝ ගෙවීම් විස්තර ඇතුළත් කරන්න",
        msgFillAll: "කරුණාකර සියලු විස්තර පුරවා රිසිට්පත Upload කරන්න.", msgDepSuccess: "තැන්පතු ඉල්ලීම සාර්ථකව යොමු කෙරිණි! (සාමාන්‍ය කාලය: විනාඩි 15)",
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
        btnLogout: "வெளியேறு", descLogout: "கணக்கிலிருந்து வெளியேறவும்", homeNotice: "இது ஒரு சுயாதீன முகவர் சேவையாகும், அதிகாரப்பூர்வ வலைத்தளம் அல்ல.",
        depositTitle: "வைப்பு கோரிக்கை", depositDesc: "கீழேயுள்ள முகவர் வங்கி கணக்கிற்கு பணம் அனுப்பி ரசீதை பதிவேற்றவும்.",
        lblSelectAgent: "முகவரைத் தேர்ந்தெடுக்கவும்", lblReceipt: "பணம் செலுத்திய ரசீது", txtUpload: "ரசீதை பதிவேற்றவும்", lblAmount: "வைப்புத் தொகை", lblName: "பெயர்", lblGameId: "கேம் ஐடி (Game ID)",
        lblWhatsapp: "வாட்ஸ்அப் எண்", btnSubmitDeposit: "வைப்பு கோரிக்கையை சமர்ப்பிக்கவும்",
        withdrawTitle: "திரும்பப் பெறல் கோரிக்கை", withdrawDesc: "செயலாக்கத்திற்கு உங்கள் விவரங்களை உள்ளிடவும்.", txtImportant: "முக்கியமானது",
        txtWithdrawInfo: "சமர்ப்பிப்பதற்கு முன் அனைத்து விவரங்களையும் மீண்டும் சரிபார்க்கவும்.",
        lblWithdrawAmount: "திரும்பப் பெறும் தொகை", lblBankDetails: "வங்கி / கட்டண விவரங்கள்", btnSubmitWithdraw: "திரும்பப் பெறல் கோரிக்கை சமர்ப்பிக்கவும்",
        titleSettings: "அமைப்புகள்", lblTheme: "Dark Mode", descTheme: "Light மற்றும் Dark மோடை மாற்றவும்",
        lblLanguage: "மொழி (Language)", descLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
        lblNotif: "அறிவிப்புகள்", descNotif: "புதுப்பிப்புகளைப் பெறுங்கள்", lblSupport: "முகவர் ஆதரவு", descSupport: "நேரடி அரட்டையைப் பயன்படுத்தவும்",
        navHome: "முகப்பு", navDeposit: "வைப்பு", navWithdraw: "திரும்பப் பெறல்", navSettings: "அமைப்புகள்",
        phAmount: "வைப்புத் தொகையை உள்ளிடவும்", phName: "உங்கள் பெயரை உள்ளிடவும்", phGameId: "Game ID ஐ உள்ளிடவும்", phWhatsapp: "வாட்ஸ்அப் எண்ணை உள்ளிடவும்",
        phWAmount: "தொகையை உள்ளிடவும்", phDetails: "வங்கி விவரங்களை உள்ளிடவும்",
        msgFillAll: "அனைத்து புலங்களையும் நிரப்பி ரசீதை பதிவேற்றவும்.", msgDepSuccess: "வைப்பு கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! (நேரம்: 15 நிமிடங்கள்)",
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

    if (document.getElementById("depositAmount")) document.getElementById("depositAmount").placeholder = t.phAmount;
    if (document.getElementById("depositName")) document.getElementById("depositName").placeholder = t.phName;
    if (document.getElementById("gameId")) document.getElementById("gameId").placeholder = t.phGameId;
    if (document.getElementById("depositWhatsapp")) document.getElementById("depositWhatsapp").placeholder = t.phWhatsapp;

    if (document.getElementById("withdrawName")) document.getElementById("withdrawName").placeholder = t.phName;
    if (document.getElementById("withdrawGameId")) document.getElementById("withdrawGameId").placeholder = t.phGameId;
    if (document.getElementById("withdrawAmount")) document.getElementById("withdrawAmount").placeholder = t.phWAmount;
    if (document.getElementById("withdrawWhatsapp")) document.getElementById("withdrawWhatsapp").placeholder = t.phWhatsapp;
    if (document.getElementById("withdrawDetails")) document.getElementById("withdrawDetails").placeholder = t.phDetails;

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

function initTheme() {
    const themeBtn = document.getElementById("toggleThemeBtn");
    const savedTheme = localStorage.getItem("appTheme") || "dark";

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        if (themeBtn) themeBtn.classList.remove("on");
    } else {
        document.body.classList.remove("light-mode");
        if (themeBtn) themeBtn.classList.add("on");
    }
}

function playSuccessSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); 
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); 
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
        console.warn("Audio suppressed:", e);
    }
}

function renderSelectedAgent(agent) {
    const nameEl = document.getElementById("agentName");
    const roleEl = document.getElementById("agentRole");
    const avatarEl = document.getElementById("agentAvatar");
    const cardEl = document.getElementById("agentStatusCard");
    const bankContainer = document.getElementById("bankCardsContainer");

    if (nameEl) nameEl.textContent = agent.name;
    if (roleEl) roleEl.textContent = agent.role;
    if (avatarEl) avatarEl.textContent = agent.avatar;

    if (cardEl) {
        cardEl.classList.remove("pod-style");
        void cardEl.offsetWidth; 
        cardEl.classList.add("pod-style");
    }

    if (bankContainer) {
        bankContainer.innerHTML = agent.banks.map(bank => `
            <div class="bank-card-item fade-in">
                <div class="bank-header">
                    <span class="bank-name">${bank.bankName}</span>
                    <button class="copy-btn" onclick="copyAccNumber('${bank.accNum}')">
                        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        COPY
                    </button>
                </div>
                <div class="acc-number">${bank.accNum}</div>
                <div class="acc-name">Account Holder: <strong>${bank.accName}</strong></div>
            </div>
        `).join('');
    }
}

function setupOnlineAgentSystem() {
    const selectEl = document.getElementById("agentSelect");
    if (!selectEl) return;

    selectEl.innerHTML = onlineAgents.map(ag => `<option value="${ag.id}">${ag.name}</option>`).join("");
    renderSelectedAgent(onlineAgents[0]);

    selectEl.addEventListener("change", (e) => {
        const found = onlineAgents.find(a => a.id === e.target.value);
        if (found) renderSelectedAgent(found);
    });
}

window.copyAccNumber = function(accNum) {
    navigator.clipboard.writeText(accNum).then(() => {
        showToast("Bank Account Number Copied!");
    }).catch(() => {
        showToast("Copied: " + accNum);
    });
};

function showToast(text) {
    const toast = document.getElementById("toast");
    if (toast) {
        toast.textContent = text;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2500);
    }
}

let isSuccessAction = false;
function showCustomModal(title, message, type = "success") {
    isSuccessAction = (type === "success");
    if (type === "success") playSuccessSound();

    const popup = document.getElementById("successPopup");
    const popupTitle = document.getElementById("popupTitle");
    const popupMsg = document.getElementById("popupMessage");
    const popupIcon = popup.querySelector(".popup-icon");

    if (popup && popupMsg && popupTitle) {
        popupTitle.textContent = title;
        popupMsg.textContent = message;

        if (type === "error") {
            popupIcon.style.background = "rgba(255, 77, 77, 0.15)";
            popupIcon.style.color = "#ff4d4d";
            popupIcon.innerHTML = `<svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        } else {
            popupIcon.style.background = "rgba(32, 214, 107, 0.15)";
            popupIcon.style.color = "var(--green)";
            popupIcon.innerHTML = `<svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        }

        popup.classList.add("show");
    }
}

function showPage(page) {
    document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
    const target = document.getElementById(page + "Page");
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.page === page);
    });
    
    if (page === "deposit") {
        setupOnlineAgentSystem();
    }
    
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderUserInfo(user) {
    const nameEl = document.getElementById("userName");
    const emailEl = document.getElementById("userEmail");
    const avatarTextEl = document.getElementById("avatarText");
    const settingAvatarText = document.getElementById("settingAvatarText");

    if (user) {
        const displayName = user.displayName || user.email || "User";
        const initial = displayName.charAt(0).toUpperCase();

        if (nameEl) nameEl.textContent = user.displayName || "User Account";
        if (emailEl) emailEl.textContent = user.email || "Active User";
        if (avatarTextEl) avatarTextEl.textContent = initial;
        if (settingAvatarText) settingAvatarText.textContent = initial;
    } else {
        const cachedName = localStorage.getItem("userName");
        const cachedEmail = localStorage.getItem("userEmail");
        const initial = cachedName ? cachedName.charAt(0).toUpperCase() : "U";

        if (nameEl) nameEl.textContent = cachedName || "Guest User";
        if (emailEl) emailEl.textContent = cachedEmail || "Not Logged In";
        if (avatarTextEl) avatarTextEl.textContent = initial;
        if (settingAvatarText) settingAvatarText.textContent = initial;
    }
}

// TELEGRAM API INTEGRATION
function sendTelegramPhoto(file, caption) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("chat_id", TELEGRAM_CHAT_ID);
        formData.append("photo", file);
        formData.append("caption", caption);
        formData.append("parse_mode", "Markdown");

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, true);

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
            else reject(new Error("Telegram Error: " + xhr.responseText));
        };
        xhr.onerror = function () { reject(new Error("Network Error")); };
        xhr.send(formData);
    });
}

function sendTelegramText(textMessage) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
            else reject(new Error("Telegram Error: " + xhr.responseText));
        };
        xhr.onerror = function () { reject(new Error("Network Error")); };
        xhr.send(JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: textMessage, parse_mode: "Markdown" }));
    });
}

// TELEGRAM REPLIES POLLING (REALTIME AGENT REPLIES CATCHER)
let lastTelegramUpdateId = 0;
function pollTelegramAgentReplies() {
    setInterval(async () => {
        try {
            const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastTelegramUpdateId + 1}`);
            const data = await res.json();
            
            if (data.ok && data.result.length > 0) {
                for (let update of data.result) {
                    lastTelegramUpdateId = update.update_id;
                    
                    // Check if message is a reply from Agent
                    if (update.message && update.message.reply_to_message) {
                        const replyText = update.message.text;
                        
                        // Save Agent Reply to Firestore
                        await addDoc(chatsCollection, {
                            text: replyText,
                            sender: "agent",
                            createdAt: serverTimestamp()
                        });
                    }
                }
            }
        } catch (e) {
            console.warn("Polling error:", e);
        }
    }, 3000); // Polls Telegram every 3 seconds
}

// LISTEN TO FIRESTORE LIVE CHAT MESSAGES
function listenForLiveChats() {
    const chatMessagesContainer = document.getElementById("chatMessages");
    const q = query(chatsCollection, orderBy("createdAt", "asc"));

    onSnapshot(q, (snapshot) => {
        if (!chatMessagesContainer) return;

        chatMessagesContainer.innerHTML = `
            <div class="msg agent">
                සාදරයෙන් පිළිගන්නවා! ඔබට අවශ්‍ය ඕනෑම සහායක් මෙතැනින් විමසන්න.
            </div>
        `;

        snapshot.forEach((doc) => {
            const data = doc.data();
            const msgDiv = document.createElement("div");
            msgDiv.className = `msg ${data.sender === "user" ? "user" : "agent"}`;
            msgDiv.textContent = data.text;
            chatMessagesContainer.appendChild(msgDiv);
        });

        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    setLanguage(currentLang);
    renderUserInfo(auth.currentUser);

    // LIVE CHAT WIDGET FUNCTIONALITY
    const toggleChatBtn = document.getElementById("toggleChatBtn");
    const closeChatBtn = document.getElementById("closeChatBtn");
    const chatBox = document.getElementById("chatBox");
    const sendChatBtn = document.getElementById("sendChatBtn");
    const chatInput = document.getElementById("chatInput");
    const openChatFromSettings = document.getElementById("openChatFromSettings");

    const toggleChat = () => chatBox.classList.toggle("open");
    toggleChatBtn?.addEventListener("click", toggleChat);
    closeChatBtn?.addEventListener("click", () => chatBox.classList.remove("open"));
    openChatFromSettings?.addEventListener("click", () => {
        chatBox.classList.add("open");
    });

    async function handleSendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = "";
        const userName = localStorage.getItem("userName") || "Guest User";
        const userEmail = auth.currentUser ? auth.currentUser.email : (localStorage.getItem("userEmail") || "N/A");

        // Save User Message to Firestore
        try {
            await addDoc(chatsCollection, {
                text: text,
                sender: "user",
                userName: userName,
                userEmail: userEmail,
                createdAt: serverTimestamp()
            });
        } catch (e) {
            console.error("Firestore Save Error:", e);
        }

        // Forward to Telegram Agent Bot with User Email included
        const caption = `💬 *LIVE CHAT SUPPORT MESSAGE*\n\n` +
                        `👤 *User Name:* ${userName}\n` +
                        `📧 *Email:* ${userEmail}\n` +
                        `💬 *Message:* ${text}\n` +
                        `⏰ *Time:* ${new Date().toLocaleTimeString()}\n\n` +
                        `👉 *Reply to this message to send reply to user.*`;

        try {
            await sendTelegramText(caption);
        } catch (e) {
            console.warn("Chat Telegram notification failed", e);
        }
    }

    sendChatBtn?.addEventListener("click", handleSendMessage);
    chatInput?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSendMessage();
    });

    // Start Live Sync and Polling
    listenForLiveChats();
    pollTelegramAgentReplies();

    const popupCloseBtn = document.getElementById("popupCloseBtn");
    if (popupCloseBtn) {
        popupCloseBtn.addEventListener("click", () => {
            const popup = document.getElementById("successPopup");
            if (popup) popup.classList.remove("show");
            if (isSuccessAction) showPage("home");
        });
    }

    const toggleThemeBtn = document.getElementById("toggleThemeBtn");
    if (toggleThemeBtn) {
        toggleThemeBtn.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");
            const isLight = document.body.classList.contains("light-mode");
            toggleThemeBtn.classList.toggle("on", !isLight);
            localStorage.setItem("appTheme", isLight ? "light" : "dark");
        });
    }

    document.getElementById("headerProfileAvatar")?.addEventListener("click", () => showPage("settings"));

    document.querySelectorAll(".lang-option-card").forEach(card => {
        card.addEventListener("click", () => setLanguage(card.getAttribute("data-lang")));
    });

    document.querySelectorAll("[data-page]").forEach(btn => {
        btn.addEventListener("click", (e) => showPage(e.currentTarget.getAttribute("data-page")));
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
            } catch (err) { console.error(err); }
        });
    }

    // DEPOSIT SUBMIT WITH SELECTED AGENT INFO
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

            const agentSelectEl = document.getElementById("agentSelect");
            const selectedAgentName = agentSelectEl ? agentSelectEl.options[agentSelectEl.selectedIndex].text : "Agent Suwahas";

            if (!file || !amount || !name || !gameId || !whatsapp) {
                showCustomModal("Attention", t.msgFillAll, "error");
                return;
            }

            depositSubmitBtn.disabled = true;
            depositSubmitBtn.textContent = "...";

            const userId = user ? user.uid : "guest";
            const caption = `📌 *NEW DEPOSIT REQUEST*\n\n` +
                            `👤 *Selected Agent:* ${selectedAgentName}\n` +
                            `👤 *Name:* ${name}\n` +
                            `🎮 *Game ID:* ${gameId}\n` +
                            `💰 *Amount:* LKR ${amount}\n` +
                            `📱 *WhatsApp:* ${whatsapp}\n` +
                            `🆔 *User ID:* ${userId}\n` +
                            `⏰ *Time:* ${new Date().toLocaleString()}`;

            try {
                await sendTelegramPhoto(file, caption);
            } catch (err) {
                console.warn(err);
            } finally {
                document.getElementById("depositAmount").value = "";
                document.getElementById("depositName").value = "";
                document.getElementById("gameId").value = "";
                document.getElementById("depositWhatsapp").value = "";
                document.getElementById("receipt").value = "";
                if (document.getElementById("receiptPreview")) document.getElementById("receiptPreview").style.display = "none";
                if (document.getElementById("uploadContent")) document.getElementById("uploadContent").style.display = "flex";

                depositSubmitBtn.disabled = false;
                depositSubmitBtn.textContent = t.btnSubmitDeposit;
                showCustomModal("Success!", t.msgDepSuccess, "success");
            }
        });
    }

    // WITHDRAW SUBMIT
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
                showCustomModal("Attention", t.msgFillAllW, "error");
                return;
            }

            withdrawSubmitBtn.disabled = true;
            withdrawSubmitBtn.textContent = "...";

            const userId = user ? user.uid : "guest";
            const textMessage = `🔻 *NEW WITHDRAWAL REQUEST*\n\n` +
                                `👤 *Name:* ${name}\n` +
                                `🎮 *Game ID:* ${gameId}\n` +
                                `💰 *Amount:* LKR ${amount}\n` +
                                `📱 *WhatsApp:* ${whatsapp}\n` +
                                `🏦 *Details:* ${details}\n` +
                                `🆔 *User ID:* ${userId}\n` +
                                `⏰ *Time:* ${new Date().toLocaleString()}`;

            try {
                await sendTelegramText(textMessage);
            } catch (err) {
                console.warn(err);
            } finally {
                document.getElementById("withdrawName").value = "";
                document.getElementById("withdrawGameId").value = "";
                document.getElementById("withdrawAmount").value = "";
                document.getElementById("withdrawWhatsapp").value = "";
                document.getElementById("withdrawDetails").value = "";

                withdrawSubmitBtn.disabled = false;
                withdrawSubmitBtn.textContent = t.btnSubmitWithdraw;
                showCustomModal("Success!", t.msgWSuccess, "success");
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
