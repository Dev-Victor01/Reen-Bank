document.addEventListener("DOMContentLoaded", function () {

    const registerForm = document.getElementById("registerForm");

    // =====================================================
    // PASSWORD SHOW / HIDE
    // =====================================================

    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");

    if (passwordInput && togglePassword) {

        togglePassword.addEventListener("click", function () {

            const isPassword =
                passwordInput.type === "password";

            passwordInput.type =
                isPassword ? "text" : "password";

            togglePassword.innerHTML =
                isPassword
                    ? '<i class="fa-solid fa-eye-slash"></i>'
                    : '<i class="fa-solid fa-eye"></i>';

            togglePassword.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );

        });

    }


    // =====================================================
    // REGISTRATION FORM
    // =====================================================

    if (registerForm) {

        registerForm.addEventListener("submit", function (event) {

            event.preventDefault();


            // =====================================================
            // GET FORM VALUES
            // =====================================================

            const nameInput =
                document.getElementById("name");

            const emailInput =
                document.getElementById("email");

            const passwordInput =
                document.getElementById("password");


            if (
                !nameInput ||
                !emailInput ||
                !passwordInput
            ) {

                console.error(
                    "Registration form fields were not found."
                );

                return;
            }


            const name =
                nameInput.value.trim();

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();

            const password =
                passwordInput.value;


            // =====================================================
            // VALIDATE FORM
            // =====================================================

            if (!name || !email || !password) {

                alert(
                    "Please fill in all fields."
                );

                return;
            }


            // =====================================================
            // PASSWORD LENGTH
            // =====================================================

            if (password.length < 8) {

                alert(
                    "Password must be at least 8 characters long."
                );

                passwordInput.focus();

                return;
            }


            // =====================================================
            // GET EXISTING USERS
            // =====================================================

            let users = [];

            try {

                users =
                    JSON.parse(
                        localStorage.getItem("reenUsers")
                    ) || [];

            } catch (error) {

                console.error(
                    "Could not read registered users:",
                    error
                );

                users = [];
            }


            // Make sure users is an array

            if (!Array.isArray(users)) {

                users = [];

            }


            // =====================================================
            // CHECK IF EMAIL ALREADY EXISTS
            // =====================================================

            const existingUser =
                users.find(function (user) {

                    return (
                        user &&
                        typeof user.email === "string" &&
                        user.email.toLowerCase() === email
                    );

                });


            if (existingUser) {

                const modal =
                    document.getElementById(
                        "alreadyRegisteredModal"
                    );


                if (modal) {

                    modal.classList.remove("hidden");

                    modal.classList.add("flex");

                } else {

                    alert(
                        "An account with this email already exists."
                    );

                }

                return;
            }


            // =====================================================
            // GENERATE OTP
            // =====================================================

            const otp =
                Math.floor(
                    100000 +
                    Math.random() * 900000
                ).toString();


            // =====================================================
            // CREATE PENDING USER
            // =====================================================

            const pendingUser = {

                name: name,

                email: email,

                password: password,

                otp: otp

            };


            // =====================================================
            // SAVE PENDING USER
            // =====================================================

            sessionStorage.setItem(
                "pendingUser",
                JSON.stringify(pendingUser)
            );


            // =====================================================
            // SHOW OTP FOR TESTING
            // =====================================================

            console.log(
                "================================"
            );

            console.log(
                "YOUR OTP IS:",
                otp
            );

            console.log(
                "================================"
            );


            // =====================================================
            // GO TO OTP PAGE
            // =====================================================

            window.location.href =
                "./otp.html";

        });

    }

});


// =========================================================
// CLOSE ALREADY REGISTERED MODAL
// =========================================================

function closeAlreadyRegisteredModal() {

    const modal =
        document.getElementById(
            "alreadyRegisteredModal"
        );


    if (modal) {

        modal.classList.add("hidden");

        modal.classList.remove("flex");

    }

}