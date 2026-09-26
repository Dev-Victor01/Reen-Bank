console.log("OTP.JS IS LOADED!");

const pendingUserJSON = sessionStorage.getItem("pendingUser");

console.log("Pending user:", pendingUserJSON);

if (!pendingUserJSON) {
    alert("No registration data found. Please register again.");
    window.location.href = "./register.html";
} else {
    const pendingUser = JSON.parse(pendingUserJSON);

    console.log("================================");
    console.log("STORED OTP:", pendingUser.otp);
    console.log("EMAIL:", pendingUser.email);
    console.log("================================");

    const userEmail = document.getElementById("userEmail");

    if (userEmail) {
        userEmail.textContent = maskEmail(pendingUser.email);
    }

    function maskEmail(email) {
        const parts = email.split("@");
        const username = parts[0];
        const domain = parts[1];

        if (username.length <= 2) {
            return username + "***@" + domain;
        }

        return (
            username.substring(0, 2) +
            "***" +
            username.substring(username.length - 1) +
            "@" +
            domain
        );
    }

    const otpInputs = document.querySelectorAll(".otp-input");

    console.log("OTP INPUTS FOUND:", otpInputs.length);

    otpInputs.forEach(function (input, index) {

        input.addEventListener("input", function () {

            this.value = this.value.replace(/\D/g, "");

            if (this.value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        input.addEventListener("keydown", function (event) {

            if (
                event.key === "Backspace" &&
                !this.value &&
                index > 0
            ) {
                otpInputs[index - 1].focus();
            }
        });
    });

    const otpForm = document.getElementById("otpForm");

    if (otpForm) {

        otpForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const enteredOTP = Array.from(otpInputs)
                .map(function (input) {
                    return input.value.trim();
                })
                .join("");

            console.log("================================");
            console.log("ENTERED OTP:", enteredOTP);
            console.log("CORRECT OTP:", String(pendingUser.otp));
            console.log("================================");

            if (enteredOTP.length !== 6) {
                alert("Please enter the complete 6-digit verification code.");
                return;
            }

            if (enteredOTP !== String(pendingUser.otp)) {
                alert("Invalid verification code. Please try again.");
                return;
            }

            console.log("OTP VERIFIED!");

            let users = [];

            try {
                users = JSON.parse(
                    localStorage.getItem("reenUsers")
                ) || [];
            } catch (error) {
                users = [];
            }

            const alreadyExists = users.some(function (user) {
                return user.email === pendingUser.email;
            });

            if (alreadyExists) {
                alert("This account is already registered.");

                sessionStorage.removeItem("pendingUser");

                window.location.href = "./login.html";

                return;
            }

            users.push({
                name: pendingUser.name,
                email: pendingUser.email,
                password: pendingUser.password,
                verified: true,
                createdAt: new Date().toISOString()
            });

            localStorage.setItem(
                "reenUsers",
                JSON.stringify(users)
            );

            sessionStorage.removeItem("pendingUser");

            const successModal =
                document.getElementById("successModal");

            if (successModal) {
                successModal.classList.remove("hidden");
                successModal.classList.add("flex");
            }
        });
    }

    // TIMER

    let timeLeft = 60;

    const timer = document.getElementById("timer");
    const resendButton = document.getElementById("resendButton");

    let countdown;

    function updateTimer() {

        if (!timer) {
            return;
        }

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        timer.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    function startTimer() {

        clearInterval(countdown);

        timeLeft = 60;

        if (resendButton) {
            resendButton.disabled = true;
        }

        updateTimer();

        countdown = setInterval(function () {

            timeLeft--;

            updateTimer();

            if (timeLeft <= 0) {

                clearInterval(countdown);

                if (resendButton) {
                    resendButton.disabled = false;
                }
            }

        }, 1000);
    }

    startTimer();

    // RESEND OTP

    window.resendOTP = function () {

        const newOTP = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        pendingUser.otp = newOTP;

        sessionStorage.setItem(
            "pendingUser",
            JSON.stringify(pendingUser)
        );

        console.log("================================");
        console.log("NEW OTP:", newOTP);
        console.log("================================");

        otpInputs.forEach(function (input) {
            input.value = "";
        });

        if (otpInputs.length > 0) {
            otpInputs[0].focus();
        }

        startTimer();
    };

    window.changeEmail = function () {

        clearInterval(countdown);

        sessionStorage.removeItem("pendingUser");

        window.location.href = "./register.html";
    };

    window.goToLogin = function () {

        clearInterval(countdown);

        window.location.href = "./login.html";
    };
}