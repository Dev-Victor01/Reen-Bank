/* =========================================================
   REEN BANK — COMPLETE OVERVIEW DASHBOARD JAVASCRIPT
   ---------------------------------------------------------
   Compatible with:
   - overview.html
   - reenUsers -> localStorage
   - currentUser -> sessionStorage / localStorage

   FEATURES
   ---------------------------------------------------------
   ✓ Main Account
   ✓ School Savings
   ✓ Holiday Plan
   ✓ Custom Accounts
   ✓ Aggregate Current Balance
   ✓ Income / Expense
   ✓ Latest 5 Transactions on Overview
   ✓ All Transactions remain stored
   ✓ Notifications
   ✓ Search
   ✓ Add Account
   ✓ Fund Account
   ✓ Transaction Details
   ✓ Upgrade Modal
   ✓ Logout Modal
   ✓ Mobile Sidebar
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. STORAGE
    ===================================================== */

    let users =
        JSON.parse(localStorage.getItem("reenUsers")) || [];

    let sessionUser =
        JSON.parse(sessionStorage.getItem("currentUser")) ||
        JSON.parse(localStorage.getItem("currentUser"));

    if (!sessionUser || !sessionUser.email) {
        window.location.href = "./register.html";
        return;
    }

    let currentUser = users.find(
        user =>
            user.email === sessionUser.email
    );

    if (!currentUser) {
        currentUser = sessionUser;
    }

    /* =====================================================
       2. NORMALIZE USER DATA
    ===================================================== */

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

    currentUser.transactions =
        Array.isArray(currentUser.transactions)
            ? currentUser.transactions
            : [];

    currentUser.accounts =
        Array.isArray(currentUser.accounts)
            ? currentUser.accounts
            : [];

    currentUser.notifications =
        Array.isArray(currentUser.notifications)
            ? currentUser.notifications
            : [];

    currentUser.cards =
        Array.isArray(currentUser.cards)
            ? currentUser.cards
            : [];

    /*
       IMPORTANT:
       Normalize custom accounts WITHOUT replacing
       or deleting them.
    */

    currentUser.accounts.forEach(account => {

        account.balance =
            Number(account.balance) || 0;

        account.transactions =
            Array.isArray(account.transactions)
                ? account.transactions
                : [];

        account.name =
            account.name || "Savings Account";

        account.description =
            account.description || "";

        if (!account.id) {
            account.id =
                generateId("account");
        }
    });

    /* =====================================================
       3. SAVE USER
    ===================================================== */

    function saveUser() {

        const index =
            users.findIndex(
                user =>
                    user.email ===
                    currentUser.email
            );

        if (index !== -1) {
            users[index] = currentUser;
        } else {
            users.push(currentUser);
        }

        localStorage.setItem(
            "reenUsers",
            JSON.stringify(users)
        );

        const sessionData = {
            name: currentUser.name,
            email: currentUser.email,
            accountNumber:
                currentUser.accountNumber
        };

        sessionStorage.setItem(
            "currentUser",
            JSON.stringify(sessionData)
        );

        localStorage.setItem(
            "currentUser",
            JSON.stringify(sessionData)
        );
    }

    /* =====================================================
       4. HELPERS
    ===================================================== */

    function formatMoney(amount) {

        return new Intl.NumberFormat(
            "en-NG",
            {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 2
            }
        ).format(
            Number(amount) || 0
        );
    }

    function generateId(prefix = "id") {

        return `${prefix}_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;
    }

    function formatDate(date) {

        if (!date) return "—";

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "—";
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

    function formatDateTime(date) {

        if (!date) return "—";

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
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

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =====================================================
       5. CALCULATE CURRENT BALANCE
       -----------------------------------------------------
       Current Balance =
       Main Account
       + School Savings
       + Holiday Plan
       + Custom Accounts
    ===================================================== */

    function calculateCurrentBalance() {

        const mainAccount =
            Number(currentUser.balance) || 0;

        const schoolSavings =
            Number(
                currentUser.schoolSavings
            ) || 0;

        const holidayBalance =
            Number(
                currentUser.holidayBalance
            ) || 0;

        const customAccountsTotal =
            Array.isArray(
                currentUser.accounts
            )
                ? currentUser.accounts.reduce(
                    (total, account) => {

                        return (
                            total +
                            (
                                Number(
                                    account.balance
                                ) || 0
                            )
                        );
                    },
                    0
                )
                : 0;

        return (
            mainAccount +
            schoolSavings +
            holidayBalance +
            customAccountsTotal
        );
    }

    /* =====================================================
       6. ELEMENT REFERENCES
    ===================================================== */

    const headerUserName =
        document.getElementById(
            "headerUserName"
        );

    const headerAccountNumber =
        document.getElementById(
            "headerAccountNumber"
        );

    const headerProfileImage =
        document.getElementById(
            "headerProfileImage"
        );

    const headerProfileInitials =
        document.getElementById(
            "headerProfileInitials"
        );

    const currentBalance =
        document.getElementById(
            "currentBalance"
        );

    const totalIncome =
        document.getElementById(
            "totalIncome"
        );

    const totalExpense =
        document.getElementById(
            "totalExpense"
        );

    const mainAccountBalance =
        document.getElementById(
            "mainAccountBalance"
        );

    const schoolAccountBalance =
        document.getElementById(
            "schoolAccountBalance"
        );

    const holidayAccountBalance =
        document.getElementById(
            "holidayAccountBalance"
        );

    /* =====================================================
       7. HEADER
    ===================================================== */

    function renderHeader() {

        if (headerUserName) {

            const nameParts =
                String(
                    currentUser.name || ""
                )
                    .trim()
                    .split(/\s+/);

            headerUserName.textContent =
                nameParts.length > 1
                    ? nameParts[1]
                    : nameParts[0] ||
                      "User";
        }

        if (headerAccountNumber) {

            headerAccountNumber.textContent =
                currentUser.accountNumber ||
                "—";
        }

        if (headerProfileImage) {

            if (currentUser.profileImage) {

                headerProfileImage.src =
                    currentUser.profileImage;

                headerProfileImage.classList.remove(
                    "hidden"
                );

                if (headerProfileInitials) {

                    headerProfileInitials.classList.add(
                        "hidden"
                    );
                }

            } else {

                headerProfileImage.classList.add(
                    "hidden"
                );

                if (headerProfileInitials) {

                    const initials =
                        String(
                            currentUser.name ||
                            "U"
                        )
                            .trim()
                            .split(/\s+/)
                            .map(
                                word =>
                                    word[0]
                            )
                            .join("")
                            .slice(0, 2)
                            .toUpperCase();

                    headerProfileInitials.textContent =
                        initials || "U";

                    headerProfileInitials.classList.remove(
                        "hidden"
                    );
                }
            }
        }
    }

    renderHeader();

    /* =====================================================
       8. BALANCE VISIBILITY
    ===================================================== */

    let balanceVisible = true;

    const balanceToggle =
        document.getElementById(
            "balanceToggle"
        );

    function renderBalances() {

        /*
           CURRENT BALANCE
           Uses aggregate balance.
        */

        if (currentBalance) {

            currentBalance.textContent =
                balanceVisible
                    ? formatMoney(
                        calculateCurrentBalance()
                    )
                    : "₦ ••••••";
        }

        /*
           MAIN ACCOUNT
        */

        if (mainAccountBalance) {

            mainAccountBalance.textContent =
                balanceVisible
                    ? formatMoney(
                        currentUser.balance
                    )
                    : "₦ ••••••";
        }

        /*
           SCHOOL SAVINGS
        */

        if (schoolAccountBalance) {

            schoolAccountBalance.textContent =
                balanceVisible
                    ? formatMoney(
                        currentUser.schoolSavings
                    )
                    : "₦ ••••••";
        }

        /*
           HOLIDAY PLAN
        */

        if (holidayAccountBalance) {

            holidayAccountBalance.textContent =
                balanceVisible
                    ? formatMoney(
                        currentUser.holidayBalance
                    )
                    : "₦ ••••••";
        }

        /*
           CUSTOM ACCOUNTS

           This does NOT remove custom accounts.
           It only updates their balance elements.
        */

        document
            .querySelectorAll(
                "[data-account-balance]"
            )
            .forEach(element => {

                const accountId =
                    element.dataset.accountBalance;

                const account =
                    currentUser.accounts.find(
                        item =>
                            String(item.id) ===
                            String(accountId)
                    );

                if (!account) return;

                element.textContent =
                    balanceVisible
                        ? formatMoney(
                            account.balance
                        )
                        : "₦ ••••••";
            });
    }

    if (balanceToggle) {

        balanceToggle.addEventListener(
            "click",
            () => {

                balanceVisible =
                    !balanceVisible;

                balanceToggle.innerHTML =
                    balanceVisible
                        ? `<i class="fa-regular fa-eye"></i>`
                        : `<i class="fa-regular fa-eye-slash"></i>`;

                renderBalances();
            }
        );
    }

    /* =====================================================
       9. INCOME / EXPENSE
    ===================================================== */

    function renderStatistics() {

        if (totalIncome) {

            totalIncome.textContent =
                formatMoney(
                    currentUser.income
                );
        }

        if (totalExpense) {

            totalExpense.textContent =
                formatMoney(
                    currentUser.expense
                );
        }

        const total =
            currentUser.income +
            currentUser.expense;

        const incomeProgress =
            document.getElementById(
                "incomeProgress"
            );

        const expenseProgress =
            document.getElementById(
                "expenseProgress"
            );

        if (incomeProgress) {

            incomeProgress.style.width =
                total > 0
                    ? `${
                        (
                            currentUser.income /
                            total
                        ) * 100
                    }%`
                    : "0%";
        }

        if (expenseProgress) {

            expenseProgress.style.width =
                total > 0
                    ? `${
                        (
                            currentUser.expense /
                            total
                        ) * 100
                    }%`
                    : "0%";
        }
    }

    /* =====================================================
       10. CUSTOM ACCOUNTS
       -----------------------------------------------------
       IMPORTANT:
       Custom accounts are preserved.

       We only remove the custom-account cards that THIS
       script created previously, then rebuild them from
       currentUser.accounts.

       Main Account / School Savings / Holiday Plan are
       NOT touched.
    ===================================================== */

    const accountsContainer =
        document.getElementById(
            "accountsContainer"
        );

    function renderCustomAccounts() {

        if (!accountsContainer) return;

        /*
           Remove ONLY cards generated by this script.
           Do not clear accountsContainer.innerHTML.
        */

        accountsContainer
            .querySelectorAll(
                "[data-overview-custom-account]"
            )
            .forEach(
                element =>
                    element.remove()
            );

        /*
           Render every custom account.
        */

        currentUser.accounts.forEach(
            account => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.dataset.overviewCustomAccount =
                    account.id;

                card.className =
                    "bg-[#D4F3E7] rounded-2xl p-5 border border-gray-100 shadow-sm";

                card.innerHTML = `
                    <div class="flex items-center justify-between gap-4">

                        <div class="min-w-0">

                            <h3 class="font-semibold text-[#46237A] truncate">
                                ${escapeHTML(
                                    account.name
                                )}
                            </h3>

                            <p class="text-sm text-gray-500 truncate">
                                ${escapeHTML(
                                    account.description ||
                                    ""
                                )}
                            </p>

                        </div>

                    </div>

                    <div class="mt-5">

                        <p class="text-xs text-gray-400">
                            Balance
                        </p>

                        <p
                            data-account-balance="${escapeHTML(
                                account.id
                            )}"
                            class="text-xl font-bold text-gray-900">
                            ${
                                balanceVisible
                                    ? formatMoney(
                                        account.balance
                                    )
                                    : "₦ ••••••"
                            }
                        </p>

                    </div>
                `;

                accountsContainer.appendChild(
                    card
                );
            }
        );

        /*
           Attach Fund buttons for newly rendered
           custom accounts.
        */

        accountsContainer
            .querySelectorAll(
                "[data-account-fund]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        openFundModal(
                            button.dataset
                                .accountFund
                        );
                    }
                );
            });
    }

    /* =====================================================
       11. ADD ACCOUNT
    ===================================================== */

    const addAccountButton =
        document.getElementById(
            "addAccountButton"
        );

    const addAccountModal =
        document.getElementById(
            "addAccountModal"
        );

    const addAccountForm =
        document.getElementById(
            "addAccountForm"
        );

    const cancelAddAccountBtn =
        document.getElementById(
            "cancelAddAccountBtn"
        );

    function openModal(modal) {

        if (!modal) return;

        modal.classList.remove(
            "hidden"
        );

        modal.classList.add(
            "flex"
        );
    }

    function closeModal(modal) {

        if (!modal) return;

        modal.classList.add(
            "hidden"
        );

        modal.classList.remove(
            "flex"
        );
    }

    if (addAccountButton) {

        addAccountButton.addEventListener(
            "click",
            () =>
                openModal(
                    addAccountModal
                )
        );
    }

    if (cancelAddAccountBtn) {

        cancelAddAccountBtn.addEventListener(
            "click",
            () =>
                closeModal(
                    addAccountModal
                )
        );
    }

    if (addAccountForm) {

        addAccountForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const name =
                    document
                        .getElementById(
                            "accountName"
                        )
                        ?.value
                        .trim();

                const description =
                    document
                        .getElementById(
                            "accountDescription"
                        )
                        ?.value
                        .trim();

                if (!name) return;

                const newAccount = {

                    id:
                        generateId(
                            "account"
                        ),

                    name,

                    description:
                        description || "",

                    balance: 0,

                    transactions: [],

                    createdAt:
                        new Date().toISOString()
                };

                /*
                   IMPORTANT:
                   PUSH INTO EXISTING ARRAY.
                   Do not replace currentUser.accounts.
                */

                if (
                    !Array.isArray(
                        currentUser.accounts
                    )
                ) {

                    currentUser.accounts = [];
                }

                currentUser.accounts.push(
                    newAccount
                );

                saveUser();

                addAccountForm.reset();

                closeModal(
                    addAccountModal
                );

                renderCustomAccounts();
                renderBalances();

                /*
                   CREATED SUCCESS MODAL
                */

                let successModal =
                    document.getElementById(
                        "accountCreatedSuccessModal"
                    );

                if (!successModal) {

                    successModal =
                        document.createElement(
                            "div"
                        );

                    successModal.id =
                        "accountCreatedSuccessModal";

                    successModal.className =
                        "fixed inset-0 z-50 hidden items-center justify-center bg-black/40 px-4";

                    successModal.innerHTML = `

                        <div class="bg-white rounded-3xl p-6 max-w-md w-full text-center">

                            <div class="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl">

                                <i class="fa-solid fa-check"></i>

                            </div>

                            <h3 class="mt-4 text-xl font-bold">
                                Account Created
                            </h3>

                            <p
                                id="createdAccountMessage"
                                class="mt-2 text-gray-500">
                            </p>

                            <div class="mt-6 flex gap-3">

                                <button
                                    type="button"
                                    id="accountCreatedBackBtn"
                                    class="flex-1 py-3 rounded-xl border border-gray-200">
                                    Go Back
                                </button>

                                <button
                                    type="button"
                                    id="accountCreatedFundBtn"
                                    class="flex-1 py-3 rounded-xl bg-[#087f5b] text-white">
                                    Fund Account
                                </button>

                            </div>

                        </div>
                    `;

                    document.body.appendChild(
                        successModal
                    );

                    document
                        .getElementById(
                            "accountCreatedBackBtn"
                        )
                        ?.addEventListener(
                            "click",
                            () =>
                                closeModal(
                                    successModal
                                )
                        );

                    document
                        .getElementById(
                            "accountCreatedFundBtn"
                        )
                        ?.addEventListener(
                            "click",
                            () => {

                                closeModal(
                                    successModal
                                );

                                openFundModal(
                                    newAccount.id
                                );
                            }
                        );
                }

                const createdMessage =
                    document.getElementById(
                        "createdAccountMessage"
                    );

                if (createdMessage) {

                    createdMessage.textContent =
                        `${name} has been created successfully.`;
                }

                openModal(
                    successModal
                );
            }
        );
    }

    /* =====================================================
       12. FUND WALLET MODAL
    ===================================================== */

    const fundWalletModal =
        document.getElementById(
            "fundWalletModal"
        );

    const fundWalletForm =
        document.getElementById(
            "fundWalletForm"
        );

    const cancelFundWalletBtn =
        document.getElementById(
            "cancelFundWalletBtn"
        );

    const directPaySection =
        document.getElementById(
            "directPaySection"
        );

    const creditCardSection =
        document.getElementById(
            "creditCardSection"
        );

    const directPayOption =
        document.getElementById(
            "directPayOption"
        );

    let selectedFundingAccountId =
        null;

    function openFundModal(
        accountId = null
    ) {

        selectedFundingAccountId =
            accountId;

        openModal(
            fundWalletModal
        );

        if (directPayOption) {

            directPayOption.checked =
                true;
        }

        if (directPaySection) {

            directPaySection.classList.remove(
                "hidden"
            );
        }

        if (creditCardSection) {

            creditCardSection.classList.add(
                "hidden"
            );
        }
    }

    if (cancelFundWalletBtn) {

        cancelFundWalletBtn.addEventListener(
            "click",
            () =>
                closeModal(
                    fundWalletModal
                )
        );
    }

    /* =====================================================
       13. FUNDING METHOD
    ===================================================== */

    document
        .querySelectorAll(
            'input[name="fundMethod"]'
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                () => {

                    if (
                        input.value ===
                        "creditCard"
                    ) {

                        directPaySection
                            ?.classList
                            .add(
                                "hidden"
                            );

                        creditCardSection
                            ?.classList
                            .remove(
                                "hidden"
                            );

                    } else {

                        directPaySection
                            ?.classList
                            .remove(
                                "hidden"
                            );

                        creditCardSection
                            ?.classList
                            .add(
                                "hidden"
                            );
                    }
                }
            );
        });

    /* =====================================================
       14. FUND ACCOUNT
    ===================================================== */

    if (fundWalletForm) {

        fundWalletForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const method =
                    document.querySelector(
                        'input[name="fundMethod"]:checked'
                    )?.value ||
                    "directPay";

                const amountInput =
                    method === "creditCard"
                        ? document.getElementById(
                            "cardAmount"
                        )
                        : document.getElementById(
                            "directPayAmount"
                        );

                const amount =
                    Number(
                        amountInput?.value
                    );

                if (
                    !Number.isFinite(
                        amount
                    ) ||
                    amount <= 0
                ) {
                    return;
                }

                /* =========================================
                   FIND TARGET CUSTOM ACCOUNT
                ========================================= */

                const targetAccount =
                    selectedFundingAccountId
                        ? currentUser.accounts.find(
                            account =>
                                String(
                                    account.id
                                ) ===
                                String(
                                    selectedFundingAccountId
                                )
                        )
                        : null;

                const now =
                    new Date().toISOString();

                /* =========================================
                   UPDATE TARGET ACCOUNT
                ========================================= */

                if (targetAccount) {

                    targetAccount.balance =
                        Number(
                            targetAccount.balance
                        ) || 0;

                    targetAccount.balance +=
                        amount;

                    if (
                        !Array.isArray(
                            targetAccount.transactions
                        )
                    ) {

                        targetAccount.transactions =
                            [];
                    }

                    targetAccount.transactions.push({

                        id:
                            generateId(
                                "txn"
                            ),

                        type:
                            "deposit",

                        transactionType:
                            "deposit",

                        category:
                            "income",

                        title:
                            "Account Funding",

                        description:
                            `Deposit into ${targetAccount.name}`,

                        amount,

                        account:
                            targetAccount.name,

                        paymentMethod:
                            method ===
                            "creditCard"
                                ? "Credit Card"
                                : "Direct Pay",

                        status:
                            "completed",

                        createdAt:
                            now
                    });

                } else {

                    /*
                       Main Account funding.
                       currentUser.balance remains
                       Main Account balance only.
                    */

                    currentUser.balance =
                        Number(
                            currentUser.balance
                        ) || 0;

                    currentUser.balance +=
                        amount;
                }

                /* =========================================
                   INCOME
                   DO NOT CHANGE THIS LOGIC
                ========================================= */

                currentUser.income =
                    Number(
                        currentUser.income
                    ) || 0;

                currentUser.income +=
                    amount;

                /* =========================================
                   MAIN TRANSACTION
                ========================================= */

                const transaction = {

                    id:
                        generateId(
                            "txn"
                        ),

                    type:
                        "deposit",

                    transactionType:
                        "deposit",

                    category:
                        "income",

                    title:
                        "Account Funding",

                    description:
                        targetAccount
                            ? `Deposit into ${targetAccount.name}`
                            : "Deposit into Main Account",

                    amount,

                    account:
                        targetAccount
                            ? targetAccount.name
                            : "Main Account",

                    paymentMethod:
                        method ===
                        "creditCard"
                            ? "Credit Card"
                            : "Direct Pay",

                    status:
                        "completed",

                    createdAt:
                        now
                };

                currentUser.transactions.push(
                    transaction
                );

                /* =========================================
                   NOTIFICATION
                ========================================= */

                currentUser.notifications.unshift({

                    id:
                        generateId(
                            "notification"
                        ),

                    title:
                        "Deposit Successful",

                    message:
                        `${formatMoney(
                            amount
                        )} was added to ${
                            targetAccount
                                ? targetAccount.name
                                : "Main Account"
                        }.`, 

                    type:
                        "success",

                    read:
                        false,

                    transactionId:
                        transaction.id,

                    createdAt:
                        now
                });

                /* =========================================
                   SAVE
                ========================================= */

                saveUser();

                /* =========================================
                   REFRESH UI
                ========================================= */

                renderCustomAccounts();
                renderBalances();
                renderStatistics();

                /*
                   IMPORTANT:
                   renderTransactions() itself only displays
                   the latest 5 transactions.
                */

                renderTransactions();

                renderNotifications();

                closeModal(
                    fundWalletModal
                );

                fundWalletForm.reset();

                /* =========================================
                   SUCCESS MODAL
                ========================================= */

                const successModal =
                    document.getElementById(
                        "fundSuccessModal"
                    );

                openModal(
                    successModal
                );
            }
        );
    }

    /* =====================================================
       15. TRANSACTION TYPE
    ===================================================== */

    function getTransactionType(
        transaction
    ) {

        const type =
            String(
                transaction.transactionType ||
                transaction.type ||
                transaction.category ||
                transaction.direction ||
                ""
            ).toLowerCase();

        if (
            type.includes("withdraw") ||
            type.includes("expense")
        ) {

            return "expense";
        }

        if (
            type.includes("deposit") ||
            type.includes("income")
        ) {

            return "income";
        }

        return "neutral";
    }

    /* =====================================================
       16. TRANSACTIONS
       -----------------------------------------------------
       IMPORTANT:
       ONLY THE LATEST 5 ARE DISPLAYED ON OVERVIEW.

       currentUser.transactions is NOT modified.

       Therefore:
       - Transaction 1-5 -> Overview
       - Transaction 6+ -> hidden on Overview
       - ALL transactions remain stored
       - Transactions page can show everything
    ===================================================== */

    const transactionsContainer =
        document.getElementById(
            "transactionsContainer"
        );

    const transactionsEmptyState =
        document.getElementById(
            "transactionsEmptyState"
        );

    function renderTransactions(
        transactions =
            currentUser.transactions
    ) {

        if (!transactionsContainer) {
            return;
        }

        /*
           Clear ONLY the transaction display.
        */

        transactionsContainer.innerHTML =
            "";

        if (
            !transactions ||
            transactions.length === 0
        ) {

            if (transactionsEmptyState) {

                transactionsEmptyState.classList.remove(
                    "hidden"
                );
            }

            return;
        }

        if (transactionsEmptyState) {

            transactionsEmptyState.classList.add(
                "hidden"
            );
        }

        /*
           Sort newest first.
        */

        const sorted =
            [...transactions]
                .sort(
                    (a, b) => {

                        const dateA =
                            new Date(
                                a.createdAt ||
                                a.date ||
                                0
                            ).getTime();

                        const dateB =
                            new Date(
                                b.createdAt ||
                                b.date ||
                                0
                            ).getTime();

                        return (
                            dateB -
                            dateA
                        );
                    }
                );

        /*
           SHOW ONLY 5 ON OVERVIEW.
        */

        const latestFive =
            sorted.slice(
                0,
                5
            );

        latestFive.forEach(
            transaction => {

                const type =
                    getTransactionType(
                        transaction
                    );

                const row =
                    document.createElement(
                        "button"
                    );

                row.type =
                    "button";

                row.className =
                    "w-full flex items-center justify-between gap-4 py-4 border-b border-gray-100 text-left hover:bg-gray-50";

                row.innerHTML = `

                    <div class="flex items-center gap-3 min-w-0">

                        <div class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
                            type === "income"
                                ? "bg-green-100 text-green-600"
                                : type === "expense"
                                    ? "bg-red-100 text-red-600"
                                    : "bg-gray-100 text-gray-600"
                        }">

                            <i class="fa-solid ${
                                type === "income"
                                    ? "fa-arrow-down"
                                    : type === "expense"
                                        ? "fa-arrow-up"
                                        : "fa-receipt"
                            }"></i>

                        </div>

                        <div class="min-w-0">

                            <p class="font-medium text-gray-800 truncate">

                                ${escapeHTML(
                                    transaction.title ||
                                    "Transaction"
                                )}

                            </p>

                            <p class="text-xs text-gray-400">

                                ${escapeHTML(
                                    formatDateTime(
                                        transaction.createdAt ||
                                        transaction.date
                                    )
                                )}

                            </p>

                        </div>

                    </div>

                    <div class="text-right shrink-0">

                        <p class="font-semibold ${
                            type === "income"
                                ? "text-green-600"
                                : type === "expense"
                                    ? "text-red-600"
                                    : "text-gray-700"
                        }">

                            ${
                                type ===
                                "expense"
                                    ? "-"
                                    : "+"
                            }${formatMoney(
                                transaction.amount
                            )}

                        </p>

                        <p class="text-xs text-gray-400 truncate max-w-[130px]">

                            ${escapeHTML(
                                transaction.account ||
                                ""
                            )}

                        </p>

                    </div>

                `;

                row.addEventListener(
                    "click",
                    () =>
                        showTransactionDetails(
                            transaction
                        )
                );

                transactionsContainer.appendChild(
                    row
                );
            }
        );
    }

    /* =====================================================
       17. TRANSACTION DETAILS
    ===================================================== */

    function showTransactionDetails(
        transaction
    ) {

        let modal =
            document.getElementById(
                "transactionDetailsModal"
            );

        if (!modal) {

            modal =
                document.createElement(
                    "div"
                );

            modal.id =
                "transactionDetailsModal";

            modal.className =
                "fixed inset-0 z-50 hidden items-center justify-center bg-black/40 px-4";

            modal.innerHTML = `

                <div class="bg-white rounded-3xl p-6 max-w-md w-full">

                    <div class="flex items-center justify-between">

                        <h3 class="text-xl font-bold">
                            Transaction Details
                        </h3>

                        <button
                            type="button"
                            id="closeTransactionDetails"
                            class="text-gray-400 text-xl">

                            <i class="fa-solid fa-xmark"></i>

                        </button>

                    </div>

                    <div
                        id="transactionDetailsContent"
                        class="mt-5 space-y-3">
                    </div>

                </div>
            `;

            document.body.appendChild(
                modal
            );

            document
                .getElementById(
                    "closeTransactionDetails"
                )
                ?.addEventListener(
                    "click",
                    () =>
                        closeModal(
                            modal
                        )
                );
        }

        const content =
            document.getElementById(
                "transactionDetailsContent"
            );

        if (content) {

            content.innerHTML = `

                <div class="flex justify-between gap-4">

                    <span class="text-gray-500">
                        Title
                    </span>

                    <span class="font-medium text-right">
                        ${escapeHTML(
                            transaction.title ||
                            "Transaction"
                        )}
                    </span>

                </div>

                <div class="flex justify-between gap-4">

                    <span class="text-gray-500">
                        Amount
                    </span>

                    <span class="font-semibold text-right">
                        ${formatMoney(
                            transaction.amount
                        )}
                    </span>

                </div>

                <div class="flex justify-between gap-4">

                    <span class="text-gray-500">
                        Account
                    </span>

                    <span class="font-medium text-right">
                        ${escapeHTML(
                            transaction.account ||
                            "—"
                        )}
                    </span>

                </div>

                <div class="flex justify-between gap-4">

                    <span class="text-gray-500">
                        Payment Method
                    </span>

                    <span class="font-medium text-right">
                        ${escapeHTML(
                            transaction.paymentMethod ||
                            "—"
                        )}
                    </span>

                </div>

                <div class="flex justify-between gap-4">

                    <span class="text-gray-500">
                        Status
                    </span>

                    <span class="font-medium text-right">
                        ${escapeHTML(
                            transaction.status ||
                            "completed"
                        )}
                    </span>

                </div>

                <div class="flex justify-between gap-4">

                    <span class="text-gray-500">
                        Date
                    </span>

                    <span class="font-medium text-right">
                        ${escapeHTML(
                            formatDateTime(
                                transaction.createdAt ||
                                transaction.date
                            )
                        )}
                    </span>

                </div>
            `;
        }

        openModal(
            modal
        );
    }

    /* =====================================================
       18. NOTIFICATIONS
    ===================================================== */

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );

    const notificationDot =
        document.getElementById(
            "notificationDot"
        );

    let notificationDropdown =
        null;

    function renderNotifications() {

        const unread =
            currentUser.notifications.filter(
                notification =>
                    !notification.read
            ).length;

        if (notificationDot) {

            notificationDot.textContent =
                unread > 99
                    ? "99+"
                    : unread;

            notificationDot.classList.toggle(
                "hidden",
                unread === 0
            );
        }

        if (!notificationDropdown) {

            notificationDropdown =
                document.createElement(
                    "div"
                );

            notificationDropdown.id =
                "notificationDropdown";

            notificationDropdown.className =
                "fixed z-50 hidden w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden";

            document.body.appendChild(
                notificationDropdown
            );
        }

        notificationDropdown.innerHTML = `

            <div class="flex items-center justify-between px-4 py-4 border-b">

                <div>

                    <h3 class="font-semibold text-gray-800">
                        Notifications
                    </h3>

                    <p class="text-xs text-gray-400">
                        ${unread} unread
                    </p>

                </div>

                <button
                    type="button"
                    id="markAllNotificationsRead"
                    class="text-sm text-[#087f5b]">

                    Mark all as read

                </button>

            </div>

            <div class="max-h-[420px] overflow-y-auto">

                ${
                    currentUser.notifications.length

                        ? currentUser.notifications
                            .slice(
                                0,
                                15
                            )
                            .map(
                                notification =>
                                    `

                                <button
                                    type="button"
                                    data-notification-id="${escapeHTML(
                                        notification.id
                                    )}"
                                    class="w-full text-left px-4 py-4 border-b hover:bg-gray-50 ${
                                        notification.read
                                            ? ""
                                            : "bg-green-50/40"
                                    }">

                                    <div class="flex gap-3">

                                        <div class="w-9 h-9 shrink-0 rounded-full bg-green-100 text-green-600 flex items-center justify-center">

                                            <i class="fa-solid fa-bell"></i>

                                        </div>

                                        <div class="flex-1">

                                            <p class="font-medium text-sm text-gray-800">

                                                ${escapeHTML(
                                                    notification.title
                                                )}

                                            </p>

                                            <p class="text-xs text-gray-500 mt-1">

                                                ${escapeHTML(
                                                    notification.message
                                                )}

                                            </p>

                                            <p class="text-[11px] text-gray-400 mt-1">

                                                ${escapeHTML(
                                                    formatDateTime(
                                                        notification.createdAt
                                                    )
                                                )}

                                            </p>

                                        </div>

                                    </div>

                                </button>

                            `
                            )
                            .join("")

                        : `

                            <div class="px-4 py-10 text-center text-gray-400 text-sm">

                                No notifications yet.

                            </div>

                        `
                }

            </div>
        `;

        notificationDropdown
            .querySelector(
                "#markAllNotificationsRead"
            )
            ?.addEventListener(
                "click",
                () => {

                    currentUser.notifications.forEach(
                        notification =>
                            notification.read =
                                true
                    );

                    saveUser();

                    renderNotifications();
                }
            );

        notificationDropdown
            .querySelectorAll(
                "[data-notification-id]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const notification =
                            currentUser.notifications.find(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        button
                                            .dataset
                                            .notificationId
                                    )
                            );

                        if (!notification)
                            return;

                        notification.read =
                            true;

                        saveUser();

                        renderNotifications();

                        if (
                            notification.transactionId
                        ) {

                            const transaction =
                                currentUser.transactions.find(
                                    item =>
                                        String(
                                            item.id
                                        ) ===
                                        String(
                                            notification.transactionId
                                        )
                                );

                            if (transaction) {

                                showTransactionDetails(
                                    transaction
                                );
                            }
                        }
                    }
                );
            });
    }

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                if (
                    !notificationDropdown
                ) {

                    renderNotifications();
                }

                const rect =
                    notificationButton.getBoundingClientRect();

                notificationDropdown.style.top =
                    `${rect.bottom + 10}px`;

                notificationDropdown.style.right =
                    `${Math.max(
                        16,
                        window.innerWidth -
                            rect.right
                    )}px`;

                notificationDropdown.classList.toggle(
                    "hidden"
                );
            }
        );
    }

    document.addEventListener(
        "click",
        event => {

            if (
                notificationDropdown &&
                !notificationDropdown.contains(
                    event.target
                ) &&
                event.target !==
                    notificationButton
            ) {

                notificationDropdown.classList.add(
                    "hidden"
                );
            }
        }
    );

    /* =====================================================
       19. SEARCH
    ===================================================== */

    const searchButton =
        document.getElementById(
            "searchButton"
        );

    let searchInput =
        null;

    let searchResults =
        null;

    function createSearchUI() {

        if (searchInput) return;

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "relative w-full max-w-md";

        wrapper.innerHTML = `

            <input
                id="overviewSearchInput"
                type="search"
                placeholder="Search transactions or accounts..."
                class="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-green-200"
            />

            <div
                id="overviewSearchResults"
                class="absolute z-40 left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 hidden overflow-hidden">
            </div>

        `;

        if (
            searchButton &&
            searchButton.parentElement
        ) {

            searchButton.parentElement.appendChild(
                wrapper
            );

        } else {

            document.body.appendChild(
                wrapper
            );
        }

        searchInput =
            wrapper.querySelector(
                "#overviewSearchInput"
            );

        searchResults =
            wrapper.querySelector(
                "#overviewSearchResults"
            );

        searchInput.addEventListener(
            "input",
            runSearch
        );
    }

    function runSearch() {

        const query =
            searchInput?.value
                .trim()
                .toLowerCase();

        if (!searchResults)
            return;

        if (!query) {

            searchResults.classList.add(
                "hidden"
            );

            searchResults.innerHTML =
                "";

            return;
        }

        const accountResults =
            currentUser.accounts.filter(
                account =>
                    String(
                        account.name ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            query
                        )
            );

        const transactionResults =
            currentUser.transactions.filter(
                transaction =>

                    String(
                        transaction.title ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            query
                        ) ||

                    String(
                        transaction.description ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            query
                        ) ||

                    String(
                        transaction.account ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            query
                        )
            );

        const html = [];

        accountResults.forEach(
            account => {

                html.push(`

                    <button
                        type="button"
                        data-search-account="${escapeHTML(
                            account.id
                        )}"
                        class="w-full text-left px-4 py-3 border-b hover:bg-gray-50">

                        <p class="font-medium">
                            ${escapeHTML(
                                account.name
                            )}
                        </p>

                        <p class="text-xs text-gray-400">

                            Account · ${formatMoney(
                                account.balance
                            )}

                        </p>

                    </button>

                `);
            }
        );

        transactionResults
            .slice(
                0,
                10
            )
            .forEach(
                transaction => {

                    html.push(`

                        <button
                            type="button"
                            data-search-transaction="${escapeHTML(
                                transaction.id
                            )}"
                            class="w-full text-left px-4 py-3 border-b hover:bg-gray-50">

                            <p class="font-medium">

                                ${escapeHTML(
                                    transaction.title ||
                                    "Transaction"
                                )}

                            </p>

                            <p class="text-xs text-gray-400">

                                ${formatMoney(
                                    transaction.amount
                                )}

                            </p>

                        </button>

                    `);
                }
            );

        searchResults.innerHTML =
            html.length
                ? html.join("")
                : `

                    <div class="px-4 py-5 text-sm text-gray-400">

                        No results found.

                    </div>

                `;

        searchResults.classList.remove(
            "hidden"
        );

        searchResults
            .querySelectorAll(
                "[data-search-transaction]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const transaction =
                            currentUser.transactions.find(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        button.dataset
                                            .searchTransaction
                                    )
                            );

                        if (transaction) {

                            showTransactionDetails(
                                transaction
                            );
                        }
                    }
                );
            });
    }

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            () => {

                createSearchUI();

                searchInput?.focus();
            }
        );
    }

    /* =====================================================
       20. DATE FILTER
    ===================================================== */

    const dateFilter =
        document.getElementById(
            "dateFilter"
        );

    if (dateFilter) {

        dateFilter.addEventListener(
            "change",
            () => {

                const value =
                    dateFilter.value;

                if (!value) {

                    renderTransactions();

                    return;
                }

                const now =
                    new Date();

                let startDate =
                    new Date();

                if (
                    value ===
                    "today"
                ) {

                    startDate =
                        new Date(
                            now.getFullYear(),
                            now.getMonth(),
                            now.getDate()
                        );

                } else if (
                    value ===
                    "7days"
                ) {

                    startDate.setDate(
                        now.getDate() -
                        7
                    );

                } else if (
                    value ===
                    "30days"
                ) {

                    startDate.setDate(
                        now.getDate() -
                        30
                    );
                }

                const filtered =
                    currentUser.transactions.filter(
                        transaction => {

                            const transactionDate =
                                new Date(
                                    transaction.createdAt ||
                                    transaction.date
                                );

                            return (
                                transactionDate >=
                                startDate
                            );
                        }
                    );

                /*
                   Even filtered results are limited
                   to the latest 5 on Overview.
                */

                renderTransactions(
                    filtered
                );
            }
        );
    }

    /* =====================================================
       21. UPGRADE MODAL
    ===================================================== */

    const upgradeButton =
        document.getElementById(
            "upgradeButton"
        );

    const upgradeModal =
        document.getElementById(
            "upgradeModal"
        );

    const closeUpgradeModal =
        document.getElementById(
            "closeUpgradeModal"
        );

    upgradeButton?.addEventListener(
        "click",
        () =>
            openModal(
                upgradeModal
            )
    );

    closeUpgradeModal?.addEventListener(
        "click",
        () =>
            closeModal(
                upgradeModal
            )
    );

    /* =====================================================
       22. LOGOUT
    ===================================================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    const logoutModal =
        document.getElementById(
            "logoutModal"
        );

    const cancelLogoutBtn =
        document.getElementById(
            "cancelLogoutBtn"
        );

    const confirmLogoutBtn =
        document.getElementById(
            "confirmLogoutBtn"
        );

    logoutButton?.addEventListener(
        "click",
        () =>
            openModal(
                logoutModal
            )
    );

    cancelLogoutBtn?.addEventListener(
        "click",
        () =>
            closeModal(
                logoutModal
            )
    );

    confirmLogoutBtn?.addEventListener(
        "click",
        () => {

            sessionStorage.removeItem(
                "currentUser"
            );

            localStorage.removeItem(
                "currentUser"
            );

            window.location.href =
                "./login.html";
        }
    );

    /* =====================================================
       23. MOBILE SIDEBAR
    ===================================================== */

    const mobileMenuButton =
        document.getElementById(
            "mobileMenuButton"
        );

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const sidebarOverlay =
        document.getElementById(
            "sidebarOverlay"
        );

    function toggleSidebar() {

        sidebar?.classList.toggle(
            "-translate-x-full"
        );

        sidebarOverlay?.classList.toggle(
            "hidden"
        );
    }

    mobileMenuButton?.addEventListener(
        "click",
        toggleSidebar
    );

    sidebarOverlay?.addEventListener(
        "click",
        toggleSidebar
    );

    /* =====================================================
       24. NAVIGATION
    ===================================================== */

    document
        .getElementById(
            "overviewNav"
        )
        ?.addEventListener(
            "click",
            () =>
                window.location.href =
                    "./overview.html"
        );

    document
        .getElementById(
            "accountsNav"
        )
        ?.addEventListener(
            "click",
            () =>
                window.location.href =
                    "./account.html"
        );

    document
        .getElementById(
            "transactionsNav"
        )
        ?.addEventListener(
            "click",
            () =>
                window.location.href =
                    "./transactions.html"
        );

    document
        .getElementById(
            "profileNav"
        )
        ?.addEventListener(
            "click",
            () =>
                window.location.href =
                    "./profile.html"
        );

    document
        .getElementById(
            "headerProfileButton"
        )
        ?.addEventListener(
            "click",
            () =>
                window.location.href =
                    "./profile.html"
        );

    /* =====================================================
       25. INITIAL RENDER
    ===================================================== */

    /*
       IMPORTANT ORDER:

       1. Custom accounts
       2. Balances
       3. Statistics
       4. Latest 5 transactions
       5. Notifications
    */

    renderCustomAccounts();

    renderBalances();

    renderStatistics();

    renderTransactions();

    renderNotifications();

    /*
       Save normalized user data.
       This does NOT remove custom accounts.
    */

    saveUser();
});