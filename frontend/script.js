/* =========================================================
   JRSU FRESHER'S PARTY 2026
   FRONTEND SCRIPT
========================================================= */

let currentPage = 1;

const totalPages = 10;

let noAttempts = 0;

let generatedToken = "";


/* =========================================================
   BACKEND API
========================================================= */

/*
   LOCAL:
   Live Server 5500/5501
   -> http://localhost:3000/api

   DEPLOYED:
   -> /api
*/

const API_BASE =
    (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
    )
        ? "http://localhost:3000/api"
        : "/api";


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY =
    "JRSU_FRESHER_REGISTRATIONS";


/* =========================================================
   FORM DATA
========================================================= */

let formData = {

    name: "",

    department: "",

    semester: "",

    attendance: "",

    reason: "",

    token: ""

};


/* =========================================================
   SHOW PAGE
========================================================= */

function showPage(pageNumber) {

    document
        .querySelectorAll(".page")
        .forEach(function(page) {

            page.classList.remove(
                "active"
            );

        });


    const page =
        document.getElementById(
            "page" + pageNumber
        );


    if (!page) {

        console.error(
            "Page not found:",
            pageNumber
        );

        return;

    }


    page.classList.add(
        "active"
    );


    currentPage =
        pageNumber;


    updateProgress();


    if (
        pageNumber === 7
    ) {

        const previewName =
            document.getElementById(
                "previewName"
            );


        if (previewName) {

            previewName.innerText =
                formData.name ||
                "Student";

        }

    }


    if (
        pageNumber === 8
    ) {

        updateConfirmation();

    }

}


/* =========================================================
   PROGRESS
========================================================= */

function updateProgress() {

    const progress =
        (
            (currentPage - 1) /
            (totalPages - 1)
        ) * 100;


    const progressBar =
        document.getElementById(
            "progressBar"
        );


    const stepCounter =
        document.getElementById(
            "stepCounter"
        );


    if (progressBar) {

        progressBar.style.width =
            progress + "%";

    }


    if (stepCounter) {

        stepCounter.innerText =
            "Step " +
            currentPage +
            " / " +
            totalPages;

    }

}


/* =========================================================
   NEXT PAGE
========================================================= */

function nextPage() {

    if (
        currentPage === 2
    ) {

        const input =
            document.getElementById(
                "name"
            );


        const value =
            input
                ? input.value.trim()
                : "";


        if (!value) {

            alert(
                "Please enter your full name 😊"
            );

            return;

        }


        if (
            value.length < 2
        ) {

            alert(
                "Please enter a valid name."
            );

            return;

        }


        formData.name =
            value;

    }


    if (
        currentPage === 3
    ) {

        const input =
            document.getElementById(
                "department"
            );


        const value =
            input
                ? input.value.trim()
                : "";


        if (!value) {

            alert(
                "Please enter your department 🎓"
            );

            return;

        }


        formData.department =
            value;

    }


    if (
        currentPage === 4
    ) {

        const input =
            document.getElementById(
                "semester"
            );


        const value =
            input
                ? input.value
                : "";


        if (!value) {

            alert(
                "Please select your semester 📚"
            );

            return;

        }


        formData.semester =
            value;

    }


    if (
        currentPage <
        totalPages
    ) {

        showPage(
            currentPage + 1
        );

    }

}


/* =========================================================
   PREVIOUS PAGE
========================================================= */

function previousPage() {

    if (
        currentPage > 1
    ) {

        showPage(
            currentPage - 1
        );

    }

}


/* =========================================================
   YES BUTTON
========================================================= */

function yesClicked() {

    formData.attendance =
        "Yes";


    formData.reason =
        "";


    showPage(7);

}


/* =========================================================
   NO BUTTON
========================================================= */

function noClicked(event) {

    if (event) {

        event.preventDefault();

    }


    const button =
        document.getElementById(
            "noButton"
        );


    const area =
        document.getElementById(
            "questionArea"
        );


    const message =
        document.getElementById(
            "runMessage"
        );


    if (
        !button ||
        !area
    ) {

        return;

    }


    if (
        noAttempts < 5
    ) {

        noAttempts++;


        const maxX =
            Math.max(
                0,
                area.clientWidth -
                button.offsetWidth
            );


        const maxY =
            Math.max(
                0,
                area.clientHeight -
                button.offsetHeight
            );


        const x =
            Math.random() *
            maxX;


        const y =
            Math.random() *
            maxY;


        button.style.left =
            x + "px";


        button.style.top =
            y + "px";


        button.classList.remove(
            "no-running"
        );


        void button.offsetWidth;


        button.classList.add(
            "no-running"
        );


        const messages = [

            "NO button is running away! 🏃😂",

            "Arey! Itna easily NO nahi bol sakte! 😜",

            "Fresher's Party se bachna allowed nahi hai! 😂",

            "NO button ko bhi party mein jaana hai! 🥳",

            "Last escape attempt... 👀"

        ];


        if (message) {

            message.innerText =
                messages[
                    noAttempts - 1
                ];

        }


        return;

    }


    formData.attendance =
        "No";


    showPage(6);

}


