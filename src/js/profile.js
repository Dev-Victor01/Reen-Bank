document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // STORAGE KEYS
    // =====================================================

    const USERS_KEY = "reenUsers";
    const CURRENT_USER_KEY = "currentUser";


    // =====================================================
    // GET ELEMENTS
    // =====================================================

    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    const menuButton =
        document.getElementById("menuButton");

    const headerUserName =
        document.getElementById("headerUserName");

    const accountNumber =
        document.getElementById("accountNumber");

    const profileName =
        document.getElementById("profileName");

    const profileEmail =
        document.getElementById("profileEmail");

    const profilePhone =
        document.getElementById("profilePhone");

    const profileGender =
        document.getElementById("profileGender");

    const profileAccountNumber =
        document.getElementById("profileAccountNumber");

    const profileCreatedAt =
        document.getElementById("profileCreatedAt");

    const profileAvatar =
        document.getElementById("profileAvatar");

    const profileImage =
        document.getElementById("profileImage");

    const profileImageInput =
        document.getElementById("profileImageInput");

    const editProfileImage =
        document.getElementById("editProfileImage");

    const mainAccountBalance =
        document.getElementById("mainAccountBalance");

    const balanceToggle =
        document.getElementById("balanceToggle");

    const balanceToggleIcon =
        document.getElementById("balanceToggleIcon");

    const profileTransactions =
        document.getElementById("profileTransactions");

    const emptyProfileTransactions =
        document.getElementById(
            "emptyProfileTransactions"
        );


    // =====================================================
    // LOGOUT ELEMENTS
    // =====================================================

    const logoutButton =
        document.getElementById("logoutButton");

    const logoutModal =
        document.getElementById("logoutModal");

    const cancelLogout =
        document.getElementById("cancelLogout");

    const confirmLogout =
        document.getElementById("confirmLogout");


    // =====================================================
    // RESET PASSWORD ELEMENTS
    // =====================================================

    const resetPasswordButton =
        document.getElementById(
            "resetPasswordButton"
        );

    const resetPasswordModal =
        document.getElementById(
            "resetPasswordModal"
        );

    const cancelResetPassword =
        document.getElementById(
            "cancelResetPassword"
        );

    const saveNewPassword =
        document.getElementById(
            "saveNewPassword"
        );

    const newPassword =
        document.getElementById("newPassword");

    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        );

    const toggleNewPassword =
        document.getElementById(
            "toggleNewPassword"
        );

    const toggleConfirmPassword =
        document.getElementById(
            "toggleConfirmPassword"
        );

    const passwordMessage =
        document.getElementById(
            "passwordMessage"
        );


    // =====================================================
    // GET CURRENT USER
    // =====================================================

    let currentSession = null;

    try {

        currentSession =
            JSON.parse(
                sessionStorage.getItem(
                    CURRENT_USER_KEY
                )
            );

    } catch (error) {

        console.error(
            "Could not read current user:",
            error
        );

        currentSession = null;

    }


    // =====================================================
    // CHECK LOGIN
    // =====================================================

    if (
        !currentSession ||
        !currentSession.email
    ) {

        window.location.href =
            "./login.html";

        return;

    }


    // =====================================================
    // GET USERS
    // =====================================================

    let users = [];

    try {

        users =
            JSON.parse(
                localStorage.getItem(
                    USERS_KEY
                )
            ) || [];

    } catch (error) {

        console.error(
            "Could not read users:",
            error
        );

        users = [];

    }


    if (!Array.isArray(users)) {

        users = [];

    }


    // =====================================================
    // FIND LOGGED-IN USER
    // =====================================================

    const userIndex =
        users.findIndex(function (user) {

            return (
                user &&
                typeof user.email === "string" &&
                user.email.toLowerCase() ===
                    currentSession.email.toLowerCase()
            );

        });


    if (userIndex === -1) {

        sessionStorage.removeItem(
            CURRENT_USER_KEY
        );

        window.location.href =
            "./login.html";

        return;

    }


    const user =
        users[userIndex];


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
    // SAVE INITIALIZED USER
    // =====================================================

    users[userIndex] = user;

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );


    // =====================================================
    // SECOND NAME / SURNAME
    // =====================================================

    function getSecondName(fullName) {

        if (!fullName) {

            return "User";

        }

        const names =
            fullName
                .trim()
                .split(/\s+/);


        if (names.length >= 2) {

            return names[names.length - 1];

        }

        return names[0];

    }


    // =====================================================
    // MONEY FORMAT
    // =====================================================

    function formatMoney(amount) {

        const value =
            Number(amount) || 0;

        return (
            "₦" +
            value.toLocaleString(
                "en-NG",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )
        );

    }


    // =====================================================
    // UPDATE USER INFORMATION
    // =====================================================

    function updateUserInformation() {

        const displayName =
            getSecondName(user.name);


        if (headerUserName) {

            headerUserName.textContent =
                displayName;

        }


        if (profileName) {

            profileName.textContent =
                user.name || "User";

        }


        if (profileEmail) {

            profileEmail.textContent =
                user.email || "Not provided";

        }


        if (profilePhone) {

            profilePhone.textContent =
                user.phone || "Not provided";

        }


        if (profileGender) {

            profileGender.textContent =
                user.gender || "Not provided";

        }


        if (accountNumber) {

            accountNumber.textContent =
                user.accountNumber ||
                "0000000000";

        }


        if (profileAccountNumber) {

            profileAccountNumber.textContent =
                user.accountNumber ||
                "0000000000";

        }


        if (profileCreatedAt) {

            profileCreatedAt.textContent =
                formatDate(
                    user.createdAt
                );

        }


        updateAvatar();

    }


    // =====================================================
    // DATE FORMAT
    // =====================================================

    function formatDate(dateValue) {

        if (!dateValue) {

            return "Not available";

        }


        const date =
            new Date(dateValue);


        if (Number.isNaN(date.getTime())) {

            return "Not available";

        }


        return date.toLocaleDateString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // =====================================================
    // AVATAR
    // =====================================================

    function getInitials(name) {

        if (!name) {

            return "U";

        }


        const names =
            name.trim().split(/\s+/);


        if (names.length === 1) {

            return names[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            names[0][0] +
            names[names.length - 1][0]
        ).toUpperCase();

    }


    function updateAvatar() {

        const initials =
            getInitials(user.name);


        if (
            user.profileImage &&
            profileImage
        ) {

            profileImage.innerHTML = "";

            const image =
                document.createElement("img");

            image.src =
                user.profileImage;

            image.alt =
                "Profile picture";

            image.className =
                "h-full w-full object-cover";

            profileImage.appendChild(image);

        } else if (profileImage) {

            profileImage.textContent =
                initials;

        }


        if (
            user.profileImage &&
            profileAvatar
        ) {

            profileAvatar.innerHTML = "";

            const image =
                document.createElement("img");

            image.src =
                user.profileImage;

            image.alt =
                "Profile picture";

            image.className =
                "h-full w-full object-cover";

            profileAvatar.appendChild(image);

        } else if (profileAvatar) {

            profileAvatar.textContent =
                initials;

        }

    }


    // =====================================================
    // UPDATE BALANCE
    // =====================================================

    let balanceVisible = true;


    function updateBalance() {

        if (!mainAccountBalance) return;


        if (balanceVisible) {

            mainAccountBalance.textContent =
                formatMoney(
                    user.balance
                );

        } else {

            mainAccountBalance.textContent =
                "₦••••••";

        }


        if (balanceToggleIcon) {

            balanceToggleIcon.className =
                balanceVisible
                    ? "fa-regular fa-eye-slash"
                    : "fa-regular fa-eye";

        }

    }


    if (balanceToggle) {

        balanceToggle.addEventListener(
            "click",
            function () {

                balanceVisible =
                    !balanceVisible;

                updateBalance();

            }
        );

    }


    // =====================================================
    // TRANSACTIONS
    // =====================================================

    function updateTransactions() {

        if (!profileTransactions) return;


        profileTransactions.innerHTML = "";


        const transactions =
            Array.isArray(user.transactions)
                ? [...user.transactions]
                : [];


        if (transactions.length === 0) {

            if (emptyProfileTransactions) {

                emptyProfileTransactions.classList.remove(
                    "hidden"
                );

            }

            return;

        }


        if (emptyProfileTransactions) {

            emptyProfileTransactions.classList.add(
                "hidden"
            );

        }


        transactions
            .sort(function (a, b) {

                return (
                    new Date(
                        b.date || 0
                    ) -
                    new Date(
                        a.date || 0
                    )
                );

            })
            .slice(0, 8)
            .forEach(function (transaction) {

                const isDeposit =
                    transaction.type ===
                    "deposit";


                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "flex items-center justify-between py-3";


                const left =
                    document.createElement(
                        "div"
                    );

                left.className =
                    "min-w-0";


                const description =
                    document.createElement(
                        "p"
                    );

                description.className =
                    "truncate text-xs font-medium text-gray-700";

                description.textContent =
                    transaction.description ||
                    (
                        isDeposit
                            ? "Deposit"
                            : "Withdrawal"
                    );


                const date =
                    document.createElement(
                        "p"
                    );

                date.className =
                    "mt-1 text-[10px] text-gray-400";

                date.textContent =
                    formatTransactionDate(
                        transaction.date
                    );


                left.appendChild(
                    description
                );

                left.appendChild(
                    date
                );


                const amount =
                    document.createElement(
                        "p"
                    );

                amount.className =
                    "ml-3 whitespace-nowrap text-xs font-semibold " +
                    (
                        isDeposit
                            ? "text-[#33B786]"
                            : "text-red-500"
                    );


                amount.textContent =
                    (
                        isDeposit
                            ? "+"
                            : "-"
                    ) +
                    formatMoney(
                        transaction.amount
                    );


                row.appendChild(left);

                row.appendChild(amount);

                profileTransactions.appendChild(
                    row
                );

            });

    }


    // =====================================================
    // TRANSACTION DATE
    // =====================================================

    function formatTransactionDate(
        dateValue
    ) {

        if (!dateValue) {

            return "Date unavailable";

        }


        const date =
            new Date(dateValue);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Date unavailable";

        }


        return date.toLocaleDateString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // =====================================================
    // MOBILE SIDEBAR
    // =====================================================

    function openSidebar() {

        if (sidebar) {

            sidebar.classList.remove(
                "-translate-x-full"
            );

            sidebar.classList.add(
                "translate-x-0"
            );

        }


        if (sidebarOverlay) {

            sidebarOverlay.classList.remove(
                "hidden"
            );

        }

    }


    function closeSidebar() {

        if (sidebar) {

            sidebar.classList.add(
                "-translate-x-full"
            );

            sidebar.classList.remove(
                "translate-x-0"
            );

        }


        if (sidebarOverlay) {

            sidebarOverlay.classList.add(
                "hidden"
            );

        }

    }


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            openSidebar
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    // =====================================================
    // PROFILE IMAGE
    // =====================================================

    if (editProfileImage) {

        editProfileImage.addEventListener(
            "click",
            function () {

                if (profileImageInput) {

                    profileImageInput.click();

                }

            }
        );

    }


    if (profileImageInput) {

        profileImageInput.addEventListener(
            "change",
            function (event) {

                const file =
                    event.target.files[0];


                if (!file) return;


                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    alert(
                        "Please select an image."
                    );

                    return;

                }


                const reader =
                    new FileReader();


                reader.onload =
                    function (e) {

                        user.profileImage =
                            e.target.result;


                        users[userIndex] =
                            user;


                        localStorage.setItem(
                            USERS_KEY,
                            JSON.stringify(
                                users
                            )
                        );


                        updateAvatar();

                    };


                reader.readAsDataURL(file);

            }
        );

    }


    // =====================================================
    // RESET PASSWORD MODAL
    // =====================================================

    function openResetPasswordModal() {

        if (!resetPasswordModal) return;


        resetPasswordModal.classList.remove(
            "hidden"
        );

        resetPasswordModal.classList.add(
            "flex"
        );


        if (newPassword) {

            newPassword.value = "";

        }


        if (confirmPassword) {

            confirmPassword.value = "";

        }


        hidePasswordMessage();

    }


    function closeResetPasswordModal() {

        if (!resetPasswordModal) return;


        resetPasswordModal.classList.add(
            "hidden"
        );

        resetPasswordModal.classList.remove(
            "flex"
        );

    }


    if (resetPasswordButton) {

        resetPasswordButton.addEventListener(
            "click",
            openResetPasswordModal
        );

    }


    if (cancelResetPassword) {

        cancelResetPassword.addEventListener(
            "click",
            closeResetPasswordModal
        );

    }


    // =====================================================
    // PASSWORD SHOW / HIDE
    // =====================================================

    function setupPasswordToggle(
        input,
        button
    ) {

        if (!input || !button) return;


        button.addEventListener(
            "click",
            function () {

                const hidden =
                    input.type ===
                    "password";


                input.type =
                    hidden
                        ? "text"
                        : "password";


                button.innerHTML =
                    hidden
                        ? '<i class="fa-solid fa-eye-slash"></i>'
                        : '<i class="fa-solid fa-eye"></i>';

            }
        );

    }


    setupPasswordToggle(
        newPassword,
        toggleNewPassword
    );


    setupPasswordToggle(
        confirmPassword,
        toggleConfirmPassword
    );


    // =====================================================
    // PASSWORD MESSAGE
    // =====================================================

    function showPasswordMessage(
        message,
        type
    ) {

        if (!passwordMessage) return;


        passwordMessage.textContent =
            message;


        passwordMessage.classList.remove(
            "hidden",
            "bg-red-100",
            "text-red-700",
            "bg-green-100",
            "text-green-700"
        );


        if (type === "success") {

            passwordMessage.classList.add(
                "bg-green-100",
                "text-green-700"
            );

        } else {

            passwordMessage.classList.add(
                "bg-red-100",
                "text-red-700"
            );

        }

    }


    function hidePasswordMessage() {

        if (!passwordMessage) return;


        passwordMessage.classList.add(
            "hidden"
        );

    }


    // =====================================================
    // SAVE NEW PASSWORD
    // =====================================================

    if (saveNewPassword) {

        saveNewPassword.addEventListener(
            "click",
            function () {

                const password =
                    newPassword.value;

                const confirmation =
                    confirmPassword.value;


                if (password.length < 8) {

                    showPasswordMessage(
                        "Password must be at least 8 characters long.",
                        "error"
                    );

                    return;

                }


                if (
                    password !==
                    confirmation
                ) {

                    showPasswordMessage(
                        "Passwords do not match.",
                        "error"
                    );

                    return;

                }


                user.password =
                    password;


                users[userIndex] =
                    user;


                localStorage.setItem(
                    USERS_KEY,
                    JSON.stringify(
                        users
                    )
                );


                showPasswordMessage(
                    "Password updated successfully.",
                    "success"
                );


                setTimeout(
                    function () {

                        closeResetPasswordModal();

                    },
                    1000
                );

            }
        );

    }


    // =====================================================
    // LOGOUT
    // =====================================================

    function openLogoutModal() {

        if (!logoutModal) return;


        logoutModal.classList.remove(
            "hidden"
        );

        logoutModal.classList.add(
            "flex"
        );

    }


    function closeLogoutModal() {

        if (!logoutModal) return;


        logoutModal.classList.add(
            "hidden"
        );

        logoutModal.classList.remove(
            "flex"
        );

    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            openLogoutModal
        );

    }


    if (cancelLogout) {

        cancelLogout.addEventListener(
            "click",
            closeLogoutModal
        );

    }


    if (confirmLogout) {

        confirmLogout.addEventListener(
            "click",
            function () {

                sessionStorage.removeItem(
                    CURRENT_USER_KEY
                );

                window.location.href =
                    "./login.html";

            }
        );

    }


    if (logoutModal) {

        logoutModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    logoutModal
                ) {

                    closeLogoutModal();

                }

            }
        );

    }


    // =====================================================
    // ESCAPE KEY
    // =====================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Escape") {
                return;
            }


            closeLogoutModal();

            closeResetPasswordModal();

            closeSidebar();

        }
    );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    updateUserInformation();

    updateBalance();

    updateTransactions();

});