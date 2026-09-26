// =====================================================
// REEN BANK - INDEX PAGE JAVASCRIPT
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =================================================
    // MOBILE MENU
    // =================================================

    const menuBtn = document.getElementById("menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    if (menuBtn && mobileMenu) {

        menuBtn.addEventListener("click", function () {

            const isOpen =
                !mobileMenu.classList.contains("hidden");

            if (isOpen) {
                mobileMenu.classList.add("hidden");
                menuBtn.setAttribute("aria-expanded", "false");

                menuBtn.innerHTML =
                    '<i class="fa-solid fa-bars"></i>';

            } else {
                mobileMenu.classList.remove("hidden");
                menuBtn.setAttribute("aria-expanded", "true");

                menuBtn.innerHTML =
                    '<i class="fa-solid fa-xmark"></i>';
            }
        });


        // Close mobile menu after clicking a link
        const mobileLinks =
            document.querySelectorAll(".mobile-link");

        mobileLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                mobileMenu.classList.add("hidden");

                menuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuBtn.innerHTML =
                    '<i class="fa-solid fa-bars"></i>';
            });
        });
    }


    // =================================================
    // SMOOTH SCROLLING
    // =================================================

    const pageLinks =
        document.querySelectorAll('a[href^="#"]');

    pageLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId =
                this.getAttribute("href");

            // Ignore links that are just "#"
            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });


    // =================================================
    // FOOTER GET STARTED FORM
    // =================================================

    const footerForm =
        document.querySelector("footer form");

    if (footerForm) {

        footerForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const emailInput =
                    footerForm.querySelector(
                        'input[type="email"]'
                    );

                if (!emailInput) {
                    return;
                }

                const email =
                    emailInput.value.trim().toLowerCase();

                // Validate email
                if (!email) {

                    alert(
                        "Please enter your email address."
                    );

                    emailInput.focus();

                    return;
                }

                if (!emailInput.checkValidity()) {

                    alert(
                        "Please enter a valid email address."
                    );

                    emailInput.focus();

                    return;
                }


                // -----------------------------------------
                // Save email separately.
                // This does NOT touch pendingUser,
                // reenUsers, or the OTP system.
                // -----------------------------------------

                sessionStorage.setItem(
                    "reenHomeEmail",
                    email
                );


                // -----------------------------------------
                // Go to registration page
                // -----------------------------------------

                window.location.href =
                    "./register.html";
            }
        );
    }


    // =================================================
    // ENTER KEY / EMAIL INPUT
    // =================================================

    const footerEmail =
        footerForm
            ? footerForm.querySelector(
                'input[type="email"]'
            )
            : null;

    if (footerEmail) {

        footerEmail.addEventListener(
            "input",
            function () {

                // Remove browser validation message
                // once the user starts correcting it.
                this.setCustomValidity("");
            }
        );
    }

});