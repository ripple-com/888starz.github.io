// =====================================================
// FIREBASE CONFIGURATION
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// =====================================================
// YOUR FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyCdLAlDB0GK6_GhvpgFLnjmwO_VRbvRIms",

    authDomain:
        "suwahas-sathsara.firebaseapp.com",

    projectId:
        "suwahas-sathsara",

    storageBucket:
        "suwahas-sathsara.firebasestorage.app",

    messagingSenderId:
        "394222087823",

    appId:
        "1:394222087823:web:1ae06879cb6e3763860afa",

    measurementId:
        "G-Z782V6MDGM"
};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app =
    initializeApp(firebaseConfig);


// =====================================================
// FIREBASE AUTH
// =====================================================

const auth =
    getAuth(app);


// =====================================================
// GOOGLE PROVIDER
// =====================================================

const googleProvider =
    new GoogleAuthProvider();


// =====================================================
// GOOGLE LOGIN
// =====================================================

window.googleLogin = async function () {

    try {

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );

        const user =
            result.user;

        console.log(
            "Google Login Success:",
            user
        );

        localStorage.setItem(
            "firebaseLoggedIn",
            "true"
        );

        localStorage.setItem(
            "userName",
            user.displayName || ""
        );

        localStorage.setItem(
            "userEmail",
            user.email || ""
        );

        localStorage.setItem(
            "userPhoto",
            user.photoURL || ""
        );

        window.location.href =
            "index.html";

    } catch (error) {

        console.error(
            "Google Login Error:",
            error
        );

        alert(
            "Google Login failed. Please try again."
        );

    }

};


// =====================================================
// LOGOUT
// =====================================================

window.firebaseLogout = async function () {

    try {

        await signOut(auth);

        localStorage.removeItem(
            "firebaseLoggedIn"
        );

        localStorage.removeItem(
            "userName"
        );

        localStorage.removeItem(
            "userEmail"
        );

        localStorage.removeItem(
            "userPhoto"
        );

        window.location.href =
            "login.html";

    } catch (error) {

        console.error(
            "Logout Error:",
            error
        );

    }

};


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(
    auth,
    function (user) {

        if (user) {

            console.log(
                "Logged in:",
                user.email
            );

        } else {

            console.log(
                "Not logged in"
            );

        }

    }
);


// =====================================================
// EXPORT
// =====================================================

export {
    app,
    auth,
    googleProvider
};
