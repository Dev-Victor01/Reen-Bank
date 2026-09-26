const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        // Get form values
        const name = document.getElementById("name").value.trim();

        const email = document
            .getElementById("email")
            .value
            .trim()
            .toLowerCase();

        const password =
            document.getElementById("password").value;


        // Get existing users
        let users = [];

        try {
            users =
                JSON.parse(
                    localStorage.getItem("reenUsers")
                ) || [];
        } catch (error) {
            users = [];
        }


        // Check if email already exists
        const existingUser = users.find(function (user) {
            return user.email === email;
        });


        if (existingUser) {

            const modal =
                document.getElementById(
                    "alreadyRegisteredModal"
                );

            if (modal) {
                modal.classList.remove("hidden");
                modal.classList.add("flex");
            }

            return;
        }


        // =====================================================
        // GENERATE OTP
        // =====================================================

        const otp =
            Math.floor(
                100000 + Math.random() * 900000
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

        window.location.href = "./otp.html";

    });

}


// =========================================================
// CLOSE MODAL
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

