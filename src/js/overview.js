// =====================================================
// LOGOUT MODAL
// =====================================================

const logoutButton = document.getElementById("logoutButton");
const logoutModal = document.getElementById("logoutModal");
const cancelLogoutButton = document.getElementById("cancelLogout");
const confirmLogoutButton = document.getElementById("confirmLogout");

// Open logout modal
function openLogoutModal() {

    if (!logoutModal) {
        console.error("logoutModal was not found in the HTML.");
        return;
    }

    logoutModal.classList.remove("hidden");
    logoutModal.classList.add("flex");

    console.log("Logout modal opened");
}


// Close logout modal
function closeLogoutModal() {

    if (!logoutModal) {
        console.error("logoutModal was not found in the HTML.");
        return;
    }

    logoutModal.classList.add("hidden");
    logoutModal.classList.remove("flex");

    console.log("Logout modal closed");
}


// =====================================================
// OPEN LOGOUT MODAL
// =====================================================

if (logoutButton) {

    logoutButton.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        openLogoutModal();

    });

} else {

    console.error("logoutButton was not found in the HTML.");

}


// =====================================================
// CANCEL LOGOUT
// =====================================================

if (cancelLogoutButton) {

    cancelLogoutButton.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        closeLogoutModal();

    });

} else {

    console.error("cancelLogout button was not found in the HTML.");

}


// =====================================================
// CONFIRM LOGOUT
// =====================================================

if (confirmLogoutButton) {

    confirmLogoutButton.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        console.log("Logout confirmed");

        // Remove logged-in user
        sessionStorage.removeItem("currentUser");

        // Redirect to login page
        window.location.href = "./login.html";

    });

} else {

    console.error("confirmLogout button was not found in the HTML.");

}


// =====================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// =====================================================

if (logoutModal) {

    logoutModal.addEventListener("click", function (event) {

        // Only close if the actual background is clicked
        if (event.target === logoutModal) {
            closeLogoutModal();
        }

    });

}


// =====================================================
// CLOSE MODAL WITH ESC KEY
// =====================================================

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        if (
            logoutModal &&
            !logoutModal.classList.contains("hidden")
        ) {

            closeLogoutModal();

        }
    }

});