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

    /* =========================================================
   FAQ — SELECT QUESTION AND DISPLAY ANSWER
========================================================= */

const faqDisplayQuestion =
    document.getElementById("faqDisplayQuestion");

const faqDisplayAnswer =
    document.getElementById("faqDisplayAnswer");

const faqOptions =
    document.querySelectorAll(".faq-option");


if (
    faqDisplayQuestion &&
    faqDisplayAnswer &&
    faqOptions.length
) {

    faqOptions.forEach((option) => {

        option.addEventListener("click", () => {

            const question =
                option.dataset.question;

            const answer =
                option.dataset.answer;


            if (!question || !answer) {
                return;
            }


            /* ---------------------------------------------
               Fade old content out
            --------------------------------------------- */

            faqDisplayQuestion.classList.add(
                "opacity-0"
            );

            faqDisplayAnswer.classList.add(
                "opacity-0"
            );


            /* ---------------------------------------------
               Update selected question
            --------------------------------------------- */

            faqOptions.forEach((item) => {

                item.classList.remove(
                    "text-[#2CC48A]"
                );

                item.classList.add(
                    "text-[#46237A]"
                );

                item.setAttribute(
                    "aria-selected",
                    "false"
                );

            });


            option.classList.remove(
                "text-[#46237A]"
            );

            option.classList.add(
                "text-[#2CC48A]"
            );

            option.setAttribute(
                "aria-selected",
                "true"
            );


            /* ---------------------------------------------
               Update left panel
            --------------------------------------------- */

            setTimeout(() => {

                faqDisplayQuestion.textContent =
                    question;

                faqDisplayAnswer.textContent =
                    answer;


                faqDisplayQuestion.classList.remove(
                    "opacity-0"
                );

                faqDisplayAnswer.classList.remove(
                    "opacity-0"
                );

            }, 150);

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