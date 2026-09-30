/* =========================================================
   REEN BANK — TRANSACTIONS PAGE JAVASCRIPT
   ---------------------------------------------------------
   DATA SOURCE:
   - localStorage -> reenUsers
   - sessionStorage -> currentUser
   - localStorage -> currentUser fallback

   IMPORTANT:
   ---------------------------------------------------------
   This page DOES NOT create a separate transaction database.

   It reads:
       currentUser.transactions

   Transactions created from:
   - Overview
   - Accounts
   - Main Account
   - School Savings
   - Holiday Plan
   - Custom Accounts

   are displayed here.

   Overview:
   - Shows latest 5 transactions

   Transactions:
   - Shows ALL transactions

   SUPPORTED TRANSACTION FIELDS:
   id
   type
   transactionType
   category
   title
   name
   description
   amount
   account
   accountName
   paymentMethod
   bank
   accountNumber
   status
   createdAt
   date
   timestamp
========================================================= */


document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. STORAGE
    ===================================================== */

    let currentUser = null;
    let users = [];

    const USERS_KEY = "reenUsers";
    const SESSION_KEY = "currentUser";


    /* =====================================================
       2. DOM REFERENCES
    ===================================================== */

    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const mobileMenuButton = document.getElementById("mobileMenuButton");

    const overviewNav = document.getElementById("overviewNav");
    const accountsNav = document.getElementById("accountsNav");
    const transactionsNav = document.getElementById("transactionsNav");
    const profileNav = document.getElementById("profileNav");

    const logoutButton = document.getElementById("logoutButton");

    const headerUserName = document.getElementById("headerUserName");
    const headerAccountNumber = document.getElementById("headerAccountNumber");

    const headerProfileButton = document.getElementById("headerProfileButton");
    const headerProfileImage = document.getElementById("headerProfileImage");
    const headerProfileInitials = document.getElementById("headerProfileInitials");

    const searchButton = document.getElementById("searchButton");

    const notificationButton = document.getElementById("notificationButton");
    const notificationDot = document.getElementById("notificationDot");
    const notificationDropdown = document.getElementById("notificationDropdown");
    const notificationUnreadCount = document.getElementById("notificationUnreadCount");
    const markAllNotificationsRead = document.getElementById("markAllNotificationsRead");
    const notificationList = document.getElementById("notificationList");

    const mainAccountBalance = document.getElementById("mainAccountBalance");
    const schoolAccountBalance = document.getElementById("schoolAccountBalance");
    const holidayAccountBalance = document.getElementById("holidayAccountBalance");

    const mainBalanceToggle = document.getElementById("mainBalanceToggle");
    const schoolBalanceToggle = document.getElementById("schoolBalanceToggle");
    const holidayBalanceToggle = document.getElementById("holidayBalanceToggle");

    const transactionSearch = document.getElementById("transactionSearch");
    const transactionAccountFilter = document.getElementById("transactionAccountFilter");
    const transactionTypeFilter = document.getElementById("transactionTypeFilter");
    const transactionStatusFilter = document.getElementById("transactionStatusFilter");
    const transactionDateFilter = document.getElementById("transactionDateFilter");
    const clearTransactionFilters = document.getElementById("clearTransactionFilters");

    const transactionList = document.getElementById("transactionList");
    const emptyTransactions = document.getElementById("emptyTransactions");
    const transactionResultCount = document.getElementById("transactionResultCount");

    const transactionDetailsModal = document.getElementById("transactionDetailsModal");
    const transactionDetailsPanel = document.getElementById("transactionDetailsPanel");
    const closeTransactionDetails = document.getElementById("closeTransactionDetails");
    const closeTransactionDetailsBottom = document.getElementById("closeTransactionDetailsBottom");
    const transactionDetailsContent = document.getElementById("transactionDetailsContent");

    const logoutModal = document.getElementById("logoutModal");
    const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
    const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");


    /* =====================================================
       3. RESPONSIVE TRANSACTION TABLE
       -----------------------------------------------------
       Desktop keeps the exact five-column Figma layout.
       On smaller screens the table becomes horizontally
       scrollable instead of collapsing or misaligning.
    ===================================================== */

    const TRANSACTION_TABLE_MIN_WIDTH = 1090;


    function setupResponsiveTransactionTable() {

        if (!transactionList) {
            return;
        }

        /*
         * The transaction list and its header must scroll
         * together. The immediate parent is the table card
         * containing both pieces in the Figma layout.
         */
        const tableWrapper = transactionList.parentElement;
        const tableHeader = transactionList.previousElementSibling;

        if (!tableWrapper) {
            return;
        }

        tableWrapper.style.overflowX = "auto";
        tableWrapper.style.overflowY = "hidden";
        tableWrapper.style.webkitOverflowScrolling = "touch";
        tableWrapper.style.scrollbarWidth = "thin";

        /* Keep the desktop grid exactly the same. */
        if (tableHeader) {

            tableHeader.style.display = "grid";
            tableHeader.style.gridTemplateColumns =
                "minmax(330px,1.6fr) " +
                "minmax(220px,1.2fr) " +
                "minmax(200px,1fr) " +
                "minmax(220px,1fr) " +
                "120px";
            tableHeader.style.alignItems = "center";
            tableHeader.style.minWidth = `${TRANSACTION_TABLE_MIN_WIDTH}px`;
            tableHeader.style.boxSizing = "border-box";
        }

        transactionList.style.minWidth =
            `${TRANSACTION_TABLE_MIN_WIDTH}px`;

        transactionList.style.boxSizing = "border-box";

    }


    /* =====================================================
       4. BALANCE VISIBILITY
    ===================================================== */

    let mainBalanceVisible = true;
    let schoolBalanceVisible = true;
    let holidayBalanceVisible = true;


    /* =====================================================
       4. HELPERS
    ===================================================== */

    function getStoredUsers() {

        try {

            const storedUsers = localStorage.getItem(USERS_KEY);

            if (!storedUsers) {
                return [];
            }

            const parsed = JSON.parse(storedUsers);

            return Array.isArray(parsed) ? parsed : [];

        } catch (error) {

            console.error("Unable to read reenUsers:", error);

            return [];

        }

    }


    function getStoredCurrentUser() {

        let user = null;


        /* ---------------------------------------------
           First try sessionStorage
        --------------------------------------------- */

        try {

            const sessionUser = sessionStorage.getItem(SESSION_KEY);

            if (sessionUser) {

                user = JSON.parse(sessionUser);

            }

        } catch (error) {

            console.error("Unable to read session currentUser:", error);

        }


        /* ---------------------------------------------
           Fallback to localStorage
        --------------------------------------------- */

        if (!user) {

            try {

                const localUser = localStorage.getItem(SESSION_KEY);

                if (localUser) {

                    user = JSON.parse(localUser);

                }

            } catch (error) {

                console.error("Unable to read local currentUser:", error);

            }

        }


        return user;

    }


    function findUserInUsers(storedUser) {

        if (!storedUser || !Array.isArray(users)) {
            return null;
        }


        const storedEmail = String(storedUser.email || "")
            .trim()
            .toLowerCase();


        const storedAccountNumber = String(
            storedUser.accountNumber || ""
        ).trim();


        let foundUser = null;


        /* ---------------------------------------------
           Match by email first
        --------------------------------------------- */

        if (storedEmail) {

            foundUser = users.find(user => {

                return String(user.email || "")
                    .trim()
                    .toLowerCase() === storedEmail;

            });

        }


        /* ---------------------------------------------
           Fallback to account number
        --------------------------------------------- */

        if (!foundUser && storedAccountNumber) {

            foundUser = users.find(user => {

                return String(user.accountNumber || "")
                    .trim() === storedAccountNumber;

            });

        }


        return foundUser || null;

    }


    /* =====================================================
       5. LOAD CURRENT USER
    ===================================================== */

    function loadCurrentUser() {

        users = getStoredUsers();

        const storedCurrentUser = getStoredCurrentUser();


        if (!storedCurrentUser) {

            window.location.href = "./login.html";

            return false;

        }


        const fullUser = findUserInUsers(storedCurrentUser);


        if (fullUser) {

            /*
             * reenUsers is the main source of truth.
             * This makes sure changes from the Accounts page
             * and Overview page are reflected here.
             */

            currentUser = {
                ...storedCurrentUser,
                ...fullUser
            };

        } else {

            currentUser = {
                ...storedCurrentUser
            };

        }


        /* ---------------------------------------------
           Normalize arrays
        --------------------------------------------- */

        if (!Array.isArray(currentUser.transactions)) {

            currentUser.transactions = [];

        }


        if (!Array.isArray(currentUser.accounts)) {

            currentUser.accounts = [];

        }


        if (!Array.isArray(currentUser.notifications)) {

            currentUser.notifications = [];

        }


        return true;

    }


    if (!loadCurrentUser()) {
        return;
    }


    setupResponsiveTransactionTable();


    /* =====================================================
       6. SAVE CURRENT USER
    ===================================================== */

    function saveCurrentUser() {

        if (!currentUser) {
            return;
        }


        users = getStoredUsers();


        const userIndex = users.findIndex(user => {

            const userEmail = String(user.email || "")
                .trim()
                .toLowerCase();

            const currentEmail = String(currentUser.email || "")
                .trim()
                .toLowerCase();


            if (
                userEmail &&
                currentEmail &&
                userEmail === currentEmail
            ) {

                return true;

            }


            return String(user.accountNumber || "") ===
                String(currentUser.accountNumber || "");

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
                JSON.stringify(currentUser)
            );

        } catch (error) {

            console.error(
                "Unable to update session currentUser:",
                error
            );

        }


        try {

            localStorage.setItem(
                SESSION_KEY,
                JSON.stringify(currentUser)
            );

        } catch (error) {

            console.error(
                "Unable to update local currentUser:",
                error
            );

        }

    }


    /* =====================================================
       7. GENERAL FORMATTERS
    ===================================================== */

    function formatCurrency(amount) {

        const number = Number(amount) || 0;


        return number.toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    }


    function formatNumber(amount) {

        const number = Number(amount) || 0;


        return number.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    }


    function escapeHTML(value) {

        const div = document.createElement("div");

        div.textContent = value ?? "";

        return div.innerHTML;

    }


    /* =====================================================
       8. DATE HELPERS
    ===================================================== */

    function getTransactionDate(transaction) {

        if (transaction instanceof Date) {
            return transaction;
        }

        if (typeof transaction === "number") {
            return transaction;
        }

        if (typeof transaction === "string") {
            return transaction;
        }

        return (
            transaction?.createdAt ||
            transaction?.date ||
            transaction?.timestamp ||
            transaction?.time ||
            null
        );

    }


    function parseTransactionDate(transaction) {

        const rawDate = getTransactionDate(transaction);

        if (!rawDate) {
            return null;
        }

        const parsedDate =
            rawDate instanceof Date
                ? new Date(rawDate.getTime())
                : new Date(rawDate);

        if (Number.isNaN(parsedDate.getTime())) {
            return null;
        }

        return parsedDate;

    }


    function formatTransactionDate(transaction) {

        const parsedDate = parseTransactionDate(transaction);

        if (!parsedDate) {
            return "—";
        }

        const day = String(
            parsedDate.getDate()
        ).padStart(2, "0");

        const month = parsedDate.toLocaleString(
            "en-US",
            {
                month: "short"
            }
        );

        const year = parsedDate.getFullYear();

        const hours = String(
            parsedDate.getHours()
        ).padStart(2, "0");

        const minutes = String(
            parsedDate.getMinutes()
        ).padStart(2, "0");

        return `${day}.${month}.${year} - ${hours}:${minutes}`;

    }


    function formatLongDate(transaction) {

        const parsedDate = parseTransactionDate(transaction);

        if (!parsedDate) {
            return "—";
        }

        return parsedDate.toLocaleString(
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
       9. TRANSACTION TYPE
    ===================================================== */

    function getTransactionType(transaction) {

        const values = [

            transaction?.direction,
            transaction?.type,
            transaction?.transactionType,
            transaction?.category

        ];


        const combined = values
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


        /*
         * If the transaction does not explicitly specify
         * its direction, use the sign of amount.
         */

        const amount = Number(
            transaction?.amount ??
            transaction?.value ??
            0
        );


        if (amount < 0) {
            return "expense";
        }


        return "income";

    }


    /* =====================================================
       10. TRANSACTION LABEL
    ===================================================== */

    function getTransactionTitle(transaction) {

        return (
            transaction?.title ||
            transaction?.name ||
            transaction?.description ||
            transaction?.category ||
            transaction?.accountName ||
            transaction?.recipient ||
            transaction?.sender ||
            "Transaction"
        );

    }


    function getTransactionDescription(transaction) {

        const title = getTransactionTitle(transaction);


        if (
            transaction?.description &&
            transaction.description !== title
        ) {

            return transaction.description;

        }


        if (getTransactionType(transaction) === "income") {

            return "Money received";

        }


        return "Money sent";

    }


    /* =====================================================
       11. ACCOUNT NAME
    ===================================================== */

    function getAccountName(transaction) {

        return (
            transaction?.account ||
            transaction?.accountName ||
            transaction?.sourceAccount ||
            transaction?.destinationAccount ||
            "Main Account"
        );

    }


    /* =====================================================
       12. PAYMENT METHOD
    ===================================================== */

    function getPaymentMethod(transaction) {

        return (
            transaction?.paymentMethod ||
            transaction?.method ||
            transaction?.bank ||
            "Direct"
        );

    }


    /* =====================================================
       13. STATUS
    ===================================================== */

    function getTransactionStatus(transaction) {

        const status = String(
            transaction?.status || "completed"
        )
            .trim()
            .toLowerCase();


        if (status === "cancelled") {
            return "canceled";
        }


        if (
            status === "pending" ||
            status === "completed" ||
            status === "canceled"
        ) {

            return status;

        }


        return "completed";

    }


    /* =====================================================
       14. TRANSACTION AMOUNT
    ===================================================== */

    function getTransactionAmount(transaction) {

        return Math.abs(
            Number(
                transaction?.amount ??
                transaction?.value ??
                0
            )
        );

    }


    /* =====================================================
       15. TRANSACTION ID
    ===================================================== */

    function getTransactionId(transaction, index) {

        return (
            transaction?.id ||
            transaction?.transactionId ||
            `transaction-${index}-${getTransactionDate(transaction) || ""}`
        );

    }


    /* =====================================================
       16. NORMALIZE TRANSACTIONS
    ===================================================== */

    function normalizeTransactions() {

        if (!currentUser) {
            return [];
        }

        const collected = [];
        const seen = new Set();

        function addTransaction(transaction, fallbackAccount = "") {

            if (!transaction || typeof transaction !== "object") {
                return;
            }

            const source = {
                ...transaction
            };

            if (
                !source.account &&
                !source.accountName &&
                fallbackAccount
            ) {
                source.account = fallbackAccount;
            }

            const rawId =
                source.id ||
                source.transactionId ||
                "";

            const fallbackKey = [
                source.type || "",
                source.transactionType || "",
                source.title || source.name || "",
                source.amount ?? "",
                getAccountName(source),
                getTransactionDate(source) || ""
            ]
                .join("|")
                .toLowerCase();

            const uniqueKey =
                rawId
                    ? `id:${String(rawId)}`
                    : `data:${fallbackKey}`;

            if (seen.has(uniqueKey)) {
                return;
            }

            seen.add(uniqueKey);

            const index = collected.length;

            collected.push({
                ...source,

                _id: getTransactionId(
                    source,
                    index
                ),

                _type: getTransactionType(
                    source
                ),

                _title: getTransactionTitle(
                    source
                ),

                _description: getTransactionDescription(
                    source
                ),

                _account: getAccountName(
                    source
                ),

                _paymentMethod: getPaymentMethod(
                    source
                ),

                _status: getTransactionStatus(
                    source
                ),

                _amount: getTransactionAmount(
                    source
                ),

                _date: parseTransactionDate(
                    source
                )
            });

        }


        /*
         * Primary transaction source.
         * Overview and Accounts should write here.
         */
        if (Array.isArray(currentUser.transactions)) {

            currentUser.transactions.forEach(
                transaction => {
                    addTransaction(transaction);
                }
            );

        }


        /*
         * Also read transactions stored directly
         * inside custom accounts.
         *
         * This prevents custom-account transactions
         * from disappearing when an Accounts-page
         * implementation stores them on the account.
         */
        if (Array.isArray(currentUser.accounts)) {

            currentUser.accounts.forEach(account => {

                const accountName =
                    String(
                        account?.name ||
                        account?.title ||
                        account?.accountName ||
                        ""
                    ).trim();

                if (
                    !Array.isArray(
                        account?.transactions
                    )
                ) {
                    return;
                }

                account.transactions.forEach(
                    transaction => {

                        addTransaction(
                            transaction,
                            accountName
                        );

                    }
                );

            });

        }


        return collected.sort(
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

    }


    /* =====================================================
       17. UPDATE USER HEADER
    ===================================================== */

    function renderHeader() {

        if (!currentUser) {
            return;
        }


        const fullName = String(
            currentUser.name || "User"
        ).trim();


        /*
         * Display the second name when available,
         * matching the Overview behavior.
         */

        const nameParts = fullName
            .split(/\s+/)
            .filter(Boolean);


        let displayName = nameParts[0] || "User";


        if (nameParts.length >= 2) {

            displayName = nameParts[1];

        }


        if (headerUserName) {

            headerUserName.textContent = displayName;

        }


        if (headerAccountNumber) {

            headerAccountNumber.textContent =
                currentUser.accountNumber || "—";

        }


        renderProfileImage();

    }


    /* =====================================================
       18. PROFILE IMAGE
    ===================================================== */

    function renderProfileImage() {

        if (!headerProfileImage || !headerProfileInitials) {
            return;
        }


        const profileImage = currentUser?.profileImage || "";


        if (profileImage) {

            headerProfileImage.src = profileImage;

            headerProfileImage.classList.remove("hidden");

            headerProfileInitials.classList.add("hidden");

        } else {

            headerProfileImage.src = "";

            headerProfileImage.classList.add("hidden");

            const name = String(
                currentUser?.name || "User"
            ).trim();


            const initials = name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(word => word.charAt(0).toUpperCase())
                .join("");


            headerProfileInitials.textContent =
                initials || "U";


            headerProfileInitials.classList.remove("hidden");

        }

    }


    /* =====================================================
       19. ACCOUNT BALANCES
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

        const mainBalance = getMainBalance();
        const schoolBalance = getSchoolBalance();
        const holidayBalance = getHolidayBalance();


        if (mainAccountBalance) {

            mainAccountBalance.textContent =
                mainBalanceVisible
                    ? formatCurrency(mainBalance)
                    : "₦••••••";

        }


        if (schoolAccountBalance) {

            schoolAccountBalance.textContent =
                schoolBalanceVisible
                    ? formatCurrency(schoolBalance)
                    : "₦••••••";

        }


        if (holidayAccountBalance) {

            holidayAccountBalance.textContent =
                holidayBalanceVisible
                    ? formatCurrency(holidayBalance)
                    : "₦••••••";

        }

    }


    /* =====================================================
       20. BALANCE TOGGLE
    ===================================================== */

    function setEyeIcon(button, visible) {

        if (!button) {
            return;
        }


        const icon = button.querySelector("i");


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
       21. DYNAMIC ACCOUNT FILTER
    ===================================================== */

    function renderAccountFilterOptions() {

        if (!transactionAccountFilter) {
            return;
        }


        const existingValue =
            transactionAccountFilter.value || "all";


        const accounts = [];


        /*
         * Default accounts
         */

        accounts.push(
            "Main Account",
            "School Savings",
            "Holiday Plan"
        );


        /*
         * Custom accounts
         */

        if (Array.isArray(currentUser?.accounts)) {

            currentUser.accounts.forEach(account => {

                const name = String(
                    account?.name ||
                    account?.title ||
                    account?.accountName ||
                    ""
                ).trim();


                if (
                    name &&
                    !accounts.some(
                        existing =>
                            existing.toLowerCase() ===
                            name.toLowerCase()
                    )
                ) {

                    accounts.push(name);

                }

            });

        }


        transactionAccountFilter.innerHTML = "";


        const allOption = document.createElement("option");

        allOption.value = "all";
        allOption.textContent = "All Accounts";

        transactionAccountFilter.appendChild(
            allOption
        );


        accounts.forEach(accountName => {

            const option =
                document.createElement("option");


            /*
             * We keep the actual account name as the value.
             * This allows custom accounts to work too.
             */

            option.value = accountName;
            option.textContent = accountName;


            transactionAccountFilter.appendChild(
                option
            );

        });


        /*
         * Restore previous filter when possible.
         */

        const matchingOption =
            [...transactionAccountFilter.options]
                .find(option =>
                    option.value === existingValue
                );


        if (matchingOption) {

            transactionAccountFilter.value =
                existingValue;

        } else {

            transactionAccountFilter.value = "all";

        }

    }


    /* =====================================================
       22. ACCOUNT FILTER MATCHING
    ===================================================== */

    function accountMatchesFilter(
        transaction,
        selectedAccount
    ) {

        if (
            !selectedAccount ||
            selectedAccount === "all"
        ) {

            return true;

        }


        const transactionAccount =
            String(
                transaction._account || ""
            )
                .trim()
                .toLowerCase();


        const selected =
            String(selectedAccount)
                .trim()
                .toLowerCase();


        /*
         * Direct match
         */

        if (transactionAccount === selected) {
            return true;
        }


        /*
         * Handle older transaction records
         * that used shorthand names.
         */

        if (
            selected === "main account" &&
            (
                transactionAccount === "main" ||
                transactionAccount === "mainaccount"
            )
        ) {

            return true;

        }


        if (
            selected === "school savings" &&
            (
                transactionAccount === "school" ||
                transactionAccount === "schoolsavings"
            )
        ) {

            return true;

        }


        if (
            selected === "holiday plan" &&
            (
                transactionAccount === "holiday" ||
                transactionAccount === "holidayplan"
            )
        ) {

            return true;

        }


        return false;

    }


    /* =====================================================
       23. TYPE FILTER
    ===================================================== */

    function typeMatchesFilter(
        transaction,
        selectedType
    ) {

        if (
            !selectedType ||
            selectedType === "all"
        ) {

            return true;

        }


        return transaction._type === selectedType;

    }


    /* =====================================================
       24. STATUS FILTER
    ===================================================== */

    function statusMatchesFilter(
        transaction,
        selectedStatus
    ) {

        if (
            !selectedStatus ||
            selectedStatus === "all"
        ) {

            return true;

        }


        return transaction._status === selectedStatus;

    }


    /* =====================================================
       25. DATE FILTER
    ===================================================== */

    function dateMatchesFilter(
        transaction,
        selectedDate
    ) {

        if (
            !selectedDate ||
            selectedDate === "all"
        ) {

            return true;

        }


        const transactionDate =
            transaction._date;


        if (!transactionDate) {
            return false;
        }


        const now = new Date();


        if (selectedDate === "today") {

            return (
                transactionDate.getFullYear() ===
                    now.getFullYear() &&

                transactionDate.getMonth() ===
                    now.getMonth() &&

                transactionDate.getDate() ===
                    now.getDate()
            );

        }


        const millisecondsPerDay =
            24 * 60 * 60 * 1000;


        const difference =
            now.getTime() -
            transactionDate.getTime();


        if (selectedDate === "7days") {

            return (
                difference >= 0 &&
                difference <=
                    7 * millisecondsPerDay
            );

        }


        if (selectedDate === "30days") {

            return (
                difference >= 0 &&
                difference <=
                    30 * millisecondsPerDay
            );

        }


        if (selectedDate === "90days") {

            return (
                difference >= 0 &&
                difference <=
                    90 * millisecondsPerDay
            );

        }


        return true;

    }


    /* =====================================================
       26. SEARCH FILTER
    ===================================================== */

    function searchMatches(
        transaction,
        searchTerm
    ) {

        if (!searchTerm) {
            return true;
        }


        const searchText = [

            transaction._title,
            transaction._description,
            transaction._account,
            transaction._paymentMethod,
            transaction._status,
            transaction?.bank,
            transaction?.category,
            transaction?.recipient,
            transaction?.sender

        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


        return searchText.includes(
            searchTerm.toLowerCase()
        );

    }


    /* =====================================================
       27. FILTER ALL TRANSACTIONS
    ===================================================== */

    function getFilteredTransactions() {

        const transactions =
            normalizeTransactions();


        const searchTerm =
            String(
                transactionSearch?.value || ""
            )
                .trim()
                .toLowerCase();


        const accountFilter =
            transactionAccountFilter?.value ||
            "all";


        const typeFilter =
            transactionTypeFilter?.value ||
            "all";


        const statusFilter =
            transactionStatusFilter?.value ||
            "all";


        const dateFilter =
            transactionDateFilter?.value ||
            "all";


        return transactions.filter(transaction => {

            return (

                searchMatches(
                    transaction,
                    searchTerm
                ) &&

                accountMatchesFilter(
                    transaction,
                    accountFilter
                ) &&

                typeMatchesFilter(
                    transaction,
                    typeFilter
                ) &&

                statusMatchesFilter(
                    transaction,
                    statusFilter
                ) &&

                dateMatchesFilter(
                    transaction,
                    dateFilter
                )

            );

        });

    }


    /* =====================================================
       28. PAYMENT METHOD ICON
    ===================================================== */

    function getPaymentIcon(paymentMethod) {

        const method = String(
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
       29. RENDER TRANSACTION ROW
    ===================================================== */

    function createTransactionRow(transaction) {

        const isIncome =
            transaction._type === "income";

        const sign =
            isIncome ? "+" : "-";

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
            isIncome ? "+" : "−";

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
            "directPay";

        const amount =
            Number(transaction._amount || 0);

        /*
         * _date is already a Date object.
         * Passing it back through the date formatter
         * is now supported by the fixed date helpers.
         */
        const date =
            transaction._date
                ? formatTransactionDate(
                    transaction._date
                )
                : "—";

        const status =
            transaction._status ||
            "completed";

        const row =
            document.createElement("div");

        /*
         * IMPORTANT:
         *
         * Do not rely on a Tailwind arbitrary
         * grid-cols class inside this JavaScript file.
         *
         * Tailwind may not generate that class if
         * transaction.js is not included in the
         * Tailwind content paths.
         *
         * Inline gridTemplateColumns guarantees that
         * every transaction row uses the exact same
         * five columns as the HTML table header.
         */
        row.style.display = "grid";

        row.style.gridTemplateColumns =
            "minmax(330px,1.6fr) " +
            "minmax(220px,1.2fr) " +
            "minmax(200px,1fr) " +
            "minmax(220px,1fr) " +
            "120px";

        /*
         * Never allow the five Figma columns to collapse
         * on phones. The card scrolls horizontally instead.
         */
        row.style.minWidth =
            `${TRANSACTION_TABLE_MIN_WIDTH}px`;

        row.style.boxSizing = "border-box";

        row.style.alignItems = "center";

        row.className = `
            min-h-[86px]
            px-8
            border-b
            border-[#edf1ef]
            last:border-b-0
            hover:bg-[#fbfdfc]
            transition-colors
            cursor-pointer
        `;

        row.innerHTML = `

            <!-- ================= NAME ================= -->
            <div class="flex items-center gap-3 min-w-0">

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

                <div class="min-w-0 pr-6">

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


            <!-- ================= PAYMENT METHOD ================= -->
            <div
                class="
                    flex
                    items-center
                    gap-3
                    min-w-0
                    pr-6
                "
            >

                <span
                    class="
                        w-[18px]
                        h-[18px]
                        flex
                        items-center
                        justify-center
                        text-[#7f8b96]
                        shrink-0
                    "
                >
                    <i
                        class="
                            fa-solid
                            ${getPaymentIcon(paymentMethod)}
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
                    ${escapeHTML(paymentMethod)}
                </span>

            </div>


            <!-- ================= DATE ================= -->
            <div
                class="
                    text-[13px]
                    text-[#52627a]
                    whitespace-nowrap
                "
            >
                ${date}
            </div>


            <!-- ================= AMOUNT ================= -->
            <div
                class="
                    ${amountClass}
                    text-[14px]
                    font-medium
                    whitespace-nowrap
                "
            >
                ${sign}₦${formatNumber(amount)}
            </div>


            <!-- ================= STATUS ================= -->
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
       30. RENDER TRANSACTIONS
    ===================================================== */

    function renderTransactions() {

        if (!transactionList) {
            return;
        }


        /*
         * IMPORTANT:
         *
         * Unlike Overview, this page does NOT use slice(0, 5).
         *
         * It displays ALL transactions.
         */

        const filteredTransactions =
            getFilteredTransactions();


        transactionList.innerHTML = "";


        if (
            filteredTransactions.length === 0
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


            return;

        }


        if (emptyTransactions) {

            emptyTransactions.classList.add(
                "hidden"
            );

        }


        filteredTransactions.forEach(
            (transaction, index) => {

                transactionList.appendChild(
                    createTransactionRow(
                        transaction,
                        index
                    )
                );

            }
        );


        if (transactionResultCount) {

            const count =
                filteredTransactions.length;


            transactionResultCount.textContent =
                `${count} transaction${count === 1 ? "" : "s"}`;

        }

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
            transaction._type === "income";


        const amountColor =
            isIncome
                ? "text-[#16a875]"
                : "text-[#ef5965]";


        const amountPrefix =
            isIncome ? "+" : "-";


        const paymentMethod =
            transaction._paymentMethod;


        const bank =
            transaction?.bank || "—";


        const accountNumber =
            transaction?.accountNumber || "—";


        transactionDetailsContent.innerHTML = `

            <div class="rounded-[14px] bg-[#f5faf8] p-[18px]">

                <div class="flex items-center justify-between">

                    <div>

                        <p
                            class="text-[10px] text-[#989f9c]"
                        >
                            Amount
                        </p>

                        <p
                            class="mt-[5px] text-[23px] font-bold ${amountColor}"
                        >
                            ${amountPrefix}${formatCurrency(transaction._amount)}
                        </p>

                    </div>


                    <div
                        class="flex h-[42px] w-[42px] items-center justify-center rounded-full ${
                            isIncome
                                ? "bg-[#e4f8ef] text-[#18a875]"
                                : "bg-[#ffedf0] text-[#ed5965]"
                        }"
                    >

                        <i
                            class="fa-solid ${
                                isIncome
                                    ? "fa-plus"
                                    : "fa-minus"
                            } text-[12px]"
                        ></i>

                    </div>

                </div>

            </div>


            <div class="mt-[18px] space-y-[13px]">

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
                    paymentMethod
                )}

                ${createDetailRow(
                    "Date",
                    formatLongDate(transaction)
                )}

                ${createDetailRow(
                    "Status",
                    transaction._status
                )}

                ${
                    transaction?.bank
                        ? createDetailRow(
                            "Bank",
                            bank
                        )
                        : ""
                }

                ${
                    transaction?.accountNumber
                        ? createDetailRow(
                            "Account Number",
                            accountNumber
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
                class="flex items-start justify-between gap-[20px] border-b border-[#f0f3f2] pb-[11px]"
            >

                <span
                    class="text-[10px] text-[#9aa19e]"
                >
                    ${escapeHTML(label)}
                </span>

                <span
                    class="text-right text-[10px] font-medium text-[#424946]"
                >
                    ${escapeHTML(value || "—")}
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
            event => {

                event.stopPropagation();

                const box = document.getElementById("transactionSearchBox");
                if (!box || !transactionSearch) return;

                const shouldOpen = box.classList.contains("hidden");
                box.classList.toggle("hidden", !shouldOpen);
                searchButton.setAttribute("aria-expanded", String(shouldOpen));

                if (shouldOpen) {
                    requestAnimationFrame(() => transactionSearch.focus());
                }

            }
        );

    }


    /* =====================================================
       33. FILTER EVENTS
    ===================================================== */

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

                if (transactionSearch) transactionSearch.value = "";
                if (transactionAccountFilter) transactionAccountFilter.value = "all";
                if (transactionTypeFilter) transactionTypeFilter.value = "all";
                if (transactionStatusFilter) transactionStatusFilter.value = "all";
                if (transactionDateFilter) transactionDateFilter.value = "all";

                clearTransactionFilters.classList.add("hidden");
                clearTransactionFilters.classList.remove("flex");
                renderTransactions();
                transactionSearch?.focus();

            }
        );

    }


    if (transactionSearch) {
        transactionSearch.addEventListener("input", () => {
            const hasValue = transactionSearch.value.trim().length > 0;
            clearTransactionFilters?.classList.toggle("hidden", !hasValue);
            clearTransactionFilters?.classList.toggle("flex", hasValue);
            renderTransactions();
        });
    }


    document.addEventListener("click", event => {
        const wrapper = document.getElementById("transactionSearchWrapper");
        if (wrapper && !wrapper.contains(event.target)) {
            document.getElementById("transactionSearchBox")?.classList.add("hidden");
            searchButton?.setAttribute("aria-expanded", "false");
        }
    });


    /* =====================================================
       35. NOTIFICATIONS
    ===================================================== */

    function renderNotifications() {

        if (!notificationList) {
            return;
        }


        const notifications =
            Array.isArray(currentUser?.notifications)
                ? currentUser.notifications
                : [];


        notificationList.innerHTML = "";


        const unreadNotifications =
            notifications.filter(
                notification =>
                    !notification.read
            );


        if (notificationUnreadCount) {

            notificationUnreadCount.textContent =
                `${unreadNotifications.length} unread`;

        }


        if (notificationDot) {

            if (unreadNotifications.length > 0) {

                notificationDot.textContent =
                    unreadNotifications.length > 99
                        ? "99+"
                        : unreadNotifications.length;

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


        if (notifications.length === 0) {

            notificationList.innerHTML = `

                <div class="px-5 py-10 text-center">

                    <div
                        class="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#edf9f4]"
                    >

                        <i
                            class="fa-regular fa-bell text-[#1aaa78]"
                        ></i>

                    </div>

                    <p
                        class="mt-3 text-[11px] font-medium text-[#626966]"
                    >
                        No notifications
                    </p>

                    <p
                        class="mt-1 text-[9px] text-[#a0a6a3]"
                    >
                        You're all caught up.
                    </p>

                </div>

            `;

            return;

        }


        notifications.forEach(
            (notification, index) => {

                const isRead =
                    Boolean(notification.read);


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


                const notificationElement =
                    document.createElement("div");


                notificationElement.className = `
                    flex
                    gap-3
                    border-b
                    border-gray-100
                    px-4
                    py-4
                    ${isRead ? "bg-white" : "bg-[#f5fbf8]"}
                `;


                notificationElement.innerHTML = `

                    <div
                        class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5f8f0] text-[#19a875]"
                    >

                        <i
                            class="fa-regular fa-bell text-[11px]"
                        ></i>

                    </div>


                    <div class="min-w-0 flex-1">

                        <div
                            class="flex items-start justify-between gap-2"
                        >

                            <p
                                class="text-[11px] font-semibold text-[#343a37]"
                            >
                                ${escapeHTML(title)}
                            </p>

                            ${
                                !isRead
                                    ? `
                                        <span
                                            class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1baa78]"
                                        ></span>
                                    `
                                    : ""
                            }

                        </div>


                        <p
                            class="mt-1 text-[10px] leading-4 text-[#8d9491]"
                        >
                            ${escapeHTML(message)}
                        </p>


                        ${
                            date
                                ? `
                                    <p
                                        class="mt-2 text-[8px] text-[#a5aaa8]"
                                    >
                                        ${escapeHTML(
                                            formatNotificationDate(date)
                                        )}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                `;


                notificationElement.addEventListener(
                    "click",
                    () => {

                        if (
                            currentUser.notifications &&
                            currentUser.notifications[index]
                        ) {

                            currentUser.notifications[index].read =
                                true;

                            saveCurrentUser();

                            renderNotifications();

                        }

                    }
                );


                notificationList.appendChild(
                    notificationElement
                );

            }
        );

    }


    function formatNotificationDate(date) {

        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return String(date);

        }


        return parsedDate.toLocaleString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* =====================================================
       36. OPEN / CLOSE NOTIFICATIONS
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

    function goToPage(path) {

        window.location.href = path;

    }


    if (overviewNav) {

        overviewNav.addEventListener(
            "click",
            event => {

                event.preventDefault();

                goToPage("./overview.html");

            }
        );

    }


    if (accountsNav) {

        accountsNav.addEventListener(
            "click",
            event => {

                event.preventDefault();

                goToPage("./account.html");

            }
        );

    }


    if (profileNav) {

        profileNav.addEventListener(
            "click",
            event => {

                event.preventDefault();

                goToPage("./profile.html");

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

                window.location.href =
                    "./profile.html";

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

                /*
                 * Remove the active session.
                 *
                 * reenUsers remains untouched.
                 */

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

            if (event.key !== "Escape") {
                return;
            }


            closeTransactionModal();

            closeLogoutModal();

            closeNotificationDropdown();

            closeSidebar();

        }
    );


    /* =====================================================
       44. REFRESH DATA FROM STORAGE
    ===================================================== */

    function refreshFromStorage() {

        const storedCurrentUser =
            getStoredCurrentUser();


        if (!storedCurrentUser) {
            return;
        }


        const freshUsers =
            getStoredUsers();


        const freshUser =
            findUserInUsers(
                storedCurrentUser
            );


        if (freshUser) {

            currentUser = {
                ...storedCurrentUser,
                ...freshUser
            };

        } else {

            currentUser = {
                ...storedCurrentUser
            };

        }


        if (!Array.isArray(currentUser.transactions)) {

            currentUser.transactions = [];

        }


        if (!Array.isArray(currentUser.accounts)) {

            currentUser.accounts = [];

        }


        if (!Array.isArray(currentUser.notifications)) {

            currentUser.notifications = [];

        }


        renderHeader();

        renderBalances();

        renderAccountFilterOptions();

        renderTransactions();

        renderNotifications();

    }


    /* =====================================================
       45. STORAGE EVENT
       -----------------------------------------------------
       Useful if another Reen Bank page is open in another tab.
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {
            setupResponsiveTransactionTable();
        }
    );


    window.addEventListener(
        "storage",
        event => {

            if (
                event.key === USERS_KEY ||
                event.key === SESSION_KEY
            ) {

                refreshFromStorage();

            }

        }
    );


    /* =====================================================
       46. PAGE SHOW
       -----------------------------------------------------
       Re-load data when returning to this page.
    ===================================================== */

    window.addEventListener(
        "pageshow",
        () => {

            refreshFromStorage();

        }
    );


    /* =====================================================
       47. INITIAL RENDER
    ===================================================== */

    renderHeader();

    renderBalances();

    renderAccountFilterOptions();

    renderTransactions();

    renderNotifications();


    /* =====================================================
       48. INITIAL EYE ICONS
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

});