/* =========================================================
   BACK TO QUESTION
========================================================= */

function backToQuestion() {

    showPage(5);

}


/* =========================================================
   NO SUBMIT
========================================================= */

async function submitNo() {

    const input =
        document.getElementById(
            "reason"
        );


    const reason =
        input
            ? input.value.trim()
            : "";


    if (!reason) {

        alert(
            "Please tell us your genuine reason 🥺"
        );

        return;

    }


    if (
        reason.length < 3
    ) {

        alert(
            "Please enter a proper reason."
        );

        return;

    }


    formData.reason =
        reason;


    formData.attendance =
        "No";


    try {

        await saveRegistration();


        showPage(9);

    }
    catch (error) {

        console.error(
            "Registration submit error:",
            error
        );


        alert(
            "❌ Registration could not be submitted.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   CONFIRMATION
========================================================= */

function goToConfirmation() {

    updateConfirmation();

    showPage(8);

}


function updateConfirmation() {

    const name1 =
        document.getElementById(
            "confirmName"
        );


    const name2 =
        document.getElementById(
            "confirmName2"
        );


    const department =
        document.getElementById(
            "confirmDepartment"
        );


    const semester =
        document.getElementById(
            "confirmSemester"
        );


    if (name1) {

        name1.innerText =
            formData.name ||
            "Student";

    }


    if (name2) {

        name2.innerText =
            formData.name ||
            "-";

    }


    if (department) {

        department.innerText =
            formData.department ||
            "-";

    }


    if (semester) {

        semester.innerText =
            formData.semester ||
            "-";

    }

}


/* =========================================================
   CONFIRM REGISTRATION
========================================================= */

async function confirmRegistration() {

    if (!formData.name) {

        alert(
            "Name is missing."
        );

        return;

    }


    if (!formData.department) {

        alert(
            "Department is missing."
        );

        return;

    }


    if (!formData.semester) {

        alert(
            "Semester is missing."
        );

        return;

    }


    if (!formData.attendance) {

        formData.attendance =
            "Yes";

    }


    if (!formData.token) {

        formData.token =
            createUniqueToken();

    }


    const button =
        document.querySelector(
            '[onclick="confirmRegistration()"]'
        );


    if (button) {

        button.disabled =
            true;


        button.innerText =
            "Submitting...";

    }


    try {

        await saveRegistration();


        showPage(9);


        launchConfetti();

    }
    catch (error) {

        console.error(
            "Registration submit error:",
            error
        );


        alert(
            "❌ Registration could not be submitted.\n\n" +
            error.message
        );

    }
    finally {

        if (button) {

            button.disabled =
                false;


            button.innerText =
                "Confirm Registration 🎉";

        }

    }

}


/* =========================================================
   DEPARTMENT CODE
========================================================= */

function getDepartmentCode(
    department
) {

    if (!department) {

        return "GEN";

    }


    const original =
        department
            .trim()
            .toUpperCase();


    const known = {

        "BBA":
            "BBA",

        "BBA IN SECURITY MANAGEMENT":
            "BSM",

        "BBA SECURITY MANAGEMENT":
            "BSM",

        "BACHELOR OF BUSINESS ADMINISTRATION":
            "BBA",

        "BCA":
            "BCA",

        "BSC":
            "BSC",

        "B.SC":
            "BSC",

        "BA":
            "BA",

        "B.A":
            "BA",

        "BCS":
            "BCS",

        "MBA":
            "MBA",

        "MCA":
            "MCA",

        "LLB":
            "LLB",

        "LLM":
            "LLM"

    };


    if (
        known[original]
    ) {

        return known[
            original
        ];

    }


    const words =
        original
            .replace(
                /[^A-Z0-9 ]/g,
                " "
            )
            .split(
                /\s+/
            )
            .filter(
                Boolean
            );


    let code = "";


    words.forEach(
        function(word) {

            if (
                word !== "IN" &&
                word !== "OF" &&
                word !== "AND" &&
                word !== "THE"
            ) {

                code +=
                    word.charAt(0);

            }

        }
    );


    code =
        code.substring(
            0,
            4
        );


    return code ||
        "GEN";

}


/* =========================================================
   UNIQUE TOKEN
========================================================= */

function createUniqueToken() {

    const departmentCode =
        getDepartmentCode(
            formData.department
        );


    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let randomPart =
        "";


    if (
        window.crypto &&
        window.crypto.getRandomValues
    ) {

        const values =
            new Uint32Array(
                12
            );


        window.crypto.getRandomValues(
            values
        );


        for (
            let i = 0;
            i < values.length;
            i++
        ) {

            randomPart +=
                characters[
                    values[i] %
                    characters.length
                ];

        }

    }
    else {

        for (
            let i = 0;
            i < 12;
            i++
        ) {

            randomPart +=
                characters[
                    Math.floor(
                        Math.random() *
                        characters.length
                    )
                ];

        }

    }


    const timePart =
        Date.now()
            .toString(36)
            .toUpperCase()
            .slice(-6);


    return (
        "JRSU-" +
        departmentCode +
        "-" +
        randomPart +
        timePart
    );

}
/* =========================================================
   GENERATE TOKEN
========================================================= */

function generateToken() {

    if (!formData.token) {

        formData.token =
            createUniqueToken();

    }


    generatedToken =
        formData.token;


    const tokenDisplay =
        document.getElementById(
            "tokenDisplay"
        );


    const tokenName =
        document.getElementById(
            "tokenName"
        );


    const tokenDepartment =
        document.getElementById(
            "tokenDepartment"
        );


    const tokenSemester =
        document.getElementById(
            "tokenSemester"
        );


    const tokenDepartmentCode =
        document.getElementById(
            "tokenDepartmentCode"
        );


    if (tokenDisplay) {

        tokenDisplay.innerText =
            generatedToken;

    }


    if (tokenName) {

        tokenName.innerText =
            formData.name;

    }


    if (tokenDepartment) {

        tokenDepartment.innerText =
            formData.department;

    }


    if (tokenSemester) {

        tokenSemester.innerText =
            formData.semester;

    }


    if (tokenDepartmentCode) {

        tokenDepartmentCode.innerText =
            getDepartmentCode(
                formData.department
            );

    }


    showPage(10);


    launchConfetti();

}


/* =========================================================
   COPY TOKEN
========================================================= */

function copyToken() {

    if (!generatedToken) {

        generatedToken =
            formData.token;

    }


    if (!generatedToken) {

        alert(
            "Token is not available."
        );

        return;

    }


    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        navigator.clipboard
            .writeText(
                generatedToken
            )
            .then(
                function() {

                    const message =
                        document.getElementById(
                            "copyMessage"
                        );


                    if (message) {

                        message.innerText =
                            "✅ Token copied successfully!";

                    }

                }
            )
            .catch(
                function() {

                    alert(
                        "Token:\n\n" +
                        generatedToken
                    );

                }
            );

    }
    else {

        alert(
            "Token:\n\n" +
            generatedToken
        );

    }

}


/* =========================================================
   DATE POPUP
========================================================= */

function showDatePopup() {

    const popup =
        document.getElementById(
            "datePopup"
        );


    if (popup) {

        popup.classList.add(
            "show"
        );

    }

}


function closeDatePopup() {

    const popup =
        document.getElementById(
            "datePopup"
        );


    if (popup) {

        popup.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   ADMIN LOGIN PAGE
========================================================= */

function openAdminLogin() {

    /*
       Works with:
       - Live Server
       - Express backend
    */

    window.location.href =
        "../admin/admin.html";

}


/* =========================================================
   OLD ADMIN POPUP SUPPORT
========================================================= */

function closeAdminLogin() {

    const popup =
        document.getElementById(
            "adminLoginPopup"
        );


    if (popup) {

        popup.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   OLD ADMIN LOGIN SUPPORT
========================================================= */

function adminLogin() {

    const idElement =
        document.getElementById(
            "adminId"
        );


    const passwordElement =
        document.getElementById(
            "adminPassword"
        );


    const message =
        document.getElementById(
            "adminLoginMessage"
        );


    const id =
        idElement
            ? idElement.value.trim()
            : "";


    const password =
        passwordElement
            ? passwordElement.value
            : "";


    if (
        id ===
            "JRSU-FRESHER2026" &&
        password ===
            "JRSU16CODE"
    ) {

        sessionStorage.setItem(
            "JRSU_ADMIN_LOGGED_IN",
            "true"
        );


        window.location.href =
            "../admin/admin.html";


        return;

    }


    if (message) {

        message.innerText =
            "❌ Invalid Admin ID or Password.";

    }

}


/* =========================================================
   SAVE REGISTRATION TO BACKEND
========================================================= */

async function saveRegistration() {

    /*
       Do NOT generate the final token here.
       The backend generates the official token.
    */

    const payload = {

        name:
            String(
                formData.name ||
                ""
            ).trim(),

        department:
            String(
                formData.department ||
                ""
            ).trim(),

        semester:
            String(
                formData.semester ||
                ""
            ).trim(),

        attendance:
            String(
                formData.attendance ||
                ""
            ).trim(),

        reason:
            String(
                formData.reason ||
                ""
            ).trim(),

        departmentCode:
            getDepartmentCode(
                formData.department
            )

    };


    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!payload.name) {

        throw new Error(
            "Name is missing."
        );

    }


    if (!payload.department) {

        throw new Error(
            "Department is missing."
        );

    }


    if (!payload.semester) {

        throw new Error(
            "Semester is missing."
        );

    }


    if (
        payload.attendance !== "Yes" &&
        payload.attendance !== "No"
    ) {

        throw new Error(
            "Please select Yes or No."
        );

    }


    if (
        payload.attendance === "No" &&
        !payload.reason
    ) {

        throw new Error(
            "Please provide a reason."
        );

    }


    try {

        console.log(
            "Submitting registration to:",
            API_BASE +
            "/register"
        );


        const response =
            await fetch(
                API_BASE +
                "/register",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        const text =
            await response.text();


        let result =
            {};


        /*
           Safely parse JSON response.
        */

        if (
            text.trim()
        ) {

            try {

                result =
                    JSON.parse(
                        text
                    );

            }
            catch (jsonError) {

                console.error(
                    "Backend response was not JSON:",
                    text
                );


                throw new Error(
                    "Backend returned an invalid response. Please check that server.js is running."
                );

            }

        }


        if (
            !response.ok
        ) {

            throw new Error(
                result.message ||
                "Unable to submit registration. Server returned HTTP " +
                response.status
            );

        }


        if (
            result.success ===
            false
        ) {

            throw new Error(
                result.message ||
                "Registration was rejected by the backend."
            );

        }


        /* -----------------------------------------
           GET OFFICIAL BACKEND TOKEN
        ----------------------------------------- */

        if (
            result.registration &&
            result.registration.token
        ) {

            formData.token =
                result.registration.token;


            generatedToken =
                result.registration.token;

        }


        /*
           If backend did not return a token,
           create one only as a fallback.
        */

        if (!formData.token) {

            formData.token =
                createUniqueToken();

            generatedToken =
                formData.token;

        }


        /* -----------------------------------------
           LOCAL BACKUP
        ----------------------------------------- */

        try {

            let registrations =
                JSON.parse(
                    localStorage.getItem(
                        STORAGE_KEY
                    ) ||
                    "[]"
                );


            const registration =
                result.registration ||
                {
                    ...payload,

                    token:
                        formData.token

                };


            const exists =
                registrations.some(
                    function(item) {

                        return (
                            item.token ===
                            registration.token
                        );

                    }
                );


            if (!exists) {

                registrations.push({

                    ...registration,

                    serialNumber:
                        registration.serialNumber ||
                        registrations.length + 1

                });


                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(
                        registrations
                    )
                );

            }

        }
        catch (localError) {

            console.warn(
                "Local backup could not be saved:",
                localError
            );

        }


        console.log(
            "Registration submitted successfully:",
            result
        );


        return result;

    }
    catch (error) {

        console.error(
            "Registration error:",
            error
        );


        if (
            error instanceof
            TypeError
        ) {

            throw new Error(
                "Cannot connect to the backend server. Please make sure node server.js is running."
            );

        }


        throw error;

    }

}


/* =========================================================
   CONFETTI
========================================================= */

function launchConfetti() {

    const colors = [

        "#facc15",

        "#fb7185",

        "#60a5fa",

        "#a78bfa",

        "#34d399",

        "#ffffff"

    ];


    for (
        let i = 0;
        i < 100;
        i++
    ) {

        const piece =
            document.createElement(
                "div"
            );


        piece.className =
            "confetti";


        piece.style.left =
            Math.random() *
            100 +
            "vw";


        piece.style.background =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];


        piece.style.animationDuration =
            (
                2 +
                Math.random() * 3
            ) +
            "s";


        piece.style.animationDelay =
            (
                Math.random() *
                0.8
            ) +
            "s";


        document.body.appendChild(
            piece
        );


        setTimeout(
            function() {

                piece.remove();

            },
            6000
        );

    }

}
/* =========================================================
   RESTART FORM
========================================================= */

function restartForm() {

    currentPage =
        1;


    noAttempts =
        0;


    generatedToken =
        "";


    formData = {

        name: "",

        department: "",

        semester: "",

        attendance: "",

        reason: "",

        token: ""

    };


    const name =
        document.getElementById(
            "name"
        );


    const department =
        document.getElementById(
            "department"
        );


    const semester =
        document.getElementById(
            "semester"
        );


    const reason =
        document.getElementById(
            "reason"
        );


    const runMessage =
        document.getElementById(
            "runMessage"
        );


    const copyMessage =
        document.getElementById(
            "copyMessage"
        );


    const noButton =
        document.getElementById(
            "noButton"
        );


    if (name) {

        name.value =
            "";

    }


    if (department) {

        department.value =
            "";

    }


    if (semester) {

        semester.value =
            "";

    }


    if (reason) {

        reason.value =
            "";

    }


    if (runMessage) {

        runMessage.innerText =
            "";

    }


    if (copyMessage) {

        copyMessage.innerText =
            "See you at the party! 🥳";

    }


    if (noButton) {

        noButton.style.left =
            "";

        noButton.style.top =
            "";

        noButton.style.transform =
            "";

        noButton.classList.remove(
            "no-running"
        );

    }


    const tokenDisplay =
        document.getElementById(
            "tokenDisplay"
        );


    const tokenName =
        document.getElementById(
            "tokenName"
        );


    const tokenDepartment =
        document.getElementById(
            "tokenDepartment"
        );


    const tokenSemester =
        document.getElementById(
            "tokenSemester"
        );


    const tokenDepartmentCode =
        document.getElementById(
            "tokenDepartmentCode"
        );


    if (tokenDisplay) {

        tokenDisplay.innerText =
            "";

    }


    if (tokenName) {

        tokenName.innerText =
            "";

    }


    if (tokenDepartment) {

        tokenDepartment.innerText =
            "";

    }


    if (tokenSemester) {

        tokenSemester.innerText =
            "";

    }


    if (tokenDepartmentCode) {

        tokenDepartmentCode.innerText =
            "";

    }


    showPage(1);

}


/* =========================================================
   RESET NO BUTTON
========================================================= */

function resetNoButton() {

    noAttempts =
        0;


    const button =
        document.getElementById(
            "noButton"
        );


    if (!button) {

        return;

    }


    button.style.left =
        "";

    button.style.top =
        "";

    button.style.transform =
        "";


    button.classList.remove(
        "no-running"
    );

}


/* =========================================================
   ADMIN PAGE REDIRECT
========================================================= */

function goToAdmin() {

    window.location.href =
        "../admin/admin.html";

}


/* =========================================================
   SAFE ADMIN PAGE OPEN
========================================================= */

function openAdminPanel() {

    window.location.href =
        "../admin/admin.html";

}


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
           Start from page 1.
        */

        showPage(1);


        /*
           Reset progress bar.
        */

        updateProgress();


        /*
           Date popup close when clicking
           outside the popup content.
        */

        const datePopup =
            document.getElementById(
                "datePopup"
            );


        if (datePopup) {

            datePopup.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target ===
                        datePopup
                    ) {

                        closeDatePopup();

                    }

                }
            );

        }


        /*
           Make sure browser does not
           submit the form normally.
        */

        document
            .querySelectorAll(
                "form"
            )
            .forEach(
                function(form) {

                    form.addEventListener(
                        "submit",
                        function(event) {

                            event.preventDefault();

                        }
                    );

                }
            );


        /*
           Allow Enter key to continue
           only where appropriate.
        */

        const nameInput =
            document.getElementById(
                "name"
            );


        if (nameInput) {

            nameInput.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        nextPage();

                    }

                }
            );

        }


        const departmentInput =
            document.getElementById(
                "department"
            );


        if (departmentInput) {

            departmentInput.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        nextPage();

                    }

                }
            );

        }


        /*
           Prevent accidental page refresh
           while registration is being
           completed.
        */

        window.addEventListener(
            "beforeunload",
            function(event) {

                if (
                    currentPage >= 2 &&
                    currentPage <= 8
                ) {

                    event.preventDefault();

                }

            }
        );

    }
);


/* =========================================================
   GLOBAL ERROR LOGGING
========================================================= */

window.addEventListener(
    "error",
    function(event) {

        console.error(
            "Frontend error:",
            event.error ||
            event.message
        );

    }
);


/* =========================================================
   UNHANDLED PROMISE ERROR
========================================================= */

window.addEventListener(
    "unhandledrejection",
    function(event) {

        console.error(
            "Unhandled promise rejection:",
            event.reason
        );

    }
);