document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginMessage = document.getElementById("loginMessage");
    const loginButton = document.getElementById("loginButton");

    const togglePassword = document.getElementById("togglePassword");

    const USERS_KEY = "reenUsers";
    const CURRENT_USER_KEY = "currentUser";


    // =====================================================
    // SHOW / HIDE PASSWORD
    // =====================================================

    if (togglePassword && passwordInput) {

        togglePassword.addEventListener("click", function () {

            const isPassword =
                passwordInput.type === "password";


            if (isPassword) {

                // Show password
                passwordInput.type = "text";

                togglePassword.innerHTML =
                    '<i class="fa-solid fa-eye-slash"></i>';

                togglePassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

                togglePassword.setAttribute(
                    "title",
                    "Hide password"
                );

            } else {

                // Hide password
                passwordInput.type = "password";

                togglePassword.innerHTML =
                    '<i class="fa-solid fa-eye"></i>';

                togglePassword.setAttribute(
                    "aria-label",
                    "Show password"
                );

                togglePassword.setAttribute(
                    "title",
                    "Show password"
                );

            }

        });

    }


    // =====================================================
    // SHOW MESSAGE
    // =====================================================

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


    // =====================================================
    // LOGIN
    // =====================================================

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();


            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();

            const password =
                passwordInput.value;


            // =====================================================
            // CHECK FIELDS
            // =====================================================

            if (!email || !password) {

                showMessage(
                    "Please enter your email and password."
                );

                return;
            }


            // =====================================================
            // GET REGISTERED USERS
            // =====================================================

            let users = [];

            try {

                users =
                    JSON.parse(
                        localStorage.getItem(USERS_KEY)
                    ) || [];

            } catch (error) {

                console.error(
                    "Could not read users:",
                    error
                );

                users = [];

            }


            // Make sure users is an array

            if (!Array.isArray(users)) {

                users = [];

            }


            // =====================================================
            // FIND USER
            // =====================================================

            const userIndex =
                users.findIndex(function (user) {

                    return (
                        user &&
                        typeof user.email === "string" &&
                        user.email.toLowerCase() === email
                    );

                });


            // =====================================================
            // USER DOES NOT EXIST
            // =====================================================

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


            // =====================================================
            // GENERATE ACCOUNT NUMBER
            // =====================================================

            if (!user.accountNumber) {

                user.accountNumber =
                    generateAccountNumber(
                        user.email,
                        users
                    );

            }


            // =====================================================
            // SAVE UPDATED USER
            // =====================================================

            users[userIndex] = user;

            localStorage.setItem(
                USERS_KEY,
                JSON.stringify(users)
            );


            // =====================================================
            // SAVE CURRENT USER
            // =====================================================

            const currentUser = {

                name: user.name || "User",

                email: user.email,

                accountNumber:
                    user.accountNumber

            };


            sessionStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(currentUser)
            );


            // =====================================================
            // SUCCESS MESSAGE
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
            // GO TO DASHBOARD
            // =====================================================

            setTimeout(function () {

                window.location.href =
                    "./overview.html";

            }, 500);

        });

    }


    // =====================================================
    // ACCOUNT NUMBER GENERATOR
    // =====================================================

    function generateAccountNumber(email, users) {

        let number = "";


        // Create numbers from email characters

        for (let i = 0; i < email.length; i++) {

            number +=
                email.charCodeAt(i);

        }


        // Keep only numbers

        number =
            number.replace(/\D/g, "");


        // Take first 10 digits

        number =
            number.substring(0, 10);


        // Make sure it has 10 digits

        while (number.length < 10) {

            number +=
                Math.floor(
                    Math.random() * 10
                );

        }


        let accountNumber =
            number;


        // =====================================================
        // CHECK ACCOUNT NUMBER UNIQUENESS
        // =====================================================

        let exists =
            users.some(function (user) {

                return (
                    user &&
                    user.accountNumber === accountNumber
                );

            });


        // Generate another number if it already exists

        while (exists) {

            accountNumber = "";


            for (let i = 0; i < 10; i++) {

                accountNumber +=
                    Math.floor(
                        Math.random() * 10
                    );

            }


            exists =
                users.some(function (user) {

                    return (
                        user &&
                        user.accountNumber === accountNumber
                    );

                });

        }


        return accountNumber;

    }

});