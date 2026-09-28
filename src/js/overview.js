/* =========================================================
   REEN BANK — OVERVIEW DASHBOARD
   COMPLETE FIXED JAVASCRIPT

   Storage:
   - reenUsers      -> localStorage
   - currentUser    -> sessionStorage / localStorage

   Features:
   - Current account balance
   - Income
   - Expenses
   - Recent transactions
   - Deposits
   - Withdrawals
   - Custom accounts
   - Profile information
   - Balance visibility
   - Sidebar
   - Logout
   - Automatic data refresh
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       HELPER
    ===================================================== */

    const $ = (id) => document.getElementById(id);

    /* =====================================================
       STORAGE
    ===================================================== */

    let users = [];
    let currentUser = null;
    let userIndex = -1;

    /* =====================================================
       LOAD CURRENT USER
    ===================================================== */

    function loadCurrentUser() {

        users =
            JSON.parse(
                localStorage.getItem("reenUsers")
            ) || [];

        let storedUser =
            sessionStorage.getItem("currentUser");

        if (!storedUser) {
            storedUser =
                localStorage.getItem("currentUser");
        }

        if (!storedUser) {

            console.error(
                "No currentUser found."
            );

            window.location.href =
                "./register.html";

            return false;
        }

        let loggedInUser;

        try {

            loggedInUser =
                JSON.parse(storedUser);

        } catch (error) {

            console.error(
                "Invalid currentUser:",
                error
            );

            window.location.href =
                "./register.html";

            return false;
        }

        if (
            !loggedInUser ||
            !loggedInUser.email
        ) {

            window.location.href =
                "./register.html";

            return false;
        }

        userIndex =
            users.findIndex(
                user =>
                    user.email &&
                    user.email.toLowerCase() ===
                    loggedInUser.email.toLowerCase()
            );

        if (userIndex === -1) {

            console.error(
                "User does not exist in reenUsers."
            );

            window.location.href =
                "./register.html";

            return false;
        }

        /*
            IMPORTANT:

            Always use the complete user stored in
            reenUsers.

            Do NOT use the lightweight currentUser
            object as the main source of account data.
        */

        currentUser =
            users[userIndex];

        normalizeUser();

        return true;
    }

    /* =====================================================
       NORMALIZE USER
    ===================================================== */

    function normalizeUser() {

        if (!currentUser) {
            return;
        }

        currentUser.balance =
            Number(currentUser.balance) || 0;

        currentUser.income =
            Number(currentUser.income) || 0;

        currentUser.expense =
            Number(currentUser.expense) || 0;

        currentUser.schoolSavings =
            Number(currentUser.schoolSavings) || 0;

        currentUser.holidayBalance =
            Number(currentUser.holidayBalance) || 0;

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
    }

    /* =====================================================
       REFRESH USER FROM LOCAL STORAGE
    ===================================================== */

    function refreshUserFromStorage() {

        const latestUsers =
            JSON.parse(
                localStorage.getItem("reenUsers")
            ) || [];

        if (!currentUser || !currentUser.email) {
            return;
        }

        const latestIndex =
            latestUsers.findIndex(
                user =>
                    user.email &&
                    user.email.toLowerCase() ===
                    currentUser.email.toLowerCase()
            );

        if (latestIndex === -1) {
            return;
        }

        users = latestUsers;

        userIndex = latestIndex;

        currentUser =
            latestUsers[latestIndex];

        normalizeUser();
    }

    /* =====================================================
       SAVE USER
    ===================================================== */

    function saveUser() {

        if (
            !currentUser ||
            userIndex === -1
        ) {
            return;
        }

        normalizeUser();

        users[userIndex] =
            currentUser;

        localStorage.setItem(
            "reenUsers",
            JSON.stringify(users)
        );

        /*
            Only store lightweight login information
            in currentUser.
        */

        const loggedInUser = {

            name:
                currentUser.name || "",

            email:
                currentUser.email || "",

            accountNumber:
                currentUser.accountNumber || ""

        };

        sessionStorage.setItem(
            "currentUser",
            JSON.stringify(loggedInUser)
        );

        localStorage.setItem(
            "currentUser",
            JSON.stringify(loggedInUser)
        );
    }

    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    function formatMoney(value) {

        const amount =
            Number(value) || 0;

        return amount.toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
    }

    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDate(dateValue) {

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
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
    }

    /* =====================================================
       TRANSACTION TYPE
    ===================================================== */

    function getTransactionType(transaction) {

        if (!transaction) {
            return "unknown";
        }

        /*
            Income / Deposit
        */

        if (
            transaction.type === "income" ||
            transaction.transactionType === "deposit" ||
            transaction.direction === "credit"
        ) {
            return "income";
        }

        /*
            Expense / Withdrawal
        */

        if (
            transaction.type === "expense" ||
            transaction.transactionType === "withdrawal" ||
            transaction.direction === "debit"
        ) {
            return "expense";
        }

        return "unknown";
    }

    /* =====================================================
       UPDATE USER NAME
    ===================================================== */

    function updateUserInformation() {

        if (!currentUser) {
            return;
        }

        const fullName =
            currentUser.name || "User";

        const firstName =
            fullName
                .trim()
                .split(/\s+/)[0] || "User";

        /*
            First name
        */

        [
            "headerUserName",
            "userName",
            "welcomeName"
        ].forEach(id => {

            const element = $(id);

            if (element) {
                element.textContent =
                    firstName;
            }
        });

        /*
            Full name
        */

        [
            "fullName",
            "profileName",
            "profileFullName"
        ].forEach(id => {

            const element = $(id);

            if (element) {
                element.textContent =
                    fullName;
            }
        });

        /*
            Account number
        */

        [
            "accountNumber",
            "profileAccountNumber"
        ].forEach(id => {

            const element = $(id);

            if (element) {

                element.textContent =
                    currentUser.accountNumber ||
                    "--------";
            }
        });

        /*
            Profile initials
        */

        const initials =
            fullName
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map(
                    name =>
                        name
                            .charAt(0)
                            .toUpperCase()
                )
                .join("");

        [
            "profileInitials",
            "profileAvatarInitials"
        ].forEach(id => {

            const element = $(id);

            if (element) {
                element.textContent =
                    initials || "U";
            }
        });
    }

    /* =====================================================
       UPDATE CURRENT ACCOUNT BALANCE
    ===================================================== */

    function updateCurrentAccountBalance() {

        /*
            VERY IMPORTANT:

            Reload latest data before displaying
            the balance.
        */

        refreshUserFromStorage();

        const balance =
            Number(currentUser.balance) || 0;

        console.log(
            "Reen Bank Current Balance:",
            balance
        );

        const formattedBalance =
            `₦${formatMoney(balance)}`;

        /*
            We support all common IDs so the
            Overview continues working even if
            your HTML uses one of these.
        */

        const balanceIDs = [

            "currentAccountBalance",

            "accountBalance",

            "balance",

            "totalBalance",

            "mainBalance",

            "overviewBalance",

            "mainAccountBalance",

            "currentBalance"

        ];

        balanceIDs.forEach(id => {

            const element = $(id);

            if (!element) {
                return;
            }

            /*
                Do not replace hidden balance.
            */

            if (
                element.dataset.balanceHidden ===
                "true"
            ) {

                element.textContent =
                    "••••••";

            } else {

                element.textContent =
                    formattedBalance;
            }
        });
    }

    /* =====================================================
       UPDATE INCOME
    ===================================================== */

    function updateIncome() {

        const income =
            Number(currentUser.income) || 0;

        const formatted =
            `₦${formatMoney(income)}`;

        [
            "income",
            "totalIncome",
            "incomeAmount",
            "overviewIncome",
            "incomeBalance"
        ].forEach(id => {

            const element = $(id);

            if (element) {
                element.textContent =
                    formatted;
            }
        });
    }

    /* =====================================================
       UPDATE EXPENSE
    ===================================================== */

    function updateExpense() {

        const expense =
            Number(currentUser.expense) || 0;

        const formatted =
            `₦${formatMoney(expense)}`;

        [
            "expense",
            "totalExpense",
            "expenseAmount",
            "overviewExpense",
            "expenseBalance"
        ].forEach(id => {

            const element = $(id);

            if (element) {
                element.textContent =
                    formatted;
            }
        });
    }

    /* =====================================================
       UPDATE BALANCE
    ===================================================== */

    function updateBalances() {

        refreshUserFromStorage();

        updateCurrentAccountBalance();

        updateIncome();

        updateExpense();
    }

    /* =====================================================
       TRANSACTION CONTAINER
    ===================================================== */

    function getTransactionContainer() {

        return (

            $("transactionList") ||

            $("transactionsContainer") ||

            $("transactionsList") ||

            $("overviewTransactionList") ||

            $("recentTransactions")

        );
    }

    /* =====================================================
       RENDER TRANSACTIONS
    ===================================================== */

    function renderTransactions() {

        refreshUserFromStorage();

        const container =
            getTransactionContainer();

        if (!container) {

            console.error(
                "Overview transaction container not found."
            );

            return;
        }

        const transactions =
            Array.isArray(
                currentUser.transactions
            )
                ? [...currentUser.transactions]
                : [];

        /*
            No transactions
        */

        if (transactions.length === 0) {

            container.innerHTML = `

                <div class="py-10 text-center">

                    <div
                        class="w-14 h-14 mx-auto mb-4
                               rounded-full bg-gray-100
                               flex items-center justify-center"
                    >
                        <i
                            class="fa-solid fa-receipt
                                   text-gray-400 text-xl"
                        ></i>
                    </div>

                    <p class="text-gray-500 text-sm">
                        No transactions yet.
                    </p>

                </div>

            `;

            return;
        }

        /*
            Newest transaction first
        */

        transactions.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.date ||
                        a.createdAt ||
                        0
                    ).getTime();

                const dateB =
                    new Date(
                        b.date ||
                        b.createdAt ||
                        0
                    ).getTime();

                return dateB - dateA;
            }
        );

        /*
            Show latest 6
        */

        const recent =
            transactions.slice(0, 6);

        container.innerHTML = "";

        recent.forEach(
            transaction => {

                const type =
                    getTransactionType(
                        transaction
                    );

                const isIncome =
                    type === "income";

                const isExpense =
                    type === "expense";

                const amount =
                    Math.abs(
                        Number(
                            transaction.amount
                        ) || 0
                    );

                const title =
                    transaction.title ||

                    transaction.category ||

                    (
                        isIncome
                            ? "Deposit"
                            : isExpense
                                ? "Withdrawal"
                                : "Transaction"
                    );

                const description =
                    transaction.description ||

                    (
                        isIncome
                            ? "Money deposited into your account"
                            : isExpense
                                ? "Money withdrawn from your account"
                                : "Bank transaction"
                    );

                const account =
                    transaction.account ||
                    "Main Account";

                const date =
                    formatDate(
                        transaction.date ||
                        transaction.createdAt
                    );

                let icon =
                    "fa-receipt";

                if (isIncome) {
                    icon =
                        "fa-arrow-down";
                }

                if (isExpense) {
                    icon =
                        "fa-arrow-up";
                }

                const amountPrefix =
                    isIncome
                        ? "+"
                        : isExpense
                            ? "-"
                            : "";

                const amountClass =
                    isIncome
                        ? "text-green-600"
                        : isExpense
                            ? "text-red-600"
                            : "text-gray-700";

                const iconBackground =
                    isIncome
                        ? "bg-green-100"
                        : isExpense
                            ? "bg-red-100"
                            : "bg-gray-100";

                const iconColor =
                    isIncome
                        ? "text-green-600"
                        : isExpense
                            ? "text-red-600"
                            : "text-gray-500";

                const item =
                    document.createElement("div");

                item.className =
                    "flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0";

                item.innerHTML = `

                    <div
                        class="flex items-center gap-3 min-w-0"
                    >

                        <div
                            class="w-11 h-11 shrink-0
                                   rounded-full
                                   ${iconBackground}
                                   flex items-center
                                   justify-center"
                        >
                            <i
                                class="fa-solid
                                       ${icon}
                                       ${iconColor}"
                            ></i>
                        </div>

                        <div
                            class="min-w-0"
                        >

                            <p
                                class="font-semibold
                                       text-gray-800
                                       truncate"
                            >
                                ${escapeHTML(title)}
                            </p>

                            <p
                                class="text-xs
                                       text-gray-500
                                       truncate mt-1"
                            >
                                ${escapeHTML(description)}
                            </p>

                            <div
                                class="flex items-center
                                       gap-2 mt-1"
                            >

                                <span
                                    class="text-[11px]
                                           text-gray-400"
                                >
                                    ${escapeHTML(account)}
                                </span>

                                <span
                                    class="text-gray-300"
                                >
                                    •
                                </span>

                                <span
                                    class="text-[11px]
                                           text-gray-400"
                                >
                                    ${date}
                                </span>

                            </div>

                        </div>

                    </div>

                    <div
                        class="text-right shrink-0"
                    >

                        <p
                            class="font-semibold
                                   ${amountClass}"
                        >
                            ${amountPrefix}₦${formatMoney(amount)}
                        </p>

                        <p
                            class="text-[11px]
                                   text-gray-400
                                   mt-1 capitalize"
                        >
                            ${escapeHTML(
                                transaction.status ||
                                "completed"
                            )}
                        </p>

                    </div>

                `;

                container.appendChild(item);
            }
        );
    }

    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }

    /* =====================================================
       STATISTICS
    ===================================================== */

    function updateStatisticsBars() {

        const income =
            Number(currentUser.income) || 0;

        const expense =
            Number(currentUser.expense) || 0;

        const total =
            income + expense;

        let incomePercentage = 0;
        let expensePercentage = 0;

        if (total > 0) {

            incomePercentage =
                (income / total) * 100;

            expensePercentage =
                (expense / total) * 100;
        }

        [
            "incomeBar",
            "incomeProgress"
        ].forEach(id => {

            const element = $(id);

            if (element) {

                element.style.width =
                    `${incomePercentage}%`;
            }
        });

        [
            "expenseBar",
            "expenseProgress"
        ].forEach(id => {

            const element = $(id);

            if (element) {

                element.style.width =
                    `${expensePercentage}%`;
            }
        });
    }

    /* =====================================================
       RENDER CUSTOM ACCOUNTS
    ===================================================== */

    function renderAccounts() {

        const container =
            $("accountsContainer") ||
            $("accountsGrid");

        if (!container) {
            return;
        }

        const accounts =
            Array.isArray(
                currentUser.accounts
            )
                ? currentUser.accounts
                : [];

        if (accounts.length === 0) {
            return;
        }

        /*
            Don't destroy existing account
            structure unnecessarily.
        */

        container.innerHTML = "";

        accounts.forEach(account => {

            const balance =
                Number(
                    account.balance
                ) || 0;

            const card =
                document.createElement("div");

            card.className =
                "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";

            card.innerHTML = `

                <div
                    class="flex items-center
                           justify-between mb-4"
                >

                    <div
                        class="flex items-center gap-3"
                    >

                        <div
                            class="w-11 h-11
                                   rounded-xl
                                   bg-gray-100
                                   flex items-center
                                   justify-center"
                        >

                            <i
                                class="fa-solid
                                       fa-wallet
                                       text-gray-600"
                            ></i>

                        </div>

                        <div>

                            <h3
                                class="font-semibold
                                       text-gray-800"
                            >
                                ${escapeHTML(
                                    account.name ||
                                    "Account"
                                )}
                            </h3>

                            <p
                                class="text-xs
                                       text-gray-400"
                            >
                                ${escapeHTML(
                                    account.description ||
                                    ""
                                )}
                            </p>

                        </div>

                    </div>

                </div>

                <p
                    class="text-2xl
                           font-bold
                           text-gray-900"
                >
                    ₦${formatMoney(balance)}
                </p>

            `;

            container.appendChild(card);
        });
    }

    /* =====================================================
       BALANCE VISIBILITY
    ===================================================== */

    function updateBalanceVisibility() {

        const balance =
            Number(currentUser.balance) || 0;

        const formatted =
            `₦${formatMoney(balance)}`;

        const balanceIDs = [

            "currentAccountBalance",
            "accountBalance",
            "balance",
            "totalBalance",
            "mainBalance",
            "overviewBalance",
            "mainAccountBalance",
            "currentBalance"

        ];

        balanceIDs.forEach(id => {

            const element = $(id);

            if (!element) {
                return;
            }

            if (
                element.dataset.balanceHidden ===
                "true"
            ) {

                element.textContent =
                    "••••••";

            } else {

                element.textContent =
                    formatted;
            }
        });
    }

    /* =====================================================
       BALANCE TOGGLE
    ===================================================== */

    function setupBalanceToggle() {

        const buttons = [

            $("toggleBalance"),
            $("balanceToggle"),
            $("showBalance")

        ].filter(Boolean);

        buttons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const balanceIDs = [

                        "currentAccountBalance",
                        "accountBalance",
                        "balance",
                        "totalBalance",
                        "mainBalance",
                        "overviewBalance",
                        "mainAccountBalance",
                        "currentBalance"

                    ];

                    const elements =
                        balanceIDs
                            .map(id => $(id))
                            .filter(Boolean);

                    const shouldHide =
                        elements.some(
                            element =>
                                element.dataset.balanceHidden !==
                                "true"
                        );

                    elements.forEach(
                        element => {

                            element.dataset.balanceHidden =
                                shouldHide
                                    ? "true"
                                    : "false";
                        }
                    );

                    updateBalanceVisibility();
                }
            );
        });
    }

    /* =====================================================
       COMPLETE DASHBOARD UPDATE
    ===================================================== */

    function updateDashboard() {

        /*
            FIRST:
            Reload the newest user.

            This is what makes deposits and withdrawals
            made on Accounts immediately available here.
        */

        refreshUserFromStorage();

        /*
            Then update every section.
        */

        updateUserInformation();

        updateCurrentAccountBalance();

        updateIncome();

        updateExpense();

        updateStatisticsBars();

        renderTransactions();

        renderAccounts();

        updateBalanceVisibility();
    }

    /* =====================================================
       LOGOUT
    ===================================================== */

    function setupLogout() {

        const logoutButton =
            $("logoutButton");

        const logoutModal =
            $("logoutModal");

        const cancelLogout =
            $("cancelLogout");

        const confirmLogout =
            $("confirmLogout");

        if (
            logoutButton &&
            logoutModal
        ) {

            logoutButton.addEventListener(
                "click",
                () => {

                    logoutModal.classList.remove(
                        "hidden"
                    );

                    logoutModal.classList.add(
                        "flex"
                    );
                }
            );
        }

        if (
            cancelLogout &&
            logoutModal
        ) {

            cancelLogout.addEventListener(
                "click",
                () => {

                    logoutModal.classList.add(
                        "hidden"
                    );

                    logoutModal.classList.remove(
                        "flex"
                    );
                }
            );
        }

        if (confirmLogout) {

            confirmLogout.addEventListener(
                "click",
                () => {

                    sessionStorage.removeItem(
                        "currentUser"
                    );

                    localStorage.removeItem(
                        "currentUser"
                    );

                    window.location.href =
                        "./register.html";
                }
            );
        }
    }

    /* =====================================================
       MOBILE SIDEBAR
    ===================================================== */

    function setupSidebar() {

        const menuButton =
            $("menuButton");

        const sidebar =
            $("sidebar");

        const overlay =
            $("sidebarOverlay");

        if (
            menuButton &&
            sidebar
        ) {

            menuButton.addEventListener(
                "click",
                () => {

                    sidebar.classList.toggle(
                        "-translate-x-full"
                    );

                    sidebar.classList.toggle(
                        "translate-x-0"
                    );

                    if (overlay) {

                        overlay.classList.toggle(
                            "hidden"
                        );
                    }
                }
            );
        }

        if (
            overlay &&
            sidebar
        ) {

            overlay.addEventListener(
                "click",
                () => {

                    sidebar.classList.add(
                        "-translate-x-full"
                    );

                    sidebar.classList.remove(
                        "translate-x-0"
                    );

                    overlay.classList.add(
                        "hidden"
                    );
                }
            );
        }
    }

    /* =====================================================
       REFRESH WHEN RETURNING TO OVERVIEW
    ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (!document.hidden) {
                updateDashboard();
            }
        }
    );

    window.addEventListener(
        "focus",
        () => {
            updateDashboard();
        }
    );

    /* =====================================================
       INITIALIZE
    ===================================================== */

    if (!loadCurrentUser()) {
        return;
    }

    setupBalanceToggle();

    setupLogout();

    setupSidebar();

    /*
        IMPORTANT:

        We DO NOT call saveUser() here.

        Saving here could overwrite a newly-created
        transaction with stale Overview data.
    */

    updateDashboard();

});

