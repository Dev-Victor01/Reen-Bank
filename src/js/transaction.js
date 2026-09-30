/* =========================================================
   REEN BANK — COMPLETE TRANSACTIONS PAGE JAVASCRIPT
   ---------------------------------------------------------
   DATA:
   - localStorage -> reenUsers
   - sessionStorage -> currentUser
   - localStorage -> currentUser fallback

   TRANSACTIONS:
   - Overview transactions
   - Accounts transactions
   - Main Account
   - School Savings
   - Holiday Plan
   - Custom Accounts

   DESKTOP TABLE:
   Name | Payment Method | Date | Amount | Status

   MOBILE:
   - Five-column structure is preserved
   - Table becomes horizontally scrollable
   - Header and rows remain aligned
========================================================= */


document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. STORAGE KEYS
    ===================================================== */

    const USERS_KEY = "reenUsers";
    const SESSION_KEY = "currentUser";


    let users = [];
    let currentUser = null;


    /* =====================================================
       2. DOM REFERENCES
    ===================================================== */

    const sidebar =
        document.getElementById("sidebar");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");


    const overviewNav =
        document.getElementById("overviewNav");

    const accountsNav =
        document.getElementById("accountsNav");

    const transactionsNav =
        document.getElementById("transactionsNav");

    const profileNav =
        document.getElementById("profileNav");


    const logoutButton =
        document.getElementById("logoutButton");


    const headerUserName =
        document.getElementById("headerUserName");

    const headerAccountNumber =
        document.getElementById("headerAccountNumber");


    const headerProfileButton =
        document.getElementById("headerProfileButton");

    const headerProfileImage =
        document.getElementById("headerProfileImage");

    const headerProfileInitials =
        document.getElementById("headerProfileInitials");


    const searchButton =
        document.getElementById("searchButton");


    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    const notificationButton =
        document.getElementById("notificationButton");

    const notificationDot =
        document.getElementById("notificationDot");

    const notificationDropdown =
        document.getElementById("notificationDropdown");

    const notificationUnreadCount =
        document.getElementById("notificationUnreadCount");

    const markAllNotificationsRead =
        document.getElementById("markAllNotificationsRead");

    const notificationList =
        document.getElementById("notificationList");


    /* =====================================================
       BALANCES
    ===================================================== */

    const mainAccountBalance =
        document.getElementById("mainAccountBalance");

    const schoolAccountBalance =
        document.getElementById("schoolAccountBalance");

    const holidayAccountBalance =
        document.getElementById("holidayAccountBalance");


    const mainBalanceToggle =
        document.getElementById("mainBalanceToggle");

    const schoolBalanceToggle =
        document.getElementById("schoolBalanceToggle");

    const holidayBalanceToggle =
        document.getElementById("holidayBalanceToggle");


    /* =====================================================
       FILTERS
    ===================================================== */

    const transactionSearch =
        document.getElementById("transactionSearch");

    const transactionAccountFilter =
        document.getElementById("transactionAccountFilter");

    const transactionTypeFilter =
        document.getElementById("transactionTypeFilter");

    const transactionStatusFilter =
        document.getElementById("transactionStatusFilter");

    const transactionDateFilter =
        document.getElementById("transactionDateFilter");

    const clearTransactionFilters =
        document.getElementById("clearTransactionFilters");


    /* =====================================================
       TRANSACTION AREA
    ===================================================== */

    const transactionList =
        document.getElementById("transactionList");

    const emptyTransactions =
        document.getElementById("emptyTransactions");

    const transactionResultCount =
        document.getElementById("transactionResultCount");


    /* =====================================================
       TRANSACTION MODAL
    ===================================================== */

    const transactionDetailsModal =
        document.getElementById("transactionDetailsModal");

    const transactionDetailsPanel =
        document.getElementById("transactionDetailsPanel");

    const closeTransactionDetails =
        document.getElementById("closeTransactionDetails");

    const closeTransactionDetailsBottom =
        document.getElementById("closeTransactionDetailsBottom");

    const transactionDetailsContent =
        document.getElementById("transactionDetailsContent");


    /* =====================================================
       LOGOUT MODAL
    ===================================================== */

    const logoutModal =
        document.getElementById("logoutModal");

    const cancelLogoutBtn =
        document.getElementById("cancelLogoutBtn");

    const confirmLogoutBtn =
        document.getElementById("confirmLogoutBtn");


    /* =====================================================
       3. BALANCE VISIBILITY
    ===================================================== */

    let mainBalanceVisible = true;

    let schoolBalanceVisible = true;

    let holidayBalanceVisible = true;


    /* =====================================================
       4. FIVE COLUMN TABLE CONFIGURATION
       -----------------------------------------------------
       IMPORTANT:
       Header and rows MUST use this exact structure.
    ===================================================== */

    const TRANSACTION_TABLE_MIN_WIDTH = 1090;

    const TRANSACTION_GRID_COLUMNS =
        "minmax(330px,1.6fr) " +
        "minmax(220px,1.2fr) " +
        "minmax(200px,1fr) " +
        "minmax(220px,1fr) " +
        "120px";


    /* =====================================================
       5. STORAGE HELPERS
    ===================================================== */

    function getStoredUsers() {

        try {

            const stored =
                localStorage.getItem(
                    USERS_KEY
                );


            if (!stored) {
                return [];
            }


            const parsed =
                JSON.parse(stored);


            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.error(
                "Unable to read reenUsers:",
                error
            );


            return [];

        }

    }


    function getStoredCurrentUser() {

        let storedUser = null;


        /* ---------------------------------------------
           SESSION STORAGE
        --------------------------------------------- */

        try {

            const sessionData =
                sessionStorage.getItem(
                    SESSION_KEY
                );


            if (sessionData) {

                storedUser =
                    JSON.parse(
                        sessionData
                    );

            }

        } catch (error) {

            console.error(
                "Unable to read session currentUser:",
                error
            );

        }


        /* ---------------------------------------------
           LOCAL STORAGE FALLBACK
        --------------------------------------------- */

        if (!storedUser) {

            try {

                const localData =
                    localStorage.getItem(
                        SESSION_KEY
                    );


                if (localData) {

                    storedUser =
                        JSON.parse(
                            localData
                        );

                }

            } catch (error) {

                console.error(
                    "Unable to read local currentUser:",
                    error
                );

            }

        }


        return storedUser;

    }


    function findUserInUsers(storedUser) {

        if (
            !storedUser ||
            !Array.isArray(users)
        ) {

            return null;

        }


        const email =
            String(
                storedUser.email || ""
            )
                .trim()
                .toLowerCase();


        const accountNumber =
            String(
                storedUser.accountNumber || ""
            )
                .trim();


        let foundUser = null;


        /* ---------------------------------------------
           EMAIL
        --------------------------------------------- */

        if (email) {

            foundUser =
                users.find(user => {

                    return (
                        String(
                            user.email || ""
                        )
                            .trim()
                            .toLowerCase() ===
                        email
                    );

                });

        }


        /* ---------------------------------------------
           ACCOUNT NUMBER
        --------------------------------------------- */

        if (
            !foundUser &&
            accountNumber
        ) {

            foundUser =
                users.find(user => {

                    return (
                        String(
                            user.accountNumber || ""
                        )
                            .trim() ===
                        accountNumber
                    );

                });

        }


        return foundUser || null;

    }


    /* =====================================================
       6. LOAD CURRENT USER
    ===================================================== */

    function loadCurrentUser() {

        users =
            getStoredUsers();


        const storedUser =
            getStoredCurrentUser();


        if (!storedUser) {

            window.location.href =
                "./login.html";


            return false;

        }


        const fullUser =
            findUserInUsers(
                storedUser
            );


        if (fullUser) {

            currentUser = {
                ...storedUser,
                ...fullUser
            };

        } else {

            currentUser = {
                ...storedUser
            };

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


        if (
            !Array.isArray(
                currentUser.notifications
            )
        ) {

            currentUser.notifications = [];

        }


        return true;

    }


    if (!loadCurrentUser()) {
        return;
    }


    /* =====================================================
       7. SAVE CURRENT USER
    ===================================================== */

    function saveCurrentUser() {

        if (!currentUser) {
            return;
        }


        users =
            getStoredUsers();


        const currentEmail =
            String(
                currentUser.email || ""
            )
                .trim()
                .toLowerCase();


        const currentAccountNumber =
            String(
                currentUser.accountNumber || ""
            )
                .trim();


        const userIndex =
            users.findIndex(user => {

                const userEmail =
                    String(
                        user.email || ""
                    )
                        .trim()
                        .toLowerCase();


                const userAccountNumber =
                    String(
                        user.accountNumber || ""
                    )
                        .trim();


                if (
                    currentEmail &&
                    userEmail === currentEmail
                ) {

                    return true;

                }


                if (
                    currentAccountNumber &&
                    userAccountNumber ===
                        currentAccountNumber
                ) {

                    return true;

                }


                return false;

            });


        if (userIndex !== -1) {

            users[userIndex] = {
                ...users[userIndex],
                ...currentUser
            };


            localStorage.setItem(
                USERS_KEY,
                JSON.stringify(users)
            );

        }


        try {

            sessionStorage.setItem(
                SESSION_KEY,
                JSON.stringify(
                    currentUser
                )
            );

        } catch (error) {

            console.error(
                "Unable to save session currentUser:",
                error
            );

        }


        try {

            localStorage.setItem(
                SESSION_KEY,
                JSON.stringify(
                    currentUser
                )
            );

        } catch (error) {

            console.error(
                "Unable to save local currentUser:",
                error
            );

        }

    }


    /* =====================================================
       8. FORMATTERS
    ===================================================== */

    function formatCurrency(amount) {

        const number =
            Number(amount) || 0;


        return number.toLocaleString(
            "en-NG",
            {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    }


    function formatMoney(amount) {

        const number =
            Number(amount) || 0;


        return number.toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    }


    function escapeHTML(value) {

        const element =
            document.createElement("div");


        element.textContent =
            value ?? "";


        return element.innerHTML;

    }


    /* =====================================================
       9. DATE HELPERS
    ===================================================== */

    function getTransactionDate(transaction) {

        return (
            transaction?.createdAt ||
            transaction?.date ||
            transaction?.timestamp ||
            transaction?.time ||
            null
        );

    }


    function parseTransactionDate(transaction) {

        const rawDate =
            getTransactionDate(
                transaction
            );


        if (!rawDate) {
            return null;
        }


        const date =
            new Date(rawDate);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return null;

        }


        return date;

    }


    function formatTransactionDate(transaction) {

        const date =
            transaction?._date instanceof Date
                ? transaction._date
                : parseTransactionDate(
                    transaction
                );


        if (!date) {
            return "—";
        }


        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        const month =
            date.toLocaleString(
                "en-US",
                {
                    month: "short"
                }
            );


        const year =
            date.getFullYear();


        const hours =
            String(
                date.getHours()
            ).padStart(
                2,
                "0"
            );


        const minutes =
            String(
                date.getMinutes()
            ).padStart(
                2,
                "0"
            );


        return `${day}.${month}.${year} - ${hours}:${minutes}`;

    }


    function formatLongDate(transaction) {

        const date =
            transaction?._date instanceof Date
                ? transaction._date
                : parseTransactionDate(
                    transaction
                );


        if (!date) {
            return "—";
        }


        return date.toLocaleString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    /* =====================================================
       10. TRANSACTION TYPE
    ===================================================== */

    function getTransactionType(
        transaction
    ) {

        const direction =
            String(
                transaction?.direction || ""
            ).toLowerCase();


        if (
            direction === "debit" ||
            direction === "out" ||
            direction === "expense"
        ) {

            return "expense";

        }


        if (
            direction === "credit" ||
            direction === "in" ||
            direction === "income"
        ) {

            return "income";

        }


        const combined = [

            transaction?.type,
            transaction?.transactionType,
            transaction?.category

        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


        if (
            combined.includes("withdraw") ||
            combined.includes("expense") ||
            combined.includes("debit") ||
            combined.includes("payment") ||
            combined.includes("transfer out")
        ) {

            return "expense";

        }


        if (
            combined.includes("deposit") ||
            combined.includes("income") ||
            combined.includes("credit") ||
            combined.includes("fund") ||
            combined.includes("funding") ||
            combined.includes("received")
        ) {

            return "income";

        }


        const amount =
            Number(
                transaction?.amount ??
                transaction?.value ??
                0
            );


        return amount < 0
            ? "expense"
            : "income";

    }


    /* =====================================================
       11. TRANSACTION TITLE
    ===================================================== */

    function getTransactionTitle(
        transaction
    ) {

        return (
            transaction?.title ||
            transaction?.name ||
            transaction?.category ||
            transaction?.description ||
            transaction?.recipient ||
            transaction?.sender ||
            "Transaction"
        );

    }


    /* =====================================================
       12. TRANSACTION DESCRIPTION
    ===================================================== */

    function getTransactionDescription(
        transaction
    ) {

        if (
            transaction?.description
        ) {

            return transaction.description;

        }


        const type =
            getTransactionType(
                transaction
            );


        const account =
            getAccountName(
                transaction
            );


        if (type === "income") {

            return `Deposit to ${account}`;

        }


        return `Withdrawal from ${account}`;

    }


    /* =====================================================
       13. ACCOUNT NAME
    ===================================================== */

    function getAccountName(
        transaction
    ) {

        return (
            transaction?.account ||
            transaction?.accountName ||
            transaction?.sourceAccount ||
            transaction?.destinationAccount ||
            "Main Account"
        );

    }


    /* =====================================================
       14. PAYMENT METHOD
    ===================================================== */

    function getPaymentMethod(
        transaction
    ) {

        return (
            transaction?.paymentMethod ||
            transaction?.method ||
            "Direct"
        );

    }


    /* =====================================================
       15. STATUS
    ===================================================== */

    function getTransactionStatus(
        transaction
    ) {

        let status =
            String(
                transaction?.status ||
                "completed"
            )
                .trim()
                .toLowerCase();


        if (status === "cancelled") {

            status = "canceled";

        }


        if (
            status !== "completed" &&
            status !== "pending" &&
            status !== "canceled"
        ) {

            status = "completed";

        }


        return status;

    }


    /* =====================================================
       16. AMOUNT
    ===================================================== */

    function getTransactionAmount(
        transaction
    ) {

        return Math.abs(
            Number(
                transaction?.amount ??
                transaction?.value ??
                0
            )
        );

    }


    /* =====================================================
       17. TRANSACTION ID
    ===================================================== */

    function getTransactionId(
        transaction,
        index,
        accountName = ""
    ) {

        if (
            transaction?.id
        ) {

            return String(
                transaction.id
            );

        }


        if (
            transaction?.transactionId
        ) {

            return String(
                transaction.transactionId
            );

        }


        return [
            accountName,
            transaction?.title,
            transaction?.type,
            transaction?.amount,
            getTransactionDate(
                transaction
            ),
            index
        ]
            .join("|");

    }


    /* =====================================================
       18. NORMALIZE ONE TRANSACTION
    ===================================================== */

    function normalizeTransaction(
        transaction,
        index,
        parentAccount = ""
    ) {

        if (
            !transaction ||
            typeof transaction !== "object"
        ) {

            return null;

        }


        /*
         * If the transaction itself has no account,
         * use the account that owns it.
         */

        const account =
            getAccountName(
                {
                    ...transaction,
                    account:
                        transaction.account ||
                        parentAccount
                }
            );


        const normalized = {

            ...transaction,

            _id:
                getTransactionId(
                    transaction,
                    index,
                    account
                ),

            _type:
                getTransactionType(
                    transaction
                ),

            _title:
                getTransactionTitle(
                    transaction
                ),

            _description:
                getTransactionDescription(
                    {
                        ...transaction,
                        account
                    }
                ),

            _account:
                account,

            _paymentMethod:
                getPaymentMethod(
                    transaction
                ),

            _status:
                getTransactionStatus(
                    transaction
                ),

            _amount:
                getTransactionAmount(
                    transaction
                ),

            _date:
                parseTransactionDate(
                    transaction
                )

        };


        return normalized;

    }


    /* =====================================================
       19. GET ALL TRANSACTIONS
       -----------------------------------------------------
       Main source:
       currentUser.transactions

       Also checks:
       currentUser.accounts[].transactions

       This allows transactions created by the Accounts
       page to appear even if an older Accounts script
       stored them inside the individual account.
    ===================================================== */

    function normalizeTransactions() {

        if (!currentUser) {
            return [];
        }


        const allTransactions = [];

        const seenIds = new Set();


        /* =================================================
           MAIN USER TRANSACTIONS
        ================================================= */

        if (
            Array.isArray(
                currentUser.transactions
            )
        ) {

            currentUser.transactions.forEach(
                (transaction, index) => {

                    const normalized =
                        normalizeTransaction(
                            transaction,
                            index,
                            transaction?.account ||
                            "Main Account"
                        );


                    if (!normalized) {
                        return;
                    }


                    const id =
                        normalized._id;


                    if (
                        seenIds.has(id)
                    ) {

                        return;

                    }


                    seenIds.add(id);


                    allTransactions.push(
                        normalized
                    );

                }
            );

        }


        /* =================================================
           ACCOUNT-LEVEL TRANSACTIONS
        ================================================= */

        if (
            Array.isArray(
                currentUser.accounts
            )
        ) {

            currentUser.accounts.forEach(
                (account, accountIndex) => {

                    if (
                        !account ||
                        !Array.isArray(
                            account.transactions
                        )
                    ) {

                        return;

                    }


                    const accountName =
                        account.name ||
                        account.title ||
                        account.accountName ||
                        `Account ${accountIndex + 1}`;


                    account.transactions.forEach(
                        (
                            transaction,
                            transactionIndex
                        ) => {

                            const normalized =
                                normalizeTransaction(
                                    transaction,
                                    transactionIndex,
                                    accountName
                                );


                            if (!normalized) {
                                return;
                            }


                            const id =
                                normalized._id;


                            /*
                             * Older account-level records
                             * may not have IDs.
                             *
                             * Create a stronger duplicate key.
                             */

                            const duplicateKey = [
                                id,
                                normalized._type,
                                normalized._amount,
                                normalized._account,
                                normalized._date
                                    ? normalized._date.getTime()
                                    : ""
                            ].join("|");


                            if (
                                seenIds.has(
                                    duplicateKey
                                ) ||
                                seenIds.has(id)
                            ) {

                                return;

                            }


                            seenIds.add(
                                duplicateKey
                            );


                            /*
                             * Give account-level records
                             * a unique internal ID.
                             */

                            normalized._id =
                                duplicateKey;


                            allTransactions.push(
                                normalized
                            );

                        }
                    );

                }
            );

        }


        /* =================================================
           SORT NEWEST FIRST
        ================================================= */

        allTransactions.sort(
            (a, b) => {

                const dateA =
                    a._date
                        ? a._date.getTime()
                        : 0;


                const dateB =
                    b._date
                        ? b._date.getTime()
                        : 0;


                return dateB - dateA;

            }
        );


        return allTransactions;

    }


    /* =====================================================
       20. HEADER
    ===================================================== */

    function renderHeader() {

        if (!currentUser) {
            return;
        }


        const fullName =
            String(
                currentUser.name ||
                "User"
            ).trim();


        const nameParts =
            fullName
                .split(/\s+/)
                .filter(Boolean);


        /*
         * Reen Bank header displays the second name
         * where available.
         */

        const displayName =
            nameParts.length >= 2
                ? nameParts[1]
                : nameParts[0] ||
                  "User";


        if (headerUserName) {

            headerUserName.textContent =
                displayName;

        }


        if (headerAccountNumber) {

            headerAccountNumber.textContent =
                currentUser.accountNumber ||
                "—";

        }


        renderProfileImage();

    }


    /* =====================================================
       21. PROFILE IMAGE
    ===================================================== */

    function renderProfileImage() {

        if (
            !headerProfileImage ||
            !headerProfileInitials
        ) {

            return;

        }


        const image =
            currentUser?.profileImage ||
            "";


        if (image) {

            headerProfileImage.src =
                image;


            headerProfileImage.classList.remove(
                "hidden"
            );


            headerProfileInitials.classList.add(
                "hidden"
            );


            return;

        }


        headerProfileImage.src = "";


        headerProfileImage.classList.add(
            "hidden"
        );


        const name =
            String(
                currentUser?.name ||
                "User"
            ).trim();


        const initials =
            name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(
                    word =>
                        word
                            .charAt(0)
                            .toUpperCase()
                )
                .join("");


        headerProfileInitials.textContent =
            initials || "U";


        headerProfileInitials.classList.remove(
            "hidden"
        );

    }


    /* =====================================================
       22. BALANCES
    ===================================================== */

    function getMainBalance() {

        return Number(
            currentUser?.balance || 0
        );

    }


    function getSchoolBalance() {

        return Number(
            currentUser?.schoolSavings || 0
        );

    }


    function getHolidayBalance() {

        return Number(
            currentUser?.holidayBalance || 0
        );

    }


    function renderBalances() {

        const main =
            getMainBalance();


        const school =
            getSchoolBalance();


        const holiday =
            getHolidayBalance();


        if (mainAccountBalance) {

            mainAccountBalance.textContent =
                mainBalanceVisible
                    ? formatCurrency(main)
                    : "₦••••••";

        }


        if (schoolAccountBalance) {

            schoolAccountBalance.textContent =
                schoolBalanceVisible
                    ? formatCurrency(school)
                    : "₦••••••";

        }


        if (holidayAccountBalance) {

            holidayAccountBalance.textContent =
                holidayBalanceVisible
                    ? formatCurrency(holiday)
                    : "₦••••••";

        }

    }


    /* =====================================================
       23. EYE ICON
    ===================================================== */

    function setEyeIcon(
        button,
        visible
    ) {

        if (!button) {
            return;
        }


        const icon =
            button.querySelector("i");


        if (!icon) {
            return;
        }


        icon.classList.toggle(
            "fa-eye",
            visible
        );


        icon.classList.toggle(
            "fa-eye-slash",
            !visible
        );

    }


    if (mainBalanceToggle) {

        mainBalanceToggle.addEventListener(
            "click",
            () => {

                mainBalanceVisible =
                    !mainBalanceVisible;


                setEyeIcon(
                    mainBalanceToggle,
                    mainBalanceVisible
                );


                renderBalances();

            }
        );

    }


    if (schoolBalanceToggle) {

        schoolBalanceToggle.addEventListener(
            "click",
            () => {

                schoolBalanceVisible =
                    !schoolBalanceVisible;


                setEyeIcon(
                    schoolBalanceToggle,
                    schoolBalanceVisible
                );


                renderBalances();

            }
        );

    }


    if (holidayBalanceToggle) {

        holidayBalanceToggle.addEventListener(
            "click",
            () => {

                holidayBalanceVisible =
                    !holidayBalanceVisible;


                setEyeIcon(
                    holidayBalanceToggle,
                    holidayBalanceVisible
                );


                renderBalances();

            }
        );

    }


    /* =====================================================
       24. ACCOUNT FILTER OPTIONS
    ===================================================== */

    function renderAccountFilterOptions() {

        if (!transactionAccountFilter) {
            return;
        }


        const previousValue =
            transactionAccountFilter.value ||
            "all";


        const accounts = [];


        function addAccount(
            name
        ) {

            const cleanName =
                String(
                    name || ""
                ).trim();


            if (!cleanName) {
                return;
            }


            const exists =
                accounts.some(
                    existing =>
                        existing.toLowerCase() ===
                        cleanName.toLowerCase()
                );


            if (!exists) {

                accounts.push(
                    cleanName
                );

            }

        }


        addAccount("Main Account");

        addAccount("School Savings");

        addAccount("Holiday Plan");


        if (
            Array.isArray(
                currentUser?.accounts
            )
        ) {

            currentUser.accounts.forEach(
                account => {

                    addAccount(
                        account?.name ||
                        account?.title ||
                        account?.accountName
                    );

                }
            );

        }


        transactionAccountFilter.innerHTML =
            "";


        const allOption =
            document.createElement(
                "option"
            );


        allOption.value = "all";

        allOption.textContent =
            "All Accounts";


        transactionAccountFilter.appendChild(
            allOption
        );


        accounts.forEach(
            accountName => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    accountName;


                option.textContent =
                    accountName;


                transactionAccountFilter.appendChild(
                    option
                );

            }
        );


        const optionExists =
            [
                ...transactionAccountFilter.options
            ].some(
                option =>
                    option.value ===
                    previousValue
            );


        transactionAccountFilter.value =
            optionExists
                ? previousValue
                : "all";

    }


    /* =====================================================
       25. FILTER MATCHING
    ===================================================== */

    function accountMatchesFilter(
        transaction,
        selected
    ) {

        if (
            !selected ||
            selected === "all"
        ) {

            return true;

        }


        const account =
            String(
                transaction._account ||
                ""
            )
                .trim()
                .toLowerCase();


        const selectedAccount =
            String(
                selected
            )
                .trim()
                .toLowerCase();


        if (
            account ===
            selectedAccount
        ) {

            return true;

        }


        const aliases = {

            "main account": [
                "main",
                "mainaccount"
            ],

            "school savings": [
                "school",
                "schoolsavings"
            ],

            "holiday plan": [
                "holiday",
                "holidayplan"
            ]

        };


        const possibleAliases =
            aliases[
                selectedAccount
            ] || [];


        return possibleAliases.includes(
            account
        );

    }


    function typeMatchesFilter(
        transaction,
        selected
    ) {

        if (
            !selected ||
            selected === "all"
        ) {

            return true;

        }


        return (
            transaction._type ===
            selected
        );

    }


    function statusMatchesFilter(
        transaction,
        selected
    ) {

        if (
            !selected ||
            selected === "all"
        ) {

            return true;

        }


        return (
            transaction._status ===
            selected
        );

    }


    function dateMatchesFilter(
        transaction,
        selected
    ) {

        if (
            !selected ||
            selected === "all"
        ) {

            return true;

        }


        const date =
            transaction._date;


        if (!date) {
            return false;
        }


        const now =
            new Date();


        if (
            selected === "today"
        ) {

            return (
                date.getFullYear() ===
                    now.getFullYear() &&

                date.getMonth() ===
                    now.getMonth() &&

                date.getDate() ===
                    now.getDate()
            );

        }


        const difference =
            now.getTime() -
            date.getTime();


        const day =
            24 * 60 * 60 * 1000;


        if (
            selected === "7days"
        ) {

            return (
                difference >= 0 &&
                difference <=
                    7 * day
            );

        }


        if (
            selected === "30days"
        ) {

            return (
                difference >= 0 &&
                difference <=
                    30 * day
            );

        }


        if (
            selected === "90days"
        ) {

            return (
                difference >= 0 &&
                difference <=
                    90 * day
            );

        }


        return true;

    }


    function searchMatches(
        transaction,
        searchTerm
    ) {

        if (!searchTerm) {
            return true;
        }


        const text = [

            transaction._title,
            transaction._description,
            transaction._account,
            transaction._paymentMethod,
            transaction._status,
            transaction?.bank,
            transaction?.category,
            transaction?.recipient,
            transaction?.sender,
            transaction?.accountNumber

        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


        return text.includes(
            searchTerm
        );

    }


    /* =====================================================
       26. GET FILTERED TRANSACTIONS
    ===================================================== */

    function getFilteredTransactions() {

        const transactions =
            normalizeTransactions();


        const search =
            String(
                transactionSearch?.value ||
                ""
            )
                .trim()
                .toLowerCase();


        const account =
            transactionAccountFilter?.value ||
            "all";


        const type =
            transactionTypeFilter?.value ||
            "all";


        const status =
            transactionStatusFilter?.value ||
            "all";


        const date =
            transactionDateFilter?.value ||
            "all";


        return transactions.filter(
            transaction => {

                return (

                    searchMatches(
                        transaction,
                        search
                    ) &&

                    accountMatchesFilter(
                        transaction,
                        account
                    ) &&

                    typeMatchesFilter(
                        transaction,
                        type
                    ) &&

                    statusMatchesFilter(
                        transaction,
                        status
                    ) &&

                    dateMatchesFilter(
                        transaction,
                        date
                    )

                );

            }
        );

    }


    /* =====================================================
       27. MAKE TABLE RESPONSIVE
       -----------------------------------------------------
       IMPORTANT:
       The header and transaction rows have the same
       minimum width.

       On mobile:
       - No column stacking
       - No squeezed columns
       - Horizontal scroll
    ===================================================== */

    function setupResponsiveTable() {

        if (!transactionList) {
            return;
        }


        const tableContainer =
            transactionList.parentElement;


        if (!tableContainer) {
            return;
        }


        /*
         * Parent becomes the horizontal scrolling area.
         */

        tableContainer.style.width =
            "100%";


        tableContainer.style.maxWidth =
            "100%";


        tableContainer.style.overflowX =
            "auto";


        tableContainer.style.overflowY =
            "hidden";


        tableContainer.style.webkitOverflowScrolling =
            "touch";


        tableContainer.style.scrollBehavior =
            "smooth";


        tableContainer.style.scrollbarWidth =
            "thin";


        /*
         * Find the table header.
         *
         * Your HTML has the header directly before
         * #transactionList.
         */

        const tableHeader =
            transactionList.previousElementSibling;


        if (tableHeader) {

            tableHeader.style.display =
                "grid";


            tableHeader.style.gridTemplateColumns =
                TRANSACTION_GRID_COLUMNS;


            tableHeader.style.minWidth =
                `${TRANSACTION_TABLE_MIN_WIDTH}px`;


            tableHeader.style.width =
                "100%";


            tableHeader.style.boxSizing =
                "border-box";


            tableHeader.style.flexShrink =
                "0";


            tableHeader.style.alignItems =
                "center";

        }


        /*
         * Transaction list itself.
         */

        transactionList.style.minWidth =
            `${TRANSACTION_TABLE_MIN_WIDTH}px`;


        transactionList.style.width =
            "100%";


        transactionList.style.boxSizing =
            "border-box";

    }


    /* =====================================================
       28. CREATE TRANSACTION ROW
       -----------------------------------------------------
       EXACT FIVE COLUMNS:

       1. Name
       2. Payment Method
       3. Date
       4. Amount
       5. Status
    ===================================================== */

    function createTransactionRow(
        transaction
    ) {

        const isIncome =
            transaction._type ===
            "income";


        const sign =
            isIncome
                ? "+"
                : "-";


        const amountClass =
            isIncome
                ? "text-[#00a86b]"
                : "text-[#ff4d55]";


        const iconBackground =
            isIncome
                ? "bg-[#e9f9f3]"
                : "bg-[#fff0f1]";


        const iconColor =
            isIncome
                ? "text-[#00a86b]"
                : "text-[#ff4d55]";


        const icon =
            isIncome
                ? "+"
                : "−";


        const title =
            transaction._title ||
            (
                isIncome
                    ? "Deposit"
                    : "Withdrawal"
            );


        const account =
            transaction._account ||
            "Main Account";


        const description =
            transaction._description ||
            (
                isIncome
                    ? `Deposit to ${account}`
                    : `Withdrawal from ${account}`
            );


        const paymentMethod =
            transaction._paymentMethod ||
            "Direct";


        const paymentIcon =
            getPaymentIcon(
                paymentMethod
            );


        const amount =
            Number(
                transaction._amount ||
                0
            );


        const date =
            transaction._date
                ? formatTransactionDate(
                    transaction
                )
                : "—";


        const status =
            transaction._status ||
            "completed";


        const row =
            document.createElement(
                "div"
            );


        row.className = `
            items-center
            min-h-[86px]
            px-8
            border-b
            border-[#edf1ef]
            hover:bg-[#fbfdfc]
            transition-colors
            cursor-pointer
        `;


        /*
         * IMPORTANT:
         * Set the grid directly with JavaScript.
         *
         * This prevents Tailwind from failing to generate
         * arbitrary grid classes that exist only inside JS.
         */

        row.style.display =
            "grid";


        row.style.gridTemplateColumns =
            TRANSACTION_GRID_COLUMNS;


        row.style.minWidth =
            `${TRANSACTION_TABLE_MIN_WIDTH}px`;


        row.style.width =
            "100%";


        row.style.boxSizing =
            "border-box";


        row.innerHTML = `

            <!-- =========================================
                 COLUMN 1 — NAME
            ========================================== -->

            <div
                class="
                    flex
                    items-center
                    gap-3
                    min-w-0
                "
            >

                <div
                    class="
                        shrink-0
                        w-[38px]
                        h-[38px]
                        rounded-full
                        ${iconBackground}
                        ${iconColor}
                        flex
                        items-center
                        justify-center
                        text-[22px]
                        font-medium
                    "
                >
                    ${icon}
                </div>


                <div class="min-w-0">

                    <p
                        class="
                            text-[14px]
                            font-medium
                            text-[#172033]
                            truncate
                        "
                    >
                        ${escapeHTML(title)}
                    </p>


                    <p
                        class="
                            mt-[3px]
                            text-[12px]
                            text-[#8993a4]
                            truncate
                        "
                    >
                        ${escapeHTML(description)}
                    </p>


                    <p
                        class="
                            mt-[2px]
                            text-[12px]
                            text-[#8993a4]
                            truncate
                        "
                    >
                        ${escapeHTML(account)}
                    </p>

                </div>

            </div>


            <!-- =========================================
                 COLUMN 2 — PAYMENT METHOD
            ========================================== -->

            <div
                class="
                    flex
                    items-center
                    gap-3
                    min-w-0
                "
            >

                <span
                    class="
                        w-[18px]
                        h-[18px]
                        shrink-0
                        flex
                        items-center
                        justify-center
                        text-[#7f8b96]
                    "
                >

                    <i
                        class="
                            fa-solid
                            ${paymentIcon}
                            text-[11px]
                        "
                    ></i>

                </span>


                <span
                    class="
                        text-[13px]
                        text-[#52627a]
                        truncate
                    "
                >
                    ${escapeHTML(
                        paymentMethod
                    )}
                </span>

            </div>


            <!-- =========================================
                 COLUMN 3 — DATE
            ========================================== -->

            <div
                class="
                    text-[13px]
                    text-[#52627a]
                    whitespace-nowrap
                "
            >
                ${escapeHTML(date)}
            </div>


            <!-- =========================================
                 COLUMN 4 — AMOUNT
            ========================================== -->

            <div
                class="
                    ${amountClass}
                    text-[14px]
                    font-medium
                    whitespace-nowrap
                "
            >
                ${sign}₦${formatMoney(amount)}
            </div>


            <!-- =========================================
                 COLUMN 5 — STATUS
            ========================================== -->

            <div
                class="
                    flex
                    justify-end
                    pr-2
                "
            >

                <span
                    class="
                        inline-flex
                        items-center
                        justify-center
                        min-w-[82px]
                        h-[30px]
                        px-4
                        rounded-full
                        bg-[#e9f7f2]
                        text-[#00a86b]
                        text-[11px]
                        font-medium
                        capitalize
                    "
                >
                    ${escapeHTML(status)}
                </span>

            </div>

        `;


        row.addEventListener(
            "click",
            () => {

                openTransactionDetails(
                    transaction
                );

            }
        );


        return row;

    }


    /* =====================================================
       29. PAYMENT ICON
    ===================================================== */

    function getPaymentIcon(
        paymentMethod
    ) {

        const method =
            String(
                paymentMethod || ""
            ).toLowerCase();


        if (
            method.includes("card") ||
            method.includes("credit")
        ) {

            return "fa-credit-card";

        }


        if (
            method.includes("bank") ||
            method.includes("transfer")
        ) {

            return "fa-building-columns";

        }


        if (
            method.includes("cash")
        ) {

            return "fa-money-bill";

        }


        if (
            method.includes("direct")
        ) {

            return "fa-arrow-right-arrow-left";

        }


        return "fa-wallet";

    }


    /* =====================================================
       30. RENDER TRANSACTIONS
    ===================================================== */

    function renderTransactions() {

        if (!transactionList) {
            return;
        }


        const transactions =
            getFilteredTransactions();


        transactionList.innerHTML =
            "";


        if (
            transactions.length ===
            0
        ) {

            if (emptyTransactions) {

                emptyTransactions.classList.remove(
                    "hidden"
                );

            }


            if (transactionResultCount) {

                transactionResultCount.textContent =
                    "0 transactions";

            }


            setupResponsiveTable();


            return;

        }


        if (emptyTransactions) {

            emptyTransactions.classList.add(
                "hidden"
            );

        }


        transactions.forEach(
            transaction => {

                transactionList.appendChild(
                    createTransactionRow(
                        transaction
                    )
                );

            }
        );


        if (transactionResultCount) {

            const count =
                transactions.length;


            transactionResultCount.textContent =
                `${count} transaction${
                    count === 1
                        ? ""
                        : "s"
                }`;

        }


        setupResponsiveTable();

    }


    /* =====================================================
       31. TRANSACTION DETAILS
    ===================================================== */

    function openTransactionDetails(
        transaction
    ) {

        if (
            !transactionDetailsModal ||
            !transactionDetailsContent
        ) {

            return;

        }


        const isIncome =
            transaction._type ===
            "income";


        const amountColor =
            isIncome
                ? "text-[#16a875]"
                : "text-[#ef5965]";


        const prefix =
            isIncome
                ? "+"
                : "-";


        transactionDetailsContent.innerHTML = `

            <div
                class="
                    rounded-[14px]
                    bg-[#f5faf8]
                    p-[18px]
                "
            >

                <div
                    class="
                        flex
                        items-center
                        justify-between
                    "
                >

                    <div>

                        <p
                            class="
                                text-[10px]
                                text-[#989f9c]
                            "
                        >
                            Amount
                        </p>


                        <p
                            class="
                                mt-[5px]
                                text-[23px]
                                font-bold
                                ${amountColor}
                            "
                        >
                            ${prefix}${formatCurrency(
                                transaction._amount
                            )}
                        </p>

                    </div>


                    <div
                        class="
                            flex
                            h-[42px]
                            w-[42px]
                            items-center
                            justify-center
                            rounded-full
                            ${
                                isIncome
                                    ? "bg-[#e4f8ef] text-[#18a875]"
                                    : "bg-[#ffedf0] text-[#ed5965]"
                            }
                        "
                    >

                        <i
                            class="
                                fa-solid
                                ${
                                    isIncome
                                        ? "fa-plus"
                                        : "fa-minus"
                                }
                                text-[12px]
                            "
                        ></i>

                    </div>

                </div>

            </div>


            <div
                class="
                    mt-[18px]
                    space-y-[13px]
                "
            >

                ${createDetailRow(
                    "Transaction",
                    transaction._title
                )}

                ${createDetailRow(
                    "Description",
                    transaction._description
                )}

                ${createDetailRow(
                    "Account",
                    transaction._account
                )}

                ${createDetailRow(
                    "Payment Method",
                    transaction._paymentMethod
                )}

                ${createDetailRow(
                    "Date",
                    formatLongDate(
                        transaction
                    )
                )}

                ${createDetailRow(
                    "Status",
                    transaction._status
                )}

                ${
                    transaction.bank
                        ? createDetailRow(
                            "Bank",
                            transaction.bank
                        )
                        : ""
                }

                ${
                    transaction.accountNumber
                        ? createDetailRow(
                            "Account Number",
                            transaction.accountNumber
                        )
                        : ""
                }

            </div>

        `;


        transactionDetailsModal.classList.remove(
            "hidden"
        );


        transactionDetailsModal.classList.add(
            "flex"
        );


        document.body.classList.add(
            "overflow-hidden"
        );

    }


    function createDetailRow(
        label,
        value
    ) {

        return `

            <div
                class="
                    flex
                    items-start
                    justify-between
                    gap-[20px]
                    border-b
                    border-[#f0f3f2]
                    pb-[11px]
                "
            >

                <span
                    class="
                        text-[10px]
                        text-[#9aa19e]
                    "
                >
                    ${escapeHTML(label)}
                </span>


                <span
                    class="
                        max-w-[65%]
                        text-right
                        text-[10px]
                        font-medium
                        text-[#424946]
                        break-words
                    "
                >
                    ${escapeHTML(
                        value || "—"
                    )}
                </span>

            </div>

        `;

    }


    function closeTransactionModal() {

        if (!transactionDetailsModal) {
            return;
        }


        transactionDetailsModal.classList.add(
            "hidden"
        );


        transactionDetailsModal.classList.remove(
            "flex"
        );


        document.body.classList.remove(
            "overflow-hidden"
        );

    }


    if (closeTransactionDetails) {

        closeTransactionDetails.addEventListener(
            "click",
            closeTransactionModal
        );

    }


    if (closeTransactionDetailsBottom) {

        closeTransactionDetailsBottom.addEventListener(
            "click",
            closeTransactionModal
        );

    }


    if (transactionDetailsModal) {

        transactionDetailsModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    transactionDetailsModal
                ) {

                    closeTransactionModal();

                }

            }
        );

    }


    if (transactionDetailsPanel) {

        transactionDetailsPanel.addEventListener(
            "click",
            event => {

                event.stopPropagation();

            }
        );

    }


    /* =====================================================
       32. SEARCH BUTTON
    ===================================================== */

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            () => {

                if (!transactionSearch) {
                    return;
                }


                transactionSearch.focus();


                transactionSearch.scrollIntoView(
                    {
                        behavior: "smooth",
                        block: "center"
                    }
                );

            }
        );

    }


    /* =====================================================
       33. FILTER EVENTS
    ===================================================== */

    if (transactionSearch) {

        transactionSearch.addEventListener(
            "input",
            renderTransactions
        );

    }


    if (transactionAccountFilter) {

        transactionAccountFilter.addEventListener(
            "change",
            renderTransactions
        );

    }


    if (transactionTypeFilter) {

        transactionTypeFilter.addEventListener(
            "change",
            renderTransactions
        );

    }


    if (transactionStatusFilter) {

        transactionStatusFilter.addEventListener(
            "change",
            renderTransactions
        );

    }


    if (transactionDateFilter) {

        transactionDateFilter.addEventListener(
            "change",
            renderTransactions
        );

    }


    /* =====================================================
       34. CLEAR FILTERS
    ===================================================== */

    if (clearTransactionFilters) {

        clearTransactionFilters.addEventListener(
            "click",
            () => {

                if (transactionSearch) {

                    transactionSearch.value =
                        "";

                }


                if (transactionAccountFilter) {

                    transactionAccountFilter.value =
                        "all";

                }


                if (transactionTypeFilter) {

                    transactionTypeFilter.value =
                        "all";

                }


                if (transactionStatusFilter) {

                    transactionStatusFilter.value =
                        "all";

                }


                if (transactionDateFilter) {

                    transactionDateFilter.value =
                        "all";

                }


                renderTransactions();

            }
        );

    }


    /* =====================================================
       35. NOTIFICATIONS
    ===================================================== */

    function renderNotifications() {

        if (!notificationList) {
            return;
        }


        const notifications =
            Array.isArray(
                currentUser?.notifications
            )
                ? currentUser.notifications
                : [];


        notificationList.innerHTML =
            "";


        const unread =
            notifications.filter(
                notification =>
                    !notification.read
            );


        if (notificationUnreadCount) {

            notificationUnreadCount.textContent =
                `${unread.length} unread`;

        }


        if (notificationDot) {

            if (unread.length > 0) {

                notificationDot.textContent =
                    unread.length > 99
                        ? "99+"
                        : unread.length;


                notificationDot.classList.remove(
                    "hidden"
                );


                notificationDot.classList.add(
                    "flex"
                );

            } else {

                notificationDot.classList.add(
                    "hidden"
                );


                notificationDot.classList.remove(
                    "flex"
                );

            }

        }


        if (
            notifications.length ===
            0
        ) {

            notificationList.innerHTML = `

                <div
                    class="
                        px-5
                        py-10
                        text-center
                    "
                >

                    <div
                        class="
                            mx-auto
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-full
                            bg-[#edf9f4]
                        "
                    >

                        <i
                            class="
                                fa-regular
                                fa-bell
                                text-[#1aaa78]
                            "
                        ></i>

                    </div>


                    <p
                        class="
                            mt-3
                            text-[11px]
                            font-medium
                            text-[#626966]
                        "
                    >
                        No notifications
                    </p>


                    <p
                        class="
                            mt-1
                            text-[9px]
                            text-[#a0a6a3]
                        "
                    >
                        You're all caught up.
                    </p>

                </div>

            `;


            return;

        }


        notifications.forEach(
            (
                notification,
                index
            ) => {

                const isRead =
                    Boolean(
                        notification.read
                    );


                const title =
                    notification.title ||
                    notification.message ||
                    "Notification";


                const message =
                    notification.message ||
                    notification.description ||
                    "";


                const date =
                    notification.createdAt ||
                    notification.date ||
                    "";


                const element =
                    document.createElement(
                        "div"
                    );


                element.className = `
                    flex
                    gap-3
                    border-b
                    border-gray-100
                    px-4
                    py-4
                    ${
                        isRead
                            ? "bg-white"
                            : "bg-[#f5fbf8]"
                    }
                `;


                element.innerHTML = `

                    <div
                        class="
                            mt-0.5
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#e5f8f0]
                            text-[#19a875]
                        "
                    >

                        <i
                            class="
                                fa-regular
                                fa-bell
                                text-[11px]
                            "
                        ></i>

                    </div>


                    <div
                        class="
                            min-w-0
                            flex-1
                        "
                    >

                        <div
                            class="
                                flex
                                items-start
                                justify-between
                                gap-2
                            "
                        >

                            <p
                                class="
                                    text-[11px]
                                    font-semibold
                                    text-[#343a37]
                                "
                            >
                                ${escapeHTML(
                                    title
                                )}
                            </p>


                            ${
                                !isRead
                                    ? `
                                        <span
                                            class="
                                                mt-1
                                                h-1.5
                                                w-1.5
                                                shrink-0
                                                rounded-full
                                                bg-[#1baa78]
                                            "
                                        ></span>
                                    `
                                    : ""
                            }

                        </div>


                        <p
                            class="
                                mt-1
                                text-[10px]
                                leading-4
                                text-[#8d9491]
                            "
                        >
                            ${escapeHTML(
                                message
                            )}
                        </p>


                        ${
                            date
                                ? `
                                    <p
                                        class="
                                            mt-2
                                            text-[8px]
                                            text-[#a5aaa8]
                                        "
                                    >
                                        ${escapeHTML(
                                            formatNotificationDate(
                                                date
                                            )
                                        )}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                `;


                element.addEventListener(
                    "click",
                    () => {

                        if (
                            currentUser.notifications &&
                            currentUser.notifications[index]
                        ) {

                            currentUser
                                .notifications[
                                    index
                                ]
                                .read = true;


                            saveCurrentUser();

                            renderNotifications();

                        }

                    }
                );


                notificationList.appendChild(
                    element
                );

            }
        );

    }


    function formatNotificationDate(
        value
    ) {

        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value);

        }


        return date.toLocaleString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* =====================================================
       36. NOTIFICATION DROPDOWN
    ===================================================== */

    function closeNotificationDropdown() {

        if (!notificationDropdown) {
            return;
        }


        notificationDropdown.classList.add(
            "hidden"
        );

    }


    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                if (!notificationDropdown) {
                    return;
                }


                notificationDropdown.classList.toggle(
                    "hidden"
                );

            }
        );

    }


    if (notificationDropdown) {

        notificationDropdown.addEventListener(
            "click",
            event => {

                event.stopPropagation();

            }
        );

    }


    document.addEventListener(
        "click",
        () => {

            closeNotificationDropdown();

        }
    );


    /* =====================================================
       37. MARK ALL NOTIFICATIONS READ
    ===================================================== */

    if (markAllNotificationsRead) {

        markAllNotificationsRead.addEventListener(
            "click",
            () => {

                if (
                    !Array.isArray(
                        currentUser.notifications
                    )
                ) {

                    return;

                }


                currentUser.notifications =
                    currentUser.notifications.map(
                        notification => ({

                            ...notification,

                            read: true

                        })
                    );


                saveCurrentUser();

                renderNotifications();

            }
        );

    }


    /* =====================================================
       38. MOBILE SIDEBAR
    ===================================================== */

    function openSidebar() {

        if (!sidebar) {
            return;
        }


        sidebar.classList.remove(
            "-translate-x-full"
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


        if (sidebarOverlay) {

            sidebarOverlay.classList.add(
                "hidden"
            );

        }

    }


    if (mobileMenuButton) {

        mobileMenuButton.addEventListener(
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
       39. NAVIGATION
    ===================================================== */

    function goToPage(
        path
    ) {

        window.location.href =
            path;

    }


    if (overviewNav) {

        overviewNav.addEventListener(
            "click",
            event => {

                event.preventDefault();

                goToPage(
                    "./overview.html"
                );

            }
        );

    }


    if (accountsNav) {

        accountsNav.addEventListener(
            "click",
            event => {

                event.preventDefault();

                goToPage(
                    "./account.html"
                );

            }
        );

    }


    if (profileNav) {

        profileNav.addEventListener(
            "click",
            event => {

                event.preventDefault();

                goToPage(
                    "./profile.html"
                );

            }
        );

    }


    if (transactionsNav) {

        transactionsNav.addEventListener(
            "click",
            event => {

                event.preventDefault();

                goToPage(
                    "./transaction.html"
                );

            }
        );

    }


    /* =====================================================
       40. PROFILE BUTTON
    ===================================================== */

    if (headerProfileButton) {

        headerProfileButton.addEventListener(
            "click",
            () => {

                goToPage(
                    "./profile.html"
                );

            }
        );

    }


    /* =====================================================
       41. LOGOUT MODAL
    ===================================================== */

    function openLogoutModal() {

        if (!logoutModal) {
            return;
        }


        logoutModal.classList.remove(
            "hidden"
        );


        logoutModal.classList.add(
            "flex"
        );


        document.body.classList.add(
            "overflow-hidden"
        );

    }


    function closeLogoutModal() {

        if (!logoutModal) {
            return;
        }


        logoutModal.classList.add(
            "hidden"
        );


        logoutModal.classList.remove(
            "flex"
        );


        document.body.classList.remove(
            "overflow-hidden"
        );

    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            openLogoutModal
        );

    }


    if (cancelLogoutBtn) {

        cancelLogoutBtn.addEventListener(
            "click",
            closeLogoutModal
        );

    }


    if (logoutModal) {

        logoutModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    logoutModal
                ) {

                    closeLogoutModal();

                }

            }
        );

    }


    /* =====================================================
       42. CONFIRM LOGOUT
    ===================================================== */

    if (confirmLogoutBtn) {

        confirmLogoutBtn.addEventListener(
            "click",
            () => {

                sessionStorage.removeItem(
                    SESSION_KEY
                );


                localStorage.removeItem(
                    SESSION_KEY
                );


                window.location.href =
                    "./login.html";

            }
        );

    }


    /* =====================================================
       43. ESCAPE KEY
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


            closeTransactionModal();

            closeLogoutModal();

            closeNotificationDropdown();

            closeSidebar();

        }
    );


    /* =====================================================
       44. REFRESH FROM STORAGE
    ===================================================== */

    function refreshFromStorage() {

        const storedUser =
            getStoredCurrentUser();


        if (!storedUser) {
            return;
        }


        users =
            getStoredUsers();


        const fullUser =
            findUserInUsers(
                storedUser
            );


        if (fullUser) {

            currentUser = {
                ...storedUser,
                ...fullUser
            };

        } else {

            currentUser = {
                ...storedUser
            };

        }


        if (
            !Array.isArray(
                currentUser.transactions
            )
        ) {

            currentUser.transactions =
                [];

        }


        if (
            !Array.isArray(
                currentUser.accounts
            )
        ) {

            currentUser.accounts =
                [];

        }


        if (
            !Array.isArray(
                currentUser.notifications
            )
        ) {

            currentUser.notifications =
                [];

        }


        renderHeader();

        renderBalances();

        renderAccountFilterOptions();

        renderTransactions();

        renderNotifications();

    }


    /* =====================================================
       45. STORAGE EVENT
    ===================================================== */

    window.addEventListener(
        "storage",
        event => {

            if (
                event.key ===
                    USERS_KEY ||
                event.key ===
                    SESSION_KEY
            ) {

                refreshFromStorage();

            }

        }
    );


    /* =====================================================
       46. PAGE SHOW
    ===================================================== */

    window.addEventListener(
        "pageshow",
        () => {

            refreshFromStorage();

        }
    );


    /* =====================================================
       47. RESIZE
       -----------------------------------------------------
       Re-apply table sizing when screen changes.
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            setupResponsiveTable();

        }
    );


    /* =====================================================
       48. INITIAL RENDER
    ===================================================== */

    renderHeader();

    renderBalances();

    renderAccountFilterOptions();

    renderTransactions();

    renderNotifications();


    /* =====================================================
       49. INITIAL EYE ICONS
    ===================================================== */

    setEyeIcon(
        mainBalanceToggle,
        mainBalanceVisible
    );


    setEyeIcon(
        schoolBalanceToggle,
        schoolBalanceVisible
    );


    setEyeIcon(
        holidayBalanceToggle,
        holidayBalanceVisible
    );


    /* =====================================================
       50. INITIAL RESPONSIVE TABLE
    ===================================================== */

    setupResponsiveTable();

});