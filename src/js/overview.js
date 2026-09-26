// =========================================================
// REEN BANK - OVERVIEW DASHBOARD
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("OVERVIEW.JS IS LOADED!");


    // =====================================================
    // STORAGE KEYS
    // =====================================================

    const USERS_KEY = "reenUsers";
    const CURRENT_USER_KEY = "currentUser";


    // =====================================================
    // GET USERS
    // =====================================================

    let users = [];

    try {

        users =
            JSON.parse(
                localStorage.getItem(USERS_KEY)
            ) || [];

    } catch (error) {

        console.error(
            "Could not read users from localStorage:",
            error
        );

        users = [];

    }


    if (!Array.isArray(users)) {

        users = [];

    }


    // =====================================================
    // GET CURRENT LOGIN SESSION
    // =====================================================

    let currentUserSession = null;

    try {

        currentUserSession =
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

    }


    // =====================================================
    // CHECK LOGIN
    // =====================================================

    if (!currentUserSession) {

        console.log(
            "No logged-in user found."
        );

        window.location.href =
            "./login.html";

        return;

    }


    // =====================================================
    // FIND USER IN reenUsers
    // =====================================================

    let userIndex = -1;


    if (currentUserSession.email) {

        userIndex =
            users.findIndex(function (user) {

                return (
                    user &&
                    typeof user.email === "string" &&
                    user.email.toLowerCase() ===
                    currentUserSession.email.toLowerCase()
                );

            });

    }


    // =====================================================
    // USER NOT FOUND
    // =====================================================

    if (userIndex === -1) {

        console.error(
            "Logged-in user could not be found in reenUsers."
        );


        sessionStorage.removeItem(
            CURRENT_USER_KEY
        );


        window.location.href =
            "./login.html";


        return;

    }


    // =====================================================
    // CURRENT USER
    // =====================================================

    let currentUser =
        users[userIndex];


    console.log(
        "CURRENT USER:",
        currentUser
    );


    // =====================================================
    // INITIALIZE USER DATA
    // =====================================================

    if (typeof currentUser.balance !== "number") {

        currentUser.balance = 0;

    }


    if (typeof currentUser.income !== "number") {

        currentUser.income = 0;

    }


    if (typeof currentUser.expense !== "number") {

        currentUser.expense = 0;

    }


    if (!Array.isArray(currentUser.transactions)) {

        currentUser.transactions = [];

    }


    if (
        typeof currentUser.schoolSavings !==
        "number"
    ) {

        currentUser.schoolSavings = 0;

    }


    if (
        typeof currentUser.holidayBalance !==
        "number"
    ) {

        currentUser.holidayBalance = 0;

    }


    // =====================================================
    // ACCOUNT NUMBER
    // =====================================================

    if (!currentUser.accountNumber) {

        currentUser.accountNumber =
            generateAccountNumber(
                currentUser.email,
                users
            );

    }


    // =====================================================
    // SAVE USER
    // =====================================================

    function saveUsers() {

        users[userIndex] =
            currentUser;

        localStorage.setItem(
            USERS_KEY,
            JSON.stringify(users)
        );

    }


    saveUsers();


    // =====================================================
    // UPDATE CURRENT USER SESSION
    // =====================================================

    sessionStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify({

            name: currentUser.name,

            email: currentUser.email,

            accountNumber:
                currentUser.accountNumber

        })
    );


    // =====================================================
    // ELEMENTS
    // =====================================================

    const headerUserName =
        document.getElementById(
            "headerUserName"
        );


    const accountNumber =
        document.getElementById(
            "accountNumber"
        );


    const currentBalance =
        document.getElementById(
            "currentBalance"
        );


    const incomeValue =
        document.getElementById(
            "incomeValue"
        );


    const expenseValue =
        document.getElementById(
            "expenseValue"
        );


    const mainAccountBalance =
        document.getElementById(
            "mainAccountBalance"
        );


    const schoolSavingsBalance =
        document.getElementById(
            "schoolSavingsBalance"
        );


    const holidayBalance =
        document.getElementById(
            "holidayBalance"
        );


    const statisticsIncome =
        document.getElementById(
            "statisticsIncome"
        );


    const statisticsExpense =
        document.getElementById(
            "statisticsExpense"
        );


    const incomeBar =
        document.getElementById(
            "incomeBar"
        );


    const expenseBar =
        document.getElementById(
            "expenseBar"
        );


    const transactionList =
        document.getElementById(
            "transactionList"
        );


    const emptyTransactions =
        document.getElementById(
            "emptyTransactions"
        );


    // =====================================================
    // PROFILE AVATAR
    // =====================================================

    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );


    // =====================================================
    // FORMAT MONEY
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
    // FORMAT ACCOUNT NUMBER
    // =====================================================

    function formatAccountNumber(number) {

        if (!number) {

            return "0000000000";

        }


        return String(number);

    }


    // =====================================================
    // GET SECOND / LAST NAME
    // =====================================================

    function getSecondName(fullName) {

        if (!fullName) {

            return "User";

        }


        const names =
            fullName
                .trim()
                .split(/\s+/);


        // If only one name was registered

        if (names.length === 1) {

            return names[0];

        }


        // Use the last name

        return names[names.length - 1];

    }


    // =====================================================
    // GET USER INITIALS
    // =====================================================

    function getUserInitials(name) {

        if (!name) {

            return "U";

        }


        const names =
            name
                .trim()
                .split(/\s+/);


        if (names.length === 1) {

            return names[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            names[0].charAt(0) +
            names[names.length - 1].charAt(0)
        ).toUpperCase();

    }


    // =====================================================
    // DISPLAY USER INFORMATION
    // =====================================================

    function updateUserInformation() {

        const secondName =
            getSecondName(
                currentUser.name
            );


        // Only second / last name
        // appears in dashboard header

        if (headerUserName) {

            headerUserName.textContent =
                secondName;

        }


        if (accountNumber) {

            accountNumber.textContent =
                formatAccountNumber(
                    currentUser.accountNumber
                );

        }


        updateProfileAvatar();

    }


    // =====================================================
    // UPDATE PROFILE AVATAR
    // =====================================================

    function updateProfileAvatar() {

        if (!profileAvatar) {

            return;

        }


        // =================================================
        // USER HAS A PROFILE IMAGE
        // =================================================

        if (currentUser.profileImage) {

            profileAvatar.innerHTML = "";


            const image =
                document.createElement(
                    "img"
                );


            image.src =
                currentUser.profileImage;


            image.alt =
                "Profile picture";


            image.className =
                "h-full w-full object-cover";


            profileAvatar.appendChild(
                image
            );


        } else {

            // =================================================
            // NO PROFILE IMAGE - SHOW INITIALS
            // =================================================

            profileAvatar.innerHTML = "";


            const initials =
                getUserInitials(
                    currentUser.name
                );


            profileAvatar.textContent =
                initials;

        }

    }


    // =====================================================
    // CREATE PROFILE IMAGE INPUT
    // =====================================================

    let profileImageInput =
        document.getElementById(
            "profileImageInput"
        );


    /*
     * If the HTML does not already contain
     * profileImageInput, create it automatically.
     *
     * This means you do not have to change
     * your overview.html just to make the
     * profile picture work.
     */

    if (!profileImageInput) {

        profileImageInput =
            document.createElement(
                "input"
            );


        profileImageInput.type =
            "file";


        profileImageInput.id =
            "profileImageInput";


        profileImageInput.accept =
            "image/*";


        profileImageInput.style.display =
            "none";


        document.body.appendChild(
            profileImageInput
        );

    }


    // =====================================================
    // CHANGE PROFILE IMAGE
    // =====================================================

    if (profileAvatar) {

        profileAvatar.style.cursor =
            "pointer";


        profileAvatar.title =
            "Change profile picture";


        profileAvatar.addEventListener(
            "click",
            function () {

                profileImageInput.click();

            }
        );

    }


    // =====================================================
    // PROFILE IMAGE UPLOAD
    // =====================================================

    if (profileImageInput) {

        profileImageInput.addEventListener(
            "change",
            function (event) {

                const file =
                    event.target.files[0];


                if (!file) {

                    return;

                }


                // =================================================
                // CHECK FILE TYPE
                // =================================================

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    alert(
                        "Please select a valid image."
                    );

                    profileImageInput.value =
                        "";

                    return;

                }


                // =================================================
                // CHECK FILE SIZE
                // =================================================

                /*
                 * Keep images reasonably small because
                 * the image is stored in localStorage.
                 */

                const maxSize =
                    2 * 1024 * 1024;


                if (file.size > maxSize) {

                    alert(
                        "Please choose an image smaller than 2MB."
                    );

                    profileImageInput.value =
                        "";

                    return;

                }


                // =================================================
                // READ IMAGE
                // =================================================

                const reader =
                    new FileReader();


                reader.onload =
                    function (e) {

                        currentUser.profileImage =
                            e.target.result;


                        // Save to reenUsers

                        saveUsers();


                        // Immediately update dashboard

                        updateProfileAvatar();


                        /*
                         * The Profile page reads the same
                         * currentUser.profileImage from
                         * localStorage, so the image will
                         * automatically appear there too.
                         */

                        console.log(
                            "Profile picture updated successfully."
                        );

                    };


                reader.onerror =
                    function () {

                        alert(
                            "Could not load the selected image."
                        );

                    };


                reader.readAsDataURL(
                    file
                );

            }
        );

    }


    // =====================================================
    // UPDATE BALANCES
    // =====================================================

    function updateBalances() {

        const balance =
            Number(
                currentUser.balance
            ) || 0;


        const income =
            Number(
                currentUser.income
            ) || 0;


        const expense =
            Number(
                currentUser.expense
            ) || 0;


        const schoolSavings =
            Number(
                currentUser.schoolSavings
            ) || 0;


        const holiday =
            Number(
                currentUser.holidayBalance
            ) || 0;


        // Current balance

        if (currentBalance) {

            currentBalance.textContent =
                formatMoney(
                    balance
                );

        }


        // Income

        if (incomeValue) {

            incomeValue.textContent =
                formatMoney(
                    income
                );

        }


        // Expense

        if (expenseValue) {

            expenseValue.textContent =
                formatMoney(
                    expense
                );

        }


        // Main account

        if (mainAccountBalance) {

            mainAccountBalance.textContent =
                formatMoney(
                    balance
                );

        }


        // School savings

        if (schoolSavingsBalance) {

            schoolSavingsBalance.textContent =
                formatMoney(
                    schoolSavings
                );

        }


        // Holiday

        if (holidayBalance) {

            holidayBalance.textContent =
                formatMoney(
                    holiday
                );

        }


        // Statistics

        if (statisticsIncome) {

            statisticsIncome.textContent =
                formatMoney(
                    income
                );

        }


        if (statisticsExpense) {

            statisticsExpense.textContent =
                formatMoney(
                    expense
                );

        }


        // =================================================
        // STATISTICS BARS
        // =================================================

        const total =
            income + expense;


        if (total > 0) {

            const incomePercentage =
                (income / total) * 100;


            const expensePercentage =
                (expense / total) * 100;


            if (incomeBar) {

                incomeBar.style.width =
                    incomePercentage + "%";

            }


            if (expenseBar) {

                expenseBar.style.width =
                    expensePercentage + "%";

            }

        } else {

            if (incomeBar) {

                incomeBar.style.width =
                    "0%";

            }


            if (expenseBar) {

                expenseBar.style.width =
                    "0%";

            }

        }

    }


    // =====================================================
    // DISPLAY TRANSACTIONS
    // =====================================================

    function updateTransactions() {

        if (!transactionList) {

            return;

        }


        transactionList.innerHTML =
            "";


        const transactions =
            Array.isArray(
                currentUser.transactions
            )
                ? currentUser.transactions
                : [];


        // No transactions

        if (
            transactions.length ===
            0
        ) {

            if (emptyTransactions) {

                emptyTransactions.classList.remove(
                    "hidden"
                );

            }

            return;

        }


        // Hide empty message

        if (emptyTransactions) {

            emptyTransactions.classList.add(
                "hidden"
            );

        }


        // Show newest first

        const sortedTransactions =
            [...transactions].reverse();


        sortedTransactions.forEach(
            function (transaction) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "flex items-center justify-between gap-4 border-b border-gray-100 py-4";


                const left =
                    document.createElement(
                        "div"
                    );


                left.className =
                    "flex items-center gap-3 min-w-0";


                const icon =
                    document.createElement(
                        "div"
                    );


                icon.className =
                    "w-10 h-10 rounded-full flex items-center justify-center";


                const transactionType =
                    transaction.type ||
                    "deposit";


                if (
                    transactionType ===
                    "withdrawal"
                ) {

                    icon.classList.add(
                        "bg-red-100",
                        "text-red-500"
                    );


                    icon.innerHTML =
                        '<i class="fa-solid fa-arrow-up"></i>';

                } else {

                    icon.classList.add(
                        "bg-green-100",
                        "text-[#20b985]"
                    );


                    icon.innerHTML =
                        '<i class="fa-solid fa-arrow-down"></i>';

                }


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
                    "font-medium text-sm truncate";


                description.textContent =
                    transaction.description ||
                    (
                        transactionType ===
                        "withdrawal"
                            ? "Withdrawal"
                            : "Deposit"
                    );


                const date =
                    document.createElement(
                        "p"
                    );


                date.className =
                    "text-xs text-gray-400 mt-1";


                date.textContent =
                    formatTransactionDate(
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


                // Amount

                const amount =
                    document.createElement(
                        "p"
                    );


                amount.className =
                    "text-sm font-semibold whitespace-nowrap";


                const transactionAmount =
                    Number(
                        transaction.amount
                    ) || 0;


                if (
                    transactionType ===
                    "withdrawal"
                ) {

                    amount.classList.add(
                        "text-red-500"
                    );


                    amount.textContent =
                        "- " +
                        formatMoney(
                            transactionAmount
                        );

                } else {

                    amount.classList.add(
                        "text-[#20b985]"
                    );


                    amount.textContent =
                        "+ " +
                        formatMoney(
                            transactionAmount
                        );

                }


                item.appendChild(
                    left
                );


                item.appendChild(
                    amount
                );


                transactionList.appendChild(
                    item
                );

            }
        );

    }


    // =====================================================
    // TRANSACTION DATE
    // =====================================================

    function formatTransactionDate(date) {

        if (!date) {

            return "Recent";

        }


        const transactionDate =
            new Date(date);


        if (
            Number.isNaN(
                transactionDate.getTime()
            )
        ) {

            return String(date);

        }


        return transactionDate.toLocaleDateString(
            "en-NG",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    }


    // =====================================================
    // GENERATE ACCOUNT NUMBER
    // =====================================================

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
            number.replace(
                /\D/g,
                ""
            );


        number =
            number.substring(
                0,
                10
            );


        while (
            number.length < 10
        ) {

            number +=
                Math.floor(
                    Math.random() * 10
                );

        }


        let accountNumber =
            number;


        let exists =
            allUsers.some(
                function (user) {

                    return (
                        user &&
                        user.accountNumber ===
                        accountNumber
                    );

                }
            );


        while (exists) {

            accountNumber = "";


            for (
                let i = 0;
                i < 10;
                i++
            ) {

                accountNumber +=
                    Math.floor(
                        Math.random() * 10
                    );

            }


            exists =
                allUsers.some(
                    function (user) {

                        return (
                            user &&
                            user.accountNumber ===
                            accountNumber
                        );

                    }
                );

        }


        return accountNumber;

    }


    // =====================================================
    // BALANCE VISIBILITY
    // =====================================================

    const balanceToggle =
        document.getElementById(
            "balanceToggle"
        );


    let balanceVisible = true;


    if (balanceToggle) {

        balanceToggle.addEventListener(
            "click",
            function () {

                balanceVisible =
                    !balanceVisible;


                const balanceElements =
                    document.querySelectorAll(
                        ".balance-value, .account-balance"
                    );


                balanceElements.forEach(
                    function (element) {

                        if (balanceVisible) {

                            element.classList.remove(
                                "blur-sm"
                            );

                        } else {

                            element.classList.add(
                                "blur-sm"
                            );

                        }

                    }
                );


                const icon =
                    balanceToggle.querySelector(
                        "i"
                    );


                if (icon) {

                    if (balanceVisible) {

                        icon.className =
                            "fa-regular fa-eye-slash";

                    } else {

                        icon.className =
                            "fa-regular fa-eye";

                    }

                }

            }
        );

    }


    // =====================================================
    // MOBILE SIDEBAR
    // =====================================================

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const menuButton =
        document.getElementById(
            "menuButton"
        );


    const sidebarOverlay =
        document.getElementById(
            "sidebarOverlay"
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

    }


    function closeSidebar() {

        if (!sidebar) {

            return;

        }


        sidebar.classList.add(
            "-translate-x-full"
        );


        sidebar.classList.remove(
            "translate-x-0"
        );


        if (sidebarOverlay) {

            sidebarOverlay.classList.add(
                "hidden"
            );

        }

    }


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            function () {

                openSidebar();

            }
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            function () {

                closeSidebar();

            }
        );

    }


    // =====================================================
    // CLOSE MOBILE SIDEBAR WHEN NAV ITEM IS CLICKED
    // =====================================================

    const navigationLinks =
        document.querySelectorAll(
            ".dashboard-nav"
        );


    navigationLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    if (
                        window.innerWidth <
                        1024
                    ) {

                        closeSidebar();

                    }

                }
            );

        }
    );


    // =====================================================
    // SEARCH
    // =====================================================

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                const searchTerm =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                const transactionItems =
                    transactionList
                        ? transactionList.children
                        : [];


                Array.from(
                    transactionItems
                ).forEach(
                    function (item) {

                        const text =
                            item.textContent
                                .toLowerCase();


                        if (
                            !searchTerm ||
                            text.includes(
                                searchTerm
                            )
                        ) {

                            item.classList.remove(
                                "hidden"
                            );

                        } else {

                            item.classList.add(
                                "hidden"
                            );

                        }

                    }
                );

            }
        );

    }


    // =====================================================
    // DATE FILTER
    // =====================================================

    const dateFilter =
        document.getElementById(
            "dateFilter"
        );


    if (dateFilter) {

        dateFilter.addEventListener(
            "change",
            function () {

                console.log(
                    "Selected date range:",
                    dateFilter.value
                );

            }
        );

    }


    // =====================================================
    // STATISTICS FILTER
    // =====================================================

    const statisticsFilter =
        document.getElementById(
            "statisticsFilter"
        );


    if (statisticsFilter) {

        statisticsFilter.addEventListener(
            "change",
            function () {

                console.log(
                    "Statistics filter:",
                    statisticsFilter.value
                );

            }
        );

    }


    // =====================================================
    // VIEW TRANSACTIONS
    // =====================================================

    const viewTransactions =
        document.getElementById(
            "viewTransactions"
        );


    if (viewTransactions) {

        viewTransactions.addEventListener(
            "click",
            function () {

                const transactionsSection =
                    document.getElementById(
                        "transactions"
                    );


                if (transactionsSection) {

                    transactionsSection.scrollIntoView(
                        {
                            behavior: "smooth"
                        }
                    );

                }

            }
        );

    }


    // =====================================================
    // ADD ACCOUNT BUTTON
    // =====================================================

    const addAccountButton =
        document.getElementById(
            "addAccountButton"
        );


    if (addAccountButton) {

        addAccountButton.addEventListener(
            "click",
            function () {

                alert(
                    "Additional account features will be available soon."
                );

            }
        );

    }


    // =====================================================
    // LOGOUT MODAL
    // =====================================================

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    const logoutModal =
        document.getElementById(
            "logoutModal"
        );


    const cancelLogoutButton =
        document.getElementById(
            "cancelLogout"
        );


    const confirmLogoutButton =
        document.getElementById(
            "confirmLogout"
        );


    // Open logout modal

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                if (!logoutModal) {

                    console.error(
                        "logoutModal was not found."
                    );

                    return;

                }


                logoutModal.classList.remove(
                    "hidden"
                );


                logoutModal.classList.add(
                    "flex"
                );

            }
        );

    }


    // Cancel logout

    if (cancelLogoutButton) {

        cancelLogoutButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                if (logoutModal) {

                    logoutModal.classList.add(
                        "hidden"
                    );


                    logoutModal.classList.remove(
                        "flex"
                    );

                }

            }
        );

    }


    // Confirm logout

    if (confirmLogoutButton) {

        confirmLogoutButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                console.log(
                    "Logging out..."
                );


                // Remove login session only

                sessionStorage.removeItem(
                    CURRENT_USER_KEY
                );


                // Do NOT remove reenUsers.

                window.location.href =
                    "./login.html";

            }
        );

    }


    // =====================================================
    // CLICK OUTSIDE LOGOUT MODAL
    // =====================================================

    if (logoutModal) {

        logoutModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    logoutModal
                ) {

                    logoutModal.classList.add(
                        "hidden"
                    );


                    logoutModal.classList.remove(
                        "flex"
                    );

                }

            }
        );

    }


    // =====================================================
    // ESC KEY
    // =====================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                if (
                    logoutModal &&
                    !logoutModal.classList.contains(
                        "hidden"
                    )
                ) {

                    logoutModal.classList.add(
                        "hidden"
                    );


                    logoutModal.classList.remove(
                        "flex"
                    );

                }

            }

        }
    );


    // =====================================================
    // INITIAL DASHBOARD LOAD
    // =====================================================

    updateUserInformation();

    updateBalances();

    updateTransactions();


    // =====================================================
    // DEBUG
    // =====================================================

    console.log(
        "Dashboard initialized successfully."
    );


    console.log(
        "Full Name:",
        currentUser.name
    );


    console.log(
        "Dashboard Display Name:",
        getSecondName(
            currentUser.name
        )
    );


    console.log(
        "Email:",
        currentUser.email
    );


    console.log(
        "Account Number:",
        currentUser.accountNumber
    );


    console.log(
        "Balance:",
        currentUser.balance
    );


    console.log(
        "Profile Image:",
        currentUser.profileImage
            ? "Profile image exists"
            : "No profile image"
    );

});