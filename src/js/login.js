document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    console.log("LOGIN.JS LOADED");

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginMessage = document.getElementById("loginMessage");
    const loginButton = document.getElementById("loginButton");
    const togglePassword = document.getElementById("togglePassword");

    const USERS_KEY = "reenUsers";
    const CURRENT_USER_KEY = "currentUser";


    // =========================================================
    // SHOW / HIDE PASSWORD
    // =========================================================

    if (togglePassword && passwordInput) {

        togglePassword.addEventListener("click", function () {

            if (passwordInput.type === "password") {

                passwordInput.type = "text";

                togglePassword.innerHTML =
                    '<i class="fa-solid fa-eye-slash"></i>';

                togglePassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                passwordInput.type = "password";

                togglePassword.innerHTML =
                    '<i class="fa-solid fa-eye"></i>';

                togglePassword.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        });

    }


    // =========================================================
    // MESSAGE
    // =========================================================

    function showMessage(message, type = "error") {

        if (!loginMessage) return;

        loginMessage.textContent = message;

        loginMessage.classList.remove(
            "hidden",
            "bg-red-100",
            "text-red-700",
            "bg-green-100",
            "text-green-700"
        );

        if (type === "success") {

            loginMessage.classList.add(
                "bg-green-100",
                "text-green-700"
            );

        } else {

            loginMessage.classList.add(
                "bg-red-100",
                "text-red-700"
            );

        }

    }


    // =========================================================
    // LOGIN
    // =========================================================

    if (!loginForm) {

        console.error(
            "LOGIN: #loginForm was not found."
        );

        return;
    }


    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            console.log("LOGIN FORM SUBMITTED");


            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();

            const password =
                passwordInput.value;


            // =====================================================
            // VALIDATE
            // =====================================================

            if (!email || !password) {

                showMessage(
                    "Please enter your email and password."
                );

                return;
            }


            // =====================================================
            // READ USERS
            // =====================================================

            let users = [];

            try {

                const storedUsers =
                    localStorage.getItem(
                        USERS_KEY
                    );

                if (storedUsers) {

                    users =
                        JSON.parse(
                            storedUsers
                        );

                }

            } catch (error) {

                console.error(
                    "LOGIN: Could not read reenUsers:",
                    error
                );

                showMessage(
                    "There was a problem reading your account."
                );

                return;
            }


            if (!Array.isArray(users)) {

                users = [];

            }


            console.log(
                "LOGIN: Registered users:",
                users
            );


            // =====================================================
            // FIND USER
            // =====================================================

            const userIndex =
                users.findIndex(function (user) {

                    return (
                        user &&
                        typeof user.email === "string" &&
                        user.email
                            .trim()
                            .toLowerCase() === email
                    );

                });


            if (userIndex === -1) {

                showMessage(
                    "No account was found with this email. Please register first."
                );

                return;
            }


            const user =
                users[userIndex];


            // =====================================================
            // CHECK PASSWORD
            // =====================================================

            if (user.password !== password) {

                showMessage(
                    "Incorrect password. Please try again."
                );

                return;
            }


            // =====================================================
            // INITIALIZE USER DATA
            // =====================================================

            if (typeof user.balance !== "number") {
                user.balance = 0;
            }

            if (typeof user.income !== "number") {
                user.income = 0;
            }

            if (typeof user.expense !== "number") {
                user.expense = 0;
            }

            if (!Array.isArray(user.transactions)) {
                user.transactions = [];
            }

            if (typeof user.schoolSavings !== "number") {
                user.schoolSavings = 0;
            }

            if (typeof user.holidayBalance !== "number") {
                user.holidayBalance = 0;
            }

            if (!Array.isArray(user.accounts)) {
                user.accounts = [];
            }


            // =====================================================
            // ACCOUNT NUMBER
            // =====================================================

            if (!user.accountNumber) {

                user.accountNumber =
                    generateAccountNumber(
                        user.email,
                        users
                    );

            }


            // =====================================================
            // SAVE USER
            // =====================================================

            users[userIndex] = user;

            localStorage.setItem(
                USERS_KEY,
                JSON.stringify(users)
            );


            // =====================================================
            // CREATE LOGIN SESSION
            // =====================================================

            const session = {

                name:
                    user.name || "User",

                email:
                    user.email
                        .trim()
                        .toLowerCase(),

                accountNumber:
                    user.accountNumber

            };


            sessionStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(session)
            );


            // =====================================================
            // VERIFY SESSION WAS CREATED
            // =====================================================

            const savedSession =
                sessionStorage.getItem(
                    CURRENT_USER_KEY
                );


            console.log(
                "LOGIN: currentUser created:",
                savedSession
            );


            if (!savedSession) {

                showMessage(
                    "Login session could not be created. Please try again."
                );

                return;
            }


            // =====================================================
            // SUCCESS
            // =====================================================

            showMessage(
                "Login successful. Redirecting...",
                "success"
            );


            if (loginButton) {

                loginButton.disabled = true;

                loginButton.textContent =
                    "Logging in...";

            }


            // =====================================================
            // GO TO OVERVIEW
            // =====================================================

            setTimeout(function () {

                window.location.replace(
                    "./overview.html"
                );

            }, 500);

        }
    );


    // =========================================================
    // ACCOUNT NUMBER GENERATOR
    // =========================================================

    function generateAccountNumber(
        email,
        allUsers
    ) {

        let number = "";

        for (
            let i = 0;
            i < email.length;
            i++
        ) {

            number +=
                email.charCodeAt(i);

        }

        number =
            number
                .replace(/\D/g, "")
                .substring(0, 10);


        while (number.length < 10) {

            number +=
                Math.floor(
                    Math.random() * 10
                );

        }


        let exists =
            allUsers.some(function (user) {

                return (
                    user &&
                    user.accountNumber === number
                );

            });


        while (exists) {

            number = "";

            for (
                let i = 0;
                i < 10;
                i++
            ) {

                number +=
                    Math.floor(
                        Math.random() * 10
                    );

            }


            exists =
                allUsers.some(function (user) {

                    return (
                        user &&
                        user.accountNumber === number
                    );

                });

        }


        return number;

    }

});