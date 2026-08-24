import {
    onAuthStateChanged,
    signOut
} from
"https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from
"https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

import {
    auth,
    db,
    storage
} from "./firebase.js";


/* AUTH */

onAuthStateChanged(
    auth,
    user => {

        if(!user){

            location.href =
                "login.html";

            return;
        }

        const name =
            document.getElementById(
                "userName"
            );

        if(name){

            name.textContent =
                user.displayName ||
                "User";

        }

    }
);


/* LOGOUT */

window.logout = async function(){

    await signOut(auth);

    location.href =
        "login.html";

};


/* PAGE NAVIGATION */

window.showPage = function(page){

    document
    .querySelectorAll(".page")
    .forEach(el =>
        el.classList.remove("active")
    );

    const target =
        document.getElementById(
            page + "Page"
        );

    if(target){

        target.classList.add(
            "active"
        );

    }

    document
    .querySelectorAll(".nav-btn")
    .forEach(btn => {

        btn.classList.toggle(
            "active",
            btn.dataset.page === page
        );

    });

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

};


/* RECEIPT PREVIEW */

const receipt =
    document.getElementById(
        "receipt"
    );

if(receipt){

    receipt.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];

            if(!file) return;

            if(
                !file.type.startsWith(
                    "image/"
                )
            ){

                alert(
                    "Image file required."
                );

                receipt.value = "";

                return;
            }

            if(
                file.size >
                5 * 1024 * 1024
            ){

                alert(
                    "Maximum file size is 5MB."
                );

                receipt.value = "";

                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                e => {

                    const preview =
                        document.getElementById(
                            "receiptPreview"
                        );

                    const content =
                        document.getElementById(
                            "uploadContent"
                        );

                    preview.src =
                        e.target.result;

                    preview.style.display =
                        "block";

                    content.style.display =
                        "none";

                };

            reader.readAsDataURL(file);

        }
    );

}


/* DEPOSIT */

window.submitDeposit =
async function(){

    const user =
        auth.currentUser;

    if(!user){

        location.href =
            "login.html";

        return;

    }

    const amount =
        document.getElementById(
            "depositAmount"
        ).value.trim();

    const name =
        document.getElementById(
            "depositName"
        ).value.trim();

    const gameId =
        document.getElementById(
            "gameId"
        ).value.trim();

    const whatsapp =
        document.getElementById(
            "depositWhatsapp"
        ).value.trim();

    const file =
        document.getElementById(
            "receipt"
        ).files[0];


    if(
        !amount ||
        !name ||
        !gameId ||
        !whatsapp ||
        !file
    ){

        alert(
            "Please complete all fields."
        );

        return;
    }


    if(file.size > 5 * 1024 * 1024){

        alert(
            "Receipt must be below 5MB."
        );

        return;
    }


    try {

        const fileRef =
            ref(
                storage,
                `receipts/${user.uid}/${Date.now()}_${file.name}`
            );


        await uploadBytes(
            fileRef,
            file
        );


        const receiptURL =
            await getDownloadURL(
                fileRef
            );


        await addDoc(
            collection(
                db,
                "depositRequests"
            ),
            {

                userId:user.uid,

                name:name,

                gameId:gameId,

                whatsapp:whatsapp,

                amount:Number(amount),

                receiptURL:receiptURL,

                status:"pending",

                createdAt:
                    serverTimestamp()

            }
        );


        alert(
            "Deposit request submitted."
        );


    } catch(error){

        console.error(error);

        alert(
            "Request failed."
        );

    }

};


/* WITHDRAWAL */

window.submitWithdrawal =
async function(){

    const user =
        auth.currentUser;

    if(!user){

        location.href =
            "login.html";

        return;

    }


    const name =
        document.getElementById(
            "withdrawName"
        ).value.trim();

    const gameId =
        document.getElementById(
            "withdrawGameId"
        ).value.trim();

    const amount =
        document.getElementById(
            "withdrawAmount"
        ).value.trim();

    const whatsapp =
        document.getElementById(
            "withdrawWhatsapp"
        ).value.trim();

    const details =
        document.getElementById(
            "withdrawDetails"
        ).value.trim();


    if(
        !name ||
        !gameId ||
        !amount ||
        !whatsapp ||
        !details
    ){

        alert(
            "Please complete all fields."
        );

        return;

    }


    try {

        await addDoc(
            collection(
                db,
                "withdrawalRequests"
            ),
            {

                userId:user.uid,

                name:name,

                gameId:gameId,

                amount:Number(amount),

                whatsapp:whatsapp,

                paymentDetails:details,

                status:"pending",

                createdAt:
                    serverTimestamp()

            }
        );


        alert(
            "Withdrawal request submitted."
        );


    } catch(error){

        console.error(error);

        alert(
            "Request failed."
        );

    }

};