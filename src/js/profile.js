/* =========================================================
   REEN BANK — PROFILE PAGE JAVASCRIPT
   ---------------------------------------------------------
   Works with:
   - reenUsers      -> localStorage
   - currentUser    -> localStorage OR sessionStorage

   Features:
   - Load current user
   - Profile information
   - Profile image upload
   - Header avatar
   - Balance display
   - Balance visibility
   - Recent transactions
   - Search transactions
   - Mobile sidebar
   - Logout modal
   - Reset password modal
   - Password visibility
   - Password validation
   - Password update
   - Storage persistence
========================================================= */


document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       1. STORAGE
    ===================================================== */

    let users =
        JSON.parse(
            localStorage.getItem("reenUsers")
        ) || [];


    let currentUser =
        JSON.parse(
            localStorage.getItem("currentUser")
        ) ||
        JSON.parse(
            sessionStorage.getItem("currentUser")
        ) ||
        null;



    /* =====================================================
       2. CHECK LOGIN
    ===================================================== */

    if (!currentUser) {

        window.location.href =
            "./register.html";

        return;
    }



    /* =====================================================
       3. FIND COMPLETE USER
    ===================================================== */

    let userIndex = -1;


    if (currentUser.email) {

        userIndex =
            users.findIndex(
                user =>
                    user.email &&
                    user.email.toLowerCase() ===
                    currentUser.email.toLowerCase()
            );
    }


    /*
        Fallback using account number.
    */

    if (
        userIndex === -1 &&
        currentUser.accountNumber
    ) {

        userIndex =
            users.findIndex(
                user =>
                    user.accountNumber ===
                    currentUser.accountNumber
            );
    }


    /*
        Fallback using name.
    */

    if (
        userIndex === -1 &&
        currentUser.name
    ) {

        userIndex =
            users.findIndex(
                user =>
                    user.name ===
                    currentUser.name
            );
    }


    if (userIndex === -1) {

        alert(
            "Your account could not be found. Please log in again."
        );


        localStorage.removeItem(
            "currentUser"
        );


        sessionStorage.removeItem(
            "currentUser"
        );


        window.location.href =
            "./register.html";


        return;
    }



    /* =====================================================
       4. USE COMPLETE USER
    ===================================================== */

    currentUser =
        users[userIndex];



    /* =====================================================
       5. INITIALIZE USER DATA
    ===================================================== */

    if (
        typeof currentUser.balance !==
        "number"
    ) {

        currentUser.balance = 0;
    }


    if (
        typeof currentUser.income !==
        "number"
    ) {

        currentUser.income = 0;
    }


    if (
        typeof currentUser.expense !==
        "number"
    ) {

        currentUser.expense = 0;
    }


    if (
        !Array.isArray(
            currentUser.transactions
        )
    ) {

        currentUser.transactions = [];
    }


    if (
        !Array.isArray(
            currentUser.accounts
        )
    ) {

        currentUser.accounts = [];
    }



    /* =====================================================
       6. SAVE USER
    ===================================================== */

    function saveUser() {

        users[userIndex] =
            currentUser;


        localStorage.setItem(
            "reenUsers",
            JSON.stringify(users)
        );


        /*
            Keep current session information.
        */

        const sessionUser = {

            name:
                currentUser.name,

            email:
                currentUser.email,

            accountNumber:
                currentUser.accountNumber
        };


        localStorage.setItem(
            "currentUser",
            JSON.stringify(sessionUser)
        );


        sessionStorage.setItem(
            "currentUser",
            JSON.stringify(sessionUser)
        );
    }



    /* =====================================================
       7. HELPER — FORMAT MONEY
    ===================================================== */

    function formatMoney(amount) {

        return (
            "₦" +
            (
                Number(amount) || 0
            ).toLocaleString(
                "en-NG",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )
        );
    }



    /* =====================================================
       8. HELPER — FORMAT DATE
    ===================================================== */

    function formatDate(date) {

        if (!date) {

            return "Not available";
        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "Not available";
        }


        return parsedDate.toLocaleDateString(
            "en-NG",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );
    }



    /* =====================================================
       9. HELPER — INITIALS
    ===================================================== */

    function getInitials(name) {

        if (!name) {

            return "U";
        }


        const words =
            name
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (
            words.length === 1
        ) {

            return (
                words[0]
                    .substring(0, 2)
                    .toUpperCase()
            );
        }


        return (
            words[0].charAt(0) +
            words[
                words.length - 1
            ].charAt(0)
        ).toUpperCase();
    }



    /* =====================================================
       10. HELPER — MODALS
    ===================================================== */

    function openModal(modal) {

        if (!modal) {
            return;
        }


        modal.classList.remove(
            "hidden"
        );


        modal.classList.add(
            "flex"
        );


        document.body.classList.add(
            "overflow-hidden"
        );
    }



    function closeModal(modal) {

        if (!modal) {
            return;
        }


        modal.classList.add(
            "hidden"
        );


        modal.classList.remove(
            "flex"
        );


        const visibleModal =
            document.querySelector(
                '[id$="Modal"]:not(.hidden)'
            );


        if (!visibleModal) {

            document.body.classList.remove(
                "overflow-hidden"
            );
        }
    }



    /* =====================================================
       11. LOAD PROFILE INFORMATION
    ===================================================== */

    const headerUserName =
        document.getElementById(
            "headerUserName"
        );


    const accountNumber =
        document.getElementById(
            "accountNumber"
        );


    const profileName =
        document.getElementById(
            "profileName"
        );


    const profileEmail =
        document.getElementById(
            "profileEmail"
        );


    const profilePhone =
        document.getElementById(
            "profilePhone"
        );


    const profileGender =
        document.getElementById(
            "profileGender"
        );


    const profileAccountNumber =
        document.getElementById(
            "profileAccountNumber"
        );


    const profileCreatedAt =
        document.getElementById(
            "profileCreatedAt"
        );



    /* =====================================================
       12. NAME
    ===================================================== */

    const userName =
        currentUser.name ||
        "User";


    if (headerUserName) {

        headerUserName.textContent =
            userName;
    }


    if (profileName) {

        profileName.textContent =
            userName;
    }



    /* =====================================================
       13. EMAIL
    ===================================================== */

    if (profileEmail) {

        profileEmail.textContent =
            currentUser.email ||
            "Not provided";
    }



    /* =====================================================
       14. PHONE
    ===================================================== */

    if (profilePhone) {

        profilePhone.textContent =
            currentUser.phone ||
            currentUser.phoneNumber ||
            "Not provided";
    }



    /* =====================================================
       15. GENDER
    ===================================================== */

    if (profileGender) {

        profileGender.textContent =
            currentUser.gender ||
            "Not provided";
    }



    /* =====================================================
       16. ACCOUNT NUMBER
    ===================================================== */

    if (accountNumber) {

        accountNumber.textContent =
            currentUser.accountNumber ||
            "0000000000";
    }


    if (profileAccountNumber) {

        profileAccountNumber.textContent =
            currentUser.accountNumber ||
            "0000000000";
    }



    /* =====================================================
       17. MEMBER SINCE
    ===================================================== */

    if (profileCreatedAt) {

        profileCreatedAt.textContent =
            formatDate(
                currentUser.createdAt
            );
    }



    /* =====================================================
       18. PROFILE IMAGE / AVATAR
    ===================================================== */

    const profileImage =
        document.getElementById(
            "profileImage"
        );


    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );


    const savedProfileImage =
        currentUser.profileImage ||
        currentUser.profilePicture ||
        currentUser.avatar ||
        null;


    const initials =
        getInitials(
            currentUser.name
        );



    function displayProfileImage() {

        const imageSource =
            currentUser.profileImage ||
            currentUser.profilePicture ||
            currentUser.avatar ||
            null;


        /*
            Large profile image.
        */

        if (profileImage) {

            profileImage.innerHTML = "";


            if (imageSource) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    imageSource;


                image.alt =
                    currentUser.name ||
                    "Profile picture";


                image.className =
                    "h-full w-full object-cover";


                profileImage.appendChild(
                    image
                );

            } else {

                profileImage.textContent =
                    initials;
            }
        }


        /*
            Header avatar.
        */

        if (profileAvatar) {

            profileAvatar.innerHTML = "";


            if (imageSource) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    imageSource;


                image.alt =
                    currentUser.name ||
                    "Profile picture";


                image.className =
                    "h-full w-full object-cover";


                profileAvatar.appendChild(
                    image
                );

            } else {

                profileAvatar.textContent =
                    initials;
            }
        }
    }


    displayProfileImage();



    /* =====================================================
       19. CHANGE PROFILE IMAGE
    ===================================================== */

    const editProfileImage =
        document.getElementById(
            "editProfileImage"
        );


    const profileImageInput =
        document.getElementById(
            "profileImageInput"
        );


    if (editProfileImage) {

        editProfileImage.addEventListener(
            "click",
            () => {

                if (profileImageInput) {

                    profileImageInput.click();
                }
            }
        );
    }



    /* =====================================================
       20. SAVE PROFILE IMAGE
    ===================================================== */

    if (profileImageInput) {

        profileImageInput.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files[0];


                if (!file) {

                    return;
                }


                /*
                    Only allow image files.
                */

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    alert(
                        "Please select a valid image file."
                    );


                    profileImageInput.value =
                        "";


                    return;
                }


                /*
                    Limit file size to 5MB.
                */

                if (
                    file.size >
                    5 * 1024 * 1024
                ) {

                    alert(
                        "Please choose an image smaller than 5MB."
                    );


                    profileImageInput.value =
                        "";


                    return;
                }


                const reader =
                    new FileReader();


                reader.onload =
                    function () {

                        currentUser.profileImage =
                            reader.result;


                        saveUser();


                        displayProfileImage();


                        profileImageInput.value =
                            "";
                    };


                reader.onerror =
                    function () {

                        alert(
                            "Unable to load the selected image."
                        );
                    };


                reader.readAsDataURL(
                    file
                );
            }
        );
    }



    /* =====================================================
       21. BALANCE
    ===================================================== */

    const mainAccountBalance =
        document.getElementById(
            "mainAccountBalance"
        );


    const balanceToggle =
        document.getElementById(
            "balanceToggle"
        );


    const balanceToggleIcon =
        document.getElementById(
            "balanceToggleIcon"
        );


    let balanceHidden = false;


    function updateBalance() {

        if (!mainAccountBalance) {
            return;
        }


        if (balanceHidden) {

            mainAccountBalance.textContent =
                "₦••••••";

        } else {

            mainAccountBalance.textContent =
                formatMoney(
                    currentUser.balance
                );
        }
    }


    updateBalance();



    /* =====================================================
       22. BALANCE SHOW / HIDE
    ===================================================== */

    if (balanceToggle) {

        balanceToggle.addEventListener(
            "click",
            () => {

                balanceHidden =
                    !balanceHidden;


                updateBalance();


                if (
                    balanceToggleIcon
                ) {

                    if (balanceHidden) {

                        balanceToggleIcon.className =
                            "fa-regular fa-eye";

                    } else {

                        balanceToggleIcon.className =
                            "fa-regular fa-eye-slash";
                    }
                }
            }
        );
    }



    /* =====================================================
       23. PROFILE TRANSACTIONS
    ===================================================== */

    const profileTransactions =
        document.getElementById(
            "profileTransactions"
        );


    const emptyProfileTransactions =
        document.getElementById(
            "emptyProfileTransactions"
        );



    function renderTransactions() {

        if (!profileTransactions) {

            return;
        }


        profileTransactions.innerHTML =
            "";


        const transactions =
            Array.isArray(
                currentUser.transactions
            )
                ? currentUser.transactions
                : [];


        /*
            Show only latest 5.
        */

        const recentTransactions =
            transactions.slice(
                0,
                5
            );


        if (
            recentTransactions.length === 0
        ) {

            if (
                emptyProfileTransactions
            ) {

                emptyProfileTransactions.classList.remove(
                    "hidden"
                );
            }


            return;
        }


        if (
            emptyProfileTransactions
        ) {

            emptyProfileTransactions.classList.add(
                "hidden"
            );
        }


        recentTransactions.forEach(
            transaction => {

                const isIncome =
                    transaction.type ===
                    "income";


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "flex items-center justify-between py-4";


                /* -----------------------------------------
                   LEFT
                ----------------------------------------- */

                const left =
                    document.createElement(
                        "div"
                    );


                left.className =
                    "flex min-w-0 items-center gap-3";


                /* ICON */

                const icon =
                    document.createElement(
                        "div"
                    );


                icon.className =
                    isIncome
                        ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d8f6ed] text-[#33B786]"
                        : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500";


                icon.innerHTML =
                    isIncome
                        ? '<i class="fa-solid fa-arrow-down"></i>'
                        : '<i class="fa-solid fa-arrow-up"></i>';


                /* DETAILS */

                const details =
                    document.createElement(
                        "div"
                    );


                details.className =
                    "min-w-0";


                const description =
                    document.createElement(
                        "p"
                    );


                description.className =
                    "truncate text-sm font-semibold text-gray-800";


                description.textContent =
                    transaction.description ||
                    transaction.category ||
                    "Transaction";


                const date =
                    document.createElement(
                        "p"
                    );


                date.className =
                    "mt-1 text-xs text-gray-400";


                date.textContent =
                    formatShortDate(
                        transaction.date
                    );


                details.appendChild(
                    description
                );


                details.appendChild(
                    date
                );


                left.appendChild(
                    icon
                );


                left.appendChild(
                    details
                );


                /* -----------------------------------------
                   AMOUNT
                ----------------------------------------- */

                const amount =
                    document.createElement(
                        "p"
                    );


                amount.className =
                    isIncome
                        ? "ml-3 shrink-0 text-sm font-semibold text-[#33B786]"
                        : "ml-3 shrink-0 text-sm font-semibold text-red-500";


                amount.textContent =
                    isIncome
                        ? "+" +
                          formatMoney(
                              transaction.amount
                          )
                        : "-" +
                          formatMoney(
                              transaction.amount
                          );


                row.appendChild(
                    left
                );


                row.appendChild(
                    amount
                );


                profileTransactions.appendChild(
                    row
                );
            }
        );
    }



    /* =====================================================
       24. SHORT DATE
    ===================================================== */

    function formatShortDate(
        date
    ) {

        if (!date) {

            return "Recently";
        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "Recently";
        }


        return parsedDate.toLocaleDateString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }



    renderTransactions();



    /* =====================================================
       25. SEARCH
    ===================================================== */

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                const query =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                if (!query) {

                    renderTransactions();

                    return;
                }


                const transactions =
                    Array.isArray(
                        currentUser.transactions
                    )
                        ? currentUser.transactions
                        : [];


                const filtered =
                    transactions.filter(
                        transaction => {

                            const searchableText =
                                [

                                    transaction.description,

                                    transaction.category,

                                    transaction.account,

                                    transaction.bank,

                                    transaction.paymentMethod,

                                    transaction.type

                                ]
                                    .filter(Boolean)
                                    .join(" ")
                                    .toLowerCase();


                            return searchableText.includes(
                                query
                            );
                        }
                    );


                /*
                    Temporarily render search results.
                */

                profileTransactions.innerHTML =
                    "";


                if (
                    filtered.length === 0
                ) {

                    if (
                        emptyProfileTransactions
                    ) {

                        emptyProfileTransactions.textContent =
                            "No matching transactions found.";

                        emptyProfileTransactions.classList.remove(
                            "hidden"
                        );
                    }


                    return;
                }


                if (
                    emptyProfileTransactions
                ) {

                    emptyProfileTransactions.classList.add(
                        "hidden"
                    );
                }


                filtered
                    .slice(0, 5)
                    .forEach(
                        transaction => {

                            renderSingleSearchTransaction(
                                transaction
                            );
                        }
                    );
            }
        );
    }



    /* =====================================================
       26. SEARCH TRANSACTION ROW
    ===================================================== */

    function renderSingleSearchTransaction(
        transaction
    ) {

        const isIncome =
            transaction.type ===
            "income";


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "flex items-center justify-between py-4";


        const left =
            document.createElement(
                "div"
            );


        left.className =
            "flex min-w-0 items-center gap-3";


        const icon =
            document.createElement(
                "div"
            );


        icon.className =
            isIncome
                ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d8f6ed] text-[#33B786]"
                : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500";


        icon.innerHTML =
            isIncome
                ? '<i class="fa-solid fa-arrow-down"></i>'
                : '<i class="fa-solid fa-arrow-up"></i>';


        const details =
            document.createElement(
                "div"
            );


        details.className =
            "min-w-0";


        const description =
            document.createElement(
                "p"
            );


        description.className =
            "truncate text-sm font-semibold text-gray-800";


        description.textContent =
            transaction.description ||
            transaction.category ||
            "Transaction";


        const date =
            document.createElement(
                "p"
            );


        date.className =
            "mt-1 text-xs text-gray-400";


        date.textContent =
            formatShortDate(
                transaction.date
            );


        details.appendChild(
            description
        );


        details.appendChild(
            date
        );


        left.appendChild(
            icon
        );


        left.appendChild(
            details
        );


        const amount =
            document.createElement(
                "p"
            );


        amount.className =
            isIncome
                ? "ml-3 shrink-0 text-sm font-semibold text-[#33B786]"
                : "ml-3 shrink-0 text-sm font-semibold text-red-500";


        amount.textContent =
            isIncome
                ? "+" +
                  formatMoney(
                      transaction.amount
                  )
                : "-" +
                  formatMoney(
                      transaction.amount
                  );


        row.appendChild(
            left
        );


        row.appendChild(
            amount
        );


        profileTransactions.appendChild(
            row
        );
    }



    /* =====================================================
       27. MOBILE SIDEBAR
    ===================================================== */

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const sidebarOverlay =
        document.getElementById(
            "sidebarOverlay"
        );


    const menuButton =
        document.getElementById(
            "menuButton"
        );



    function openSidebar() {

        if (!sidebar) {
            return;
        }


        sidebar.classList.remove(
            "-translate-x-full"
        );


        sidebar.classList.add(
            "translate-x-0"
        );


        if (sidebarOverlay) {

            sidebarOverlay.classList.remove(
                "hidden"
            );
        }


        document.body.classList.add(
            "overflow-hidden"
        );
    }



    function closeSidebar() {

        if (!sidebar) {
            return;
        }


        sidebar.classList.remove(
            "translate-x-0"
        );


        sidebar.classList.add(
            "-translate-x-full"
        );


        if (sidebarOverlay) {

            sidebarOverlay.classList.add(
                "hidden"
            );
        }


        document.body.classList.remove(
            "overflow-hidden"
        );
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



    /* =====================================================
       28. CLOSE SIDEBAR WHEN NAV LINK CLICKED
    ===================================================== */

    document.querySelectorAll(
        ".dashboard-nav"
    ).forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    closeSidebar();
                }
            );
        }
    );



    /* =====================================================
       29. LOGOUT MODAL
    ===================================================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    const logoutModal =
        document.getElementById(
            "logoutModal"
        );


    const cancelLogout =
        document.getElementById(
            "cancelLogout"
        );


    const confirmLogout =
        document.getElementById(
            "confirmLogout"
        );



    /* OPEN */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            () => {

                closeSidebar();

                openModal(
                    logoutModal
                );
            }
        );
    }



    /* CANCEL */

    if (cancelLogout) {

        cancelLogout.addEventListener(
            "click",
            () => {

                closeModal(
                    logoutModal
                );
            }
        );
    }



    /* CONFIRM */

    if (confirmLogout) {

        confirmLogout.addEventListener(
            "click",
            () => {

                /*
                    Do NOT remove reenUsers.

                    That contains the registered
                    user's account.

                    Only remove login/session data.
                */

                localStorage.removeItem(
                    "currentUser"
                );


                sessionStorage.removeItem(
                    "currentUser"
                );


                window.location.href =
                    "./register.html";
            }
        );
    }



    /* =====================================================
       30. RESET PASSWORD MODAL
    ===================================================== */

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
        document.getElementById(
            "newPassword"
        );


    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        );


    const passwordMessage =
        document.getElementById(
            "passwordMessage"
        );



    /* =====================================================
       31. OPEN RESET PASSWORD
    ===================================================== */

    if (resetPasswordButton) {

        resetPasswordButton.addEventListener(
            "click",
            () => {

                if (newPassword) {

                    newPassword.value =
                        "";
                }


                if (confirmPassword) {

                    confirmPassword.value =
                        "";
                }


                if (passwordMessage) {

                    passwordMessage.textContent =
                        "";

                    passwordMessage.classList.add(
                        "hidden"
                    );

                    passwordMessage.classList.remove(
                        "bg-red-50",
                        "text-red-600",
                        "bg-green-50",
                        "text-green-600"
                    );
                }


                openModal(
                    resetPasswordModal
                );
            }
        );
    }



    /* =====================================================
       32. CANCEL RESET PASSWORD
    ===================================================== */

    if (cancelResetPassword) {

        cancelResetPassword.addEventListener(
            "click",
            () => {

                closeModal(
                    resetPasswordModal
                );
            }
        );
    }



    /* =====================================================
       33. PASSWORD MESSAGE
    ===================================================== */

    function showPasswordMessage(
        message,
        type
    ) {

        if (!passwordMessage) {

            return;
        }


        passwordMessage.textContent =
            message;


        passwordMessage.classList.remove(
            "hidden",
            "bg-red-50",
            "text-red-600",
            "bg-green-50",
            "text-green-600"
        );


        if (type === "error") {

            passwordMessage.classList.add(
                "bg-red-50",
                "text-red-600"
            );

        } else {

            passwordMessage.classList.add(
                "bg-green-50",
                "text-green-600"
            );
        }
    }



    /* =====================================================
       34. TOGGLE NEW PASSWORD
    ===================================================== */

    const toggleNewPassword =
        document.getElementById(
            "toggleNewPassword"
        );


    if (toggleNewPassword) {

        toggleNewPassword.addEventListener(
            "click",
            () => {

                if (!newPassword) {
                    return;
                }


                const icon =
                    toggleNewPassword.querySelector(
                        "i"
                    );


                if (
                    newPassword.type ===
                    "password"
                ) {

                    newPassword.type =
                        "text";


                    if (icon) {

                        icon.className =
                            "fa-solid fa-eye-slash";
                    }

                } else {

                    newPassword.type =
                        "password";


                    if (icon) {

                        icon.className =
                            "fa-solid fa-eye";
                    }
                }
            }
        );
    }



    /* =====================================================
       35. TOGGLE CONFIRM PASSWORD
    ===================================================== */

    const toggleConfirmPassword =
        document.getElementById(
            "toggleConfirmPassword"
        );


    if (toggleConfirmPassword) {

        toggleConfirmPassword.addEventListener(
            "click",
            () => {

                if (!confirmPassword) {
                    return;
                }


                const icon =
                    toggleConfirmPassword.querySelector(
                        "i"
                    );


                if (
                    confirmPassword.type ===
                    "password"
                ) {

                    confirmPassword.type =
                        "text";


                    if (icon) {

                        icon.className =
                            "fa-solid fa-eye-slash";
                    }

                } else {

                    confirmPassword.type =
                        "password";


                    if (icon) {

                        icon.className =
                            "fa-solid fa-eye";
                    }
                }
            }
        );
    }



    /* =====================================================
       36. SAVE NEW PASSWORD
    ===================================================== */

    if (saveNewPassword) {

        saveNewPassword.addEventListener(
            "click",
            () => {

                if (
                    !newPassword ||
                    !confirmPassword
                ) {

                    return;
                }


                const password =
                    newPassword.value;


                const confirmation =
                    confirmPassword.value;



                /* -----------------------------------------
                   EMPTY
                ----------------------------------------- */

                if (!password) {

                    showPasswordMessage(
                        "Please enter a new password.",
                        "error"
                    );

                    return;
                }



                /* -----------------------------------------
                   MINIMUM LENGTH
                ----------------------------------------- */

                if (
                    password.length < 8
                ) {

                    showPasswordMessage(
                        "Password must be at least 8 characters.",
                        "error"
                    );

                    return;
                }



                /* -----------------------------------------
                   MATCH
                ----------------------------------------- */

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



                /* -----------------------------------------
                   PREVENT SAME PASSWORD
                ----------------------------------------- */

                if (
                    currentUser.password ===
                    password
                ) {

                    showPasswordMessage(
                        "Your new password must be different from your current password.",
                        "error"
                    );

                    return;
                }



                /* -----------------------------------------
                   UPDATE
                ----------------------------------------- */

                currentUser.password =
                    password;


                saveUser();



                showPasswordMessage(
                    "Password updated successfully.",
                    "success"
                );


                /*
                    Close modal after a short delay.
                */

                setTimeout(
                    () => {

                        closeModal(
                            resetPasswordModal
                        );

                    },
                    1200
                );
            }
        );
    }



    /* =====================================================
       37. CLOSE MODALS BY CLICKING OUTSIDE
    ===================================================== */

    document.querySelectorAll(
        '[id$="Modal"]'
    ).forEach(
        modal => {

            modal.addEventListener(
                "click",
                event => {

                    /*
                        Close only if the user clicks
                        the overlay itself.
                    */

                    if (
                        event.target ===
                        modal
                    ) {

                        closeModal(
                            modal
                        );
                    }
                }
            );
        }
    );



    /* =====================================================
       38. ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {

                return;
            }


            closeModal(
                logoutModal
            );


            closeModal(
                resetPasswordModal
            );


            closeSidebar();
        }
    );



    /* =====================================================
       39. INITIAL SAVE
    ===================================================== */

    saveUser();



    /* =====================================================
       40. DEBUG
    ===================================================== */

    console.log(
        "===================================="
    );

    console.log(
        "REEN BANK PROFILE PAGE"
    );

    console.log(
        "Current User:",
        currentUser
    );

    console.log(
        "Balance:",
        currentUser.balance
    );

    console.log(
        "Transactions:",
        currentUser.transactions
    );

    console.log(
        "===================================="
    );

});
