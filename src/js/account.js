/* =========================================================
   REEN BANK — ACCOUNTS PAGE JAVASCRIPT
   ---------------------------------------------------------
   Works with:
   - reenUsers       -> localStorage
   - currentUser     -> sessionStorage / localStorage
   - accounts.html
   - overview dashboard

   Supports:
   - Main account funding
   - School savings funding
   - Holiday savings funding
   - Custom account funding
   - Withdrawals
   - Credit card / DirectPay selection
   - Transaction history
   - Balance persistence
   - Custom accounts
   - Logout
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. STORAGE
    ===================================================== */

    let users = JSON.parse(
        localStorage.getItem("reenUsers") || "[]"
    );

    let storedCurrentUser =
        sessionStorage.getItem("currentUser") ||
        localStorage.getItem("currentUser");

    if (!storedCurrentUser) {
        window.location.href = "./login.html";
        return;
    }

    let currentUserData;

    try {
        currentUserData = JSON.parse(storedCurrentUser);
    } catch (error) {
        console.error("Invalid currentUser:", error);
        window.location.href = "./login.html";
        return;
    }

    /* =====================================================
       2. FIND FULL USER
    ===================================================== */

    let currentUser = users.find(
        user =>
            user.email &&
            currentUserData.email &&
            user.email.toLowerCase() ===
            currentUserData.email.toLowerCase()
    );

    if (!currentUser) {
        console.error("Current user was not found in reenUsers.");
        window.location.href = "./login.html";
        return;
    }

    /* =====================================================
       3. DEFAULT USER DATA
    ===================================================== */

    currentUser.balance = Number(currentUser.balance) || 0;
    currentUser.income = Number(currentUser.income) || 0;
    currentUser.expense = Number(currentUser.expense) || 0;

    currentUser.schoolSavings =
        Number(currentUser.schoolSavings) || 0;

    currentUser.holidayBalance =
        Number(currentUser.holidayBalance) || 0;

    currentUser.accounts =
        Array.isArray(currentUser.accounts)
            ? currentUser.accounts
            : [];

    currentUser.transactions =
        Array.isArray(currentUser.transactions)
            ? currentUser.transactions
            : [];

    /* =====================================================
       4. ELEMENT HELPER
    ===================================================== */

    const $ = id => document.getElementById(id);

    /* =====================================================
       5. ELEMENTS
    ===================================================== */

    const headerUserName = $("headerUserName");
    const accountNumber = $("accountNumber");

    const profileAvatar = $("profileAvatar");
    const profileAvatarInitials = $("profileAvatarInitials");

    /* Balances */
    const mainAccountBalance = $("mainAccountBalance");
    const schoolSavingsBalance = $("schoolSavingsBalance");
    const holidayBalance = $("holidayBalance");

    /* Fund buttons */
    const mainFundButton = $("mainFundButton");
    const schoolFundButton = $("schoolFundButton");
    const holidayFundButton = $("holidayFundButton");

    /* Withdraw buttons */
    const mainWithdrawButton = $("mainWithdrawButton");
    const schoolWithdrawButton = $("schoolWithdrawButton");
    const holidayWithdrawButton = $("holidayWithdrawButton");

    /* Accounts */
    const accountsGrid = $("accountsGrid");
    const addAccountButton = $("addAccountButton");

    /* Transactions */
    const transactionList = $("transactionList");
    const emptyTransactions = $("emptyTransactions");
    const viewAllTransactions = $("viewAllTransactions");

    /* Add account modal */
    const addAccountModal = $("addAccountModal");
    const addAccountForm = $("addAccountForm");
    const accountNameInput = $("accountName");
    const accountDescriptionInput = $("accountDescription");
    const cancelAddAccount = $("cancelAddAccount");

    /* Account created modal */
    const accountCreatedModal = $("accountCreatedModal");
    const createdAccountName = $("createdAccountName");
    const goBackCreated = $("goBackCreated");
    const fundCreatedAccount = $("fundCreatedAccount");

    /* Fund modal */
    const fundModal = $("fundModal");
    const fundForm = $("fundForm");
    const fundAmount = $("fundAmount");

    const directPayMethod = $("directPayMethod");
    const creditCardMethod = $("creditCardMethod");
    const creditCardFields = $("creditCardFields");

    const cardNumber = $("cardNumber");
    const cardHolder = $("cardHolder");
    const expiryDate = $("expiryDate");
    const cvc = $("cvc");

    const cancelFund = $("cancelFund");

    /* Fund success */
    const fundSuccessModal = $("fundSuccessModal");
    const fundSuccessAmount = $("fundSuccessAmount");
    const fundSuccessBack = $("fundSuccessBack");

    /* Withdraw */
    const withdrawModal = $("withdrawModal");
    const withdrawForm = $("withdrawForm");
    const withdrawAmount = $("withdrawAmount");
    const withdrawAccountNumber = $("withdrawAccountNumber");
    const withdrawAccountName = $("withdrawAccountName");
    const withdrawBank = $("withdrawBank");
    const cancelWithdraw = $("cancelWithdraw");

    /* Withdraw success */
    const withdrawSuccessModal = $("withdrawSuccessModal");
    const withdrawSuccessAmount = $("withdrawSuccessAmount");
    const withdrawSuccessBack = $("withdrawSuccessBack");

    /* Logout */
    const logoutButton = $("logoutButton");
    const logoutModal = $("logoutModal");
    const cancelLogout = $("cancelLogout");
    const confirmLogout = $("confirmLogout");

    /* Sidebar */
    const menuButton = $("menuButton");
    const sidebar = $("sidebar");
    const sidebarOverlay = $("sidebarOverlay");

    /* =====================================================
       6. GENERAL VARIABLES
    ===================================================== */

    let selectedFundAccount = "main";
    let selectedWithdrawAccount = "main";
    let selectedPaymentMethod = "directpay";

    /* =====================================================
       7. MONEY FORMAT
    ===================================================== */

    function formatMoney(amount) {

        amount = Number(amount) || 0;

        return new Intl.NumberFormat("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    /* =====================================================
       8. SAVE USER
    ===================================================== */

    function saveUser() {

        const index = users.findIndex(
            user =>
                user.email &&
                currentUser.email &&
                user.email.toLowerCase() ===
                currentUser.email.toLowerCase()
        );

        if (index === -1) {
            console.error("Unable to save user.");
            return;
        }

        users[index] = currentUser;

        localStorage.setItem(
            "reenUsers",
            JSON.stringify(users)
        );

        /*
           Keep login information in both storages.
           Do NOT replace the full user object here.
        */

        localStorage.setItem(
            "currentUser",
            JSON.stringify(currentUser)
        );

        sessionStorage.setItem(
            "currentUser",
            JSON.stringify(currentUser)
        );
    }

    /* =====================================================
       9. USER PROFILE
    ===================================================== */

    function getInitials(name) {

        if (!name) return "U";

        const words = name.trim().split(/\s+/);

        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }

        return (
            words[0][0] +
            words[words.length - 1][0]
        ).toUpperCase();
    }

    function renderUser() {

        if (headerUserName) {
            headerUserName.textContent =
                currentUser.name || "User";
        }

        if (accountNumber) {
            accountNumber.textContent =
                currentUser.accountNumber || "0000000000";
        }

        const initials = getInitials(currentUser.name);

        if (profileAvatarInitials) {
            profileAvatarInitials.textContent = initials;
        }

        /*
           If there is no profile image,
           show initials.
        */

        if (profileAvatar) {
            profileAvatar.style.display = "flex";
        }
    }

    /* =====================================================
       10. RENDER BALANCES
    ===================================================== */

    function renderBalances() {

        if (mainAccountBalance) {
            mainAccountBalance.textContent =
                `₦${formatMoney(currentUser.balance)}`;
        }

        if (schoolSavingsBalance) {
            schoolSavingsBalance.textContent =
                `₦${formatMoney(currentUser.schoolSavings)}`;
        }

        if (holidayBalance) {
            holidayBalance.textContent =
                `₦${formatMoney(currentUser.holidayBalance)}`;
        }
    }

    /* =====================================================
       11. MODAL HELPERS
    ===================================================== */

    function openModal(modal) {

        if (!modal) return;

        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }

    function closeModal(modal) {

        if (!modal) return;

        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }

    /* =====================================================
       12. TRANSACTION CREATOR
       -----------------------------------------------------
       We save multiple compatible fields so the Overview
       page can correctly identify deposits and withdrawals.
    ===================================================== */

    function createTransaction({
        type,
        account,
        amount,
        description,
        bank = "",
        bankAccountNumber = "",
        accountId = ""
    }) {

        const isDeposit = type === "income";

        return {
            id:
                Date.now().toString() +
                Math.random().toString(36).substring(2, 8),

            /*
               Primary type used by existing overview code.
            */
            type: isDeposit ? "income" : "expense",

            /*
               Explicit transaction type.
            */
            transactionType:
                isDeposit ? "deposit" : "withdrawal",

            /*
               Very clear direction.
            */
            direction:
                isDeposit ? "credit" : "debit",

            /*
               Category.
            */
            category:
                isDeposit ? "Deposit" : "Withdrawal",

            title:
                isDeposit ? "Deposit" : "Withdrawal",

            description,

            account,

            accountId,

            amount: Number(amount),

            bank,

            accountNumber: bankAccountNumber,

            status: "completed",

            date: new Date().toISOString(),

            /*
               Balance after the transaction.
            */
            balanceAfter:
                getAccountBalance(account, accountId)
        };
    }

    /* =====================================================
       13. GET ACCOUNT BALANCE
    ===================================================== */

    function getAccountBalance(accountName, accountId = "") {

        if (accountName === "Main Account") {
            return Number(currentUser.balance) || 0;
        }

        if (accountName === "School Savings") {
            return Number(currentUser.schoolSavings) || 0;
        }

        if (
            accountName === "Holiday Savings" ||
            accountName === "Holiday Plan"
        ) {
            return Number(currentUser.holidayBalance) || 0;
        }

        const customAccount =
            currentUser.accounts.find(
                account =>
                    account.id === accountId ||
                    account.name === accountName
            );

        return customAccount
            ? Number(customAccount.balance) || 0
            : 0;
    }

    /* =====================================================
       14. FUND ACCOUNT
    ===================================================== */

    function fundAccount(accountType, amount) {

        amount = Number(amount);

        if (!amount || amount <= 0) {
            alert("Please enter a valid amount.");
            return false;
        }

        let accountName = "";

        /* ---------------- MAIN ACCOUNT ---------------- */

        if (accountType === "main") {

            currentUser.balance += amount;

            accountName = "Main Account";
        }

        /* ---------------- SCHOOL ---------------- */

        else if (accountType === "school") {

            currentUser.schoolSavings += amount;

            accountName = "School Savings";
        }

        /* ---------------- HOLIDAY ---------------- */

        else if (accountType === "holiday") {

            currentUser.holidayBalance += amount;

            accountName = "Holiday Savings";
        }

        /* ---------------- CUSTOM ACCOUNT ---------------- */

        else if (accountType.startsWith("custom:")) {

            const accountId =
                accountType.replace("custom:", "");

            const account =
                currentUser.accounts.find(
                    item => item.id === accountId
                );

            if (!account) {
                alert("Account could not be found.");
                return false;
            }

            account.balance =
                Number(account.balance) || 0;

            account.balance += amount;

            accountName = account.name;
        }

        else {
            alert("Invalid account.");
            return false;
        }

        /*
           Income represents money coming into the user's
           banking system.
        */

        currentUser.income += amount;

        /* =================================================
           IMPORTANT:
           Deposit = income + credit + deposit
        ================================================= */

        const transaction = createTransaction({
            type: "income",
            account: accountName,
            amount: amount,
            description:
                `Funded ${accountName}`
        });

        currentUser.transactions.unshift(transaction);

        saveUser();

        renderBalances();
        renderTransactions();
        renderCustomAccounts();

        return true;
    }

    /* =====================================================
       15. OPEN FUND MODAL
    ===================================================== */

    function openFundModal(accountType) {

        selectedFundAccount = accountType;

        if (fundAmount) {
            fundAmount.value = "";
        }

        selectedPaymentMethod = "directpay";

        updatePaymentMethodUI();

        openModal(fundModal);
    }

    /* =====================================================
       16. PAYMENT METHOD UI
    ===================================================== */

    function updatePaymentMethodUI() {

        if (creditCardFields) {

            if (
                selectedPaymentMethod ===
                "creditcard"
            ) {
                creditCardFields.classList.remove("hidden");
            } else {
                creditCardFields.classList.add("hidden");
            }
        }

        if (directPayMethod) {

            if (
                selectedPaymentMethod ===
                "directpay"
            ) {
                directPayMethod.classList.add(
                    "border-blue-600",
                    "bg-blue-50"
                );
            } else {
                directPayMethod.classList.remove(
                    "border-blue-600",
                    "bg-blue-50"
                );
            }
        }

        if (creditCardMethod) {

            if (
                selectedPaymentMethod ===
                "creditcard"
            ) {
                creditCardMethod.classList.add(
                    "border-blue-600",
                    "bg-blue-50"
                );
            } else {
                creditCardMethod.classList.remove(
                    "border-blue-600",
                    "bg-blue-50"
                );
            }
        }
    }

    /* =====================================================
       17. PAYMENT METHOD BUTTONS
    ===================================================== */

    if (directPayMethod) {

        directPayMethod.addEventListener(
            "click",
            () => {

                selectedPaymentMethod =
                    "directpay";

                updatePaymentMethodUI();
            }
        );
    }

    if (creditCardMethod) {

        creditCardMethod.addEventListener(
            "click",
            () => {

                selectedPaymentMethod =
                    "creditcard";

                updatePaymentMethodUI();
            }
        );
    }

    /* =====================================================
       18. FUND FORM
    ===================================================== */

    if (fundForm) {

        fundForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const amount =
                    Number(
                        fundAmount?.value
                    );

                if (!amount || amount <= 0) {

                    alert(
                        "Please enter a valid funding amount."
                    );

                    return;
                }

                /* Credit card validation */

                if (
                    selectedPaymentMethod ===
                    "creditcard"
                ) {

                    const card =
                        cardNumber?.value
                            .replace(/\s/g, "");

                    const holder =
                        cardHolder?.value.trim();

                    const expiry =
                        expiryDate?.value.trim();

                    const securityCode =
                        cvc?.value.trim();

                    if (
                        !card ||
                        !/^\d{16}$/.test(card)
                    ) {

                        alert(
                            "Please enter a valid 16-digit card number."
                        );

                        return;
                    }

                    if (!holder) {

                        alert(
                            "Please enter the card holder name."
                        );

                        return;
                    }

                    if (
                        !expiry ||
                        !/^\d{2}\/\d{2}$/.test(expiry)
                    ) {

                        alert(
                            "Enter the expiry date as MM/YY."
                        );

                        return;
                    }

                    if (
                        !securityCode ||
                        !/^\d{3,4}$/.test(securityCode)
                    ) {

                        alert(
                            "Please enter a valid CVC."
                        );

                        return;
                    }
                }

                const success =
                    fundAccount(
                        selectedFundAccount,
                        amount
                    );

                if (!success) return;

                closeModal(fundModal);

                if (fundSuccessAmount) {

                    fundSuccessAmount.textContent =
                        `₦${formatMoney(amount)}`;
                }

                openModal(fundSuccessModal);

                /*
                   Clear card information.
                */

                if (fundForm) {
                    fundForm.reset();
                }

                selectedPaymentMethod =
                    "directpay";

                updatePaymentMethodUI();
            }
        );
    }

    /* =====================================================
       19. FUND BUTTONS
    ===================================================== */

    if (mainFundButton) {

        mainFundButton.addEventListener(
            "click",
            () => openFundModal("main")
        );
    }

    if (schoolFundButton) {

        schoolFundButton.addEventListener(
            "click",
            () => openFundModal("school")
        );
    }

    if (holidayFundButton) {

        holidayFundButton.addEventListener(
            "click",
            () => openFundModal("holiday")
        );
    }

    /* =====================================================
       20. CLOSE FUND MODAL
    ===================================================== */

    if (cancelFund) {

        cancelFund.addEventListener(
            "click",
            () => closeModal(fundModal)
        );
    }

    if (fundSuccessBack) {

        fundSuccessBack.addEventListener(
            "click",
            () => closeModal(fundSuccessModal)
        );
    }

    /* =====================================================
   21. WITHDRAWAL MODAL
===================================================== */

function openWithdrawModal(accountType) {

    selectedWithdrawAccount = accountType;

    /* Reset form */

    if (withdrawForm) {
        withdrawForm.reset();
    }

    /* Get account name */

    const accountName =
        getWithdrawAccountName(accountType);

    /* Get available balance */

    const availableBalance =
        getWithdrawBalance(accountType);

    /*
       Optional elements.
       These will work if they exist
       in your HTML.
    */

    const withdrawAccountTitle =
        $("withdrawAccountTitle");

    const withdrawAvailableBalance =
        $("withdrawAvailableBalance");

    const withdrawAccountType =
        $("withdrawAccountType");

    if (withdrawAccountTitle) {

        withdrawAccountTitle.textContent =
            `Withdraw from ${accountName}`;
    }

    if (withdrawAvailableBalance) {

        withdrawAvailableBalance.textContent =
            `Available balance: ₦${formatMoney(
                availableBalance
            )}`;
    }

    if (withdrawAccountType) {

        withdrawAccountType.value =
            accountType;
    }

    /* Show modal */

    openModal(withdrawModal);
}


/* =====================================================
   22. GET WITHDRAWAL BALANCE
===================================================== */

function getWithdrawBalance(accountType) {

    /* Main account */

    if (accountType === "main") {

        return Number(
            currentUser.balance
        ) || 0;
    }


    /* School savings */

    if (accountType === "school") {

        return Number(
            currentUser.schoolSavings
        ) || 0;
    }


    /* Holiday savings */

    if (accountType === "holiday") {

        return Number(
            currentUser.holidayBalance
        ) || 0;
    }


    /* Custom account */

    if (
        accountType.startsWith("custom:")
    ) {

        const accountId =
            accountType.replace(
                "custom:",
                ""
            );

        const account =
            currentUser.accounts.find(
                item =>
                    item.id === accountId
            );

        if (!account) {
            return 0;
        }

        return Number(
            account.balance
        ) || 0;
    }


    return 0;
}


/* =====================================================
   23. GET WITHDRAWAL ACCOUNT NAME
===================================================== */

function getWithdrawAccountName(accountType) {

    if (accountType === "main") {

        return "Main Account";
    }


    if (accountType === "school") {

        return "School Savings";
    }


    if (accountType === "holiday") {

        return "Holiday Savings";
    }


    if (
        accountType.startsWith("custom:")
    ) {

        const accountId =
            accountType.replace(
                "custom:",
                ""
            );

        const account =
            currentUser.accounts.find(
                item =>
                    item.id === accountId
            );

        return account
            ? account.name
            : "Account";
    }


    return "Account";
}


/* =====================================================
   24. PROCESS WITHDRAWAL
===================================================== */

function withdrawMoney(
    accountType,
    amount,
    bankName,
    bankAccountNumber,
    bankAccountName
) {

    amount = Number(amount);

    /* Validate amount */

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid withdrawal amount."
        );

        return false;
    }


    /* Get available balance */

    const availableBalance =
        getWithdrawBalance(
            accountType
        );


    /* Check balance */

    if (
        amount >
        availableBalance
    ) {

        alert(
            `Insufficient balance.\n\nAvailable balance: ₦${formatMoney(
                availableBalance
            )}`
        );

        return false;
    }


    /* Account name */

    const accountName =
        getWithdrawAccountName(
            accountType
        );


    let accountId = "";


    /* =================================================
       MAIN ACCOUNT
    ================================================= */

    if (
        accountType === "main"
    ) {

        currentUser.balance =
            Number(
                currentUser.balance
            ) || 0;

        currentUser.balance -=
            amount;
    }


    /* =================================================
       SCHOOL SAVINGS
    ================================================= */

    else if (
        accountType === "school"
    ) {

        currentUser.schoolSavings =
            Number(
                currentUser.schoolSavings
            ) || 0;

        currentUser.schoolSavings -=
            amount;
    }


    /* =================================================
       HOLIDAY SAVINGS
    ================================================= */

    else if (
        accountType === "holiday"
    ) {

        currentUser.holidayBalance =
            Number(
                currentUser.holidayBalance
            ) || 0;

        currentUser.holidayBalance -=
            amount;
    }


    /* =================================================
       CUSTOM ACCOUNT
    ================================================= */

    else if (
        accountType.startsWith("custom:")
    ) {

        accountId =
            accountType.replace(
                "custom:",
                ""
            );

        const account =
            currentUser.accounts.find(
                item =>
                    item.id === accountId
            );

        if (!account) {

            alert(
                "Account could not be found."
            );

            return false;
        }

        account.balance =
            Number(
                account.balance
            ) || 0;

        account.balance -=
            amount;
    }


    else {

        alert(
            "Invalid account."
        );

        return false;
    }


    /* =================================================
       UPDATE EXPENSE
    ================================================= */

    currentUser.expense =
        Number(
            currentUser.expense
        ) || 0;

    currentUser.expense +=
        amount;


    /* =================================================
       CREATE WITHDRAWAL TRANSACTION
    ================================================= */

    const transaction = {

        id:
            Date.now().toString() +
            Math.random()
                .toString(36)
                .substring(2, 8),

        type:
            "expense",

        transactionType:
            "withdrawal",

        direction:
            "debit",

        category:
            "Withdrawal",

        title:
            "Withdrawal",

        description:
            `Withdrawal from ${accountName} to ${bankName}`,

        account:
            accountName,

        accountId:
            accountId,

        amount:
            amount,

        bank:
            bankName,

        accountNumber:
            bankAccountNumber,

        accountName:
            bankAccountName,

        status:
            "completed",

        date:
            new Date().toISOString(),

        balanceAfter:
            getWithdrawBalance(
                accountType
            )
    };


    /* Add newest transaction first */

    currentUser.transactions.unshift(
        transaction
    );


    /* Save everything */

    saveUser();


    /* Update page */

    renderBalances();

    renderTransactions();

    renderCustomAccounts();


    return true;
}


/* =====================================================
   25. WITHDRAW FORM SUBMIT
===================================================== */

if (withdrawForm) {

    withdrawForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            /* Amount */

            const amount =
                Number(
                    withdrawAmount?.value
                );


            /* Bank account number */

            const bankAccountNumber =
                withdrawAccountNumber
                    ?.value
                    .trim();


            /* Account holder */

            const bankAccountName =
                withdrawAccountName
                    ?.value
                    .trim();


            /* Bank */

            const bankName =
                withdrawBank
                    ?.value
                    .trim();


            /* =================================================
               VALIDATE AMOUNT
            ================================================= */

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                alert(
                    "Please enter a valid withdrawal amount."
                );

                return;
            }


            /* =================================================
               VALIDATE ACCOUNT NUMBER
            ================================================= */

            if (!bankAccountNumber) {

                alert(
                    "Please enter the bank account number."
                );

                return;
            }


            /* Optional 10-digit Nigerian account validation */

            if (
                !/^\d{10}$/.test(
                    bankAccountNumber
                )
            ) {

                alert(
                    "Please enter a valid 10-digit bank account number."
                );

                return;
            }


            /* =================================================
               VALIDATE ACCOUNT NAME
            ================================================= */

            if (!bankAccountName) {

                alert(
                    "Please enter the account name."
                );

                return;
            }


            /* =================================================
               VALIDATE BANK
            ================================================= */

            if (!bankName) {

                alert(
                    "Please enter the bank name."
                );

                return;
            }


            /* =================================================
               CHECK AVAILABLE BALANCE
            ================================================= */

            const availableBalance =
                getWithdrawBalance(
                    selectedWithdrawAccount
                );


            if (
                amount >
                availableBalance
            ) {

                alert(
                    `Insufficient balance.\n\nAvailable balance: ₦${formatMoney(
                        availableBalance
                    )}`
                );

                return;
            }


            /* =================================================
               PROCESS
            ================================================= */

            const success =
                withdrawMoney(
                    selectedWithdrawAccount,
                    amount,
                    bankName,
                    bankAccountNumber,
                    bankAccountName
                );


            if (!success) {
                return;
            }


            /* =================================================
               CLOSE WITHDRAWAL MODAL
            ================================================= */

            closeModal(
                withdrawModal
            );


            /* =================================================
               SUCCESS AMOUNT
            ================================================= */

            if (
                withdrawSuccessAmount
            ) {

                withdrawSuccessAmount.textContent =
                    `₦${formatMoney(
                        amount
                    )}`;
            }


            /* =================================================
               SHOW SUCCESS MODAL
            ================================================= */

            openModal(
                withdrawSuccessModal
            );


            /* Reset form */

            withdrawForm.reset();
        }
    );
}


/* =====================================================
   26. WITHDRAW BUTTONS
===================================================== */

if (mainWithdrawButton) {

    mainWithdrawButton.addEventListener(
        "click",
        () => {

            openWithdrawModal(
                "main"
            );

        }
    );
}


if (schoolWithdrawButton) {

    schoolWithdrawButton.addEventListener(
        "click",
        () => {

            openWithdrawModal(
                "school"
            );

        }
    );
}


if (holidayWithdrawButton) {

    holidayWithdrawButton.addEventListener(
        "click",
        () => {

            openWithdrawModal(
                "holiday"
            );

        }
    );
}


/* =====================================================
   27. CLOSE WITHDRAWAL MODAL
===================================================== */

if (cancelWithdraw) {

    cancelWithdraw.addEventListener(
        "click",
        () => {

            closeModal(
                withdrawModal
            );

        }
    );
}


/* =====================================================
   28. WITHDRAWAL SUCCESS MODAL
===================================================== */

if (withdrawSuccessBack) {

    withdrawSuccessBack.addEventListener(
        "click",
        () => {

            closeModal(
                withdrawSuccessModal
            );

        }
    );
}
    /* =====================================================
       28. RENDER TRANSACTIONS
    ===================================================== */

    function renderTransactions() {

        if (!transactionList) return;

        transactionList.innerHTML = "";

        const transactions =
            currentUser.transactions || [];

        if (transactions.length === 0) {

            if (emptyTransactions) {
                emptyTransactions.classList.remove(
                    "hidden"
                );
            }

            return;
        }

        if (emptyTransactions) {
            emptyTransactions.classList.add(
                "hidden"
            );
        }

        transactions
            .slice(0, 10)
            .forEach(transaction => {

                const isDeposit =
                    transaction.type === "income" ||
                    transaction.transactionType ===
                        "deposit" ||
                    transaction.direction ===
                        "credit";

                const amount =
                    Number(transaction.amount) || 0;

                const date =
                    new Date(
                        transaction.date
                    );

                const formattedDate =
                    date.toLocaleDateString(
                        "en-NG",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    );

                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "flex items-center justify-between gap-4 py-4 border-b border-gray-100";

                row.innerHTML = `

                    <div class="flex items-center gap-3 min-w-0">

                        <div
                            class="
                                w-10 h-10
                                rounded-full
                                flex items-center justify-center
                                shrink-0
                                ${
                                    isDeposit
                                        ? "bg-green-100 text-green-600"
                                        : "bg-red-100 text-red-600"
                                }
                            "
                        >

                            <i class="
                                fa-solid
                                ${
                                    isDeposit
                                        ? "fa-arrow-down"
                                        : "fa-arrow-up"
                                }
                            "></i>

                        </div>

                        <div class="min-w-0">

                            <p class="font-semibold text-gray-800 truncate">
                                ${
                                    transaction.title ||
                                    (
                                        isDeposit
                                            ? "Deposit"
                                            : "Withdrawal"
                                    )
                                }
                            </p>

                            <p class="text-sm text-gray-500 truncate">
                                ${
                                    transaction.description ||
                                    transaction.account ||
                                    ""
                                }
                            </p>

                            <p class="text-xs text-gray-400">
                                ${formattedDate}
                            </p>

                        </div>

                    </div>

                    <div class="text-right shrink-0">

                        <p class="
                            font-semibold
                            ${
                                isDeposit
                                    ? "text-green-600"
                                    : "text-red-600"
                            }
                        ">

                            ${
                                isDeposit
                                    ? "+"
                                    : "-"
                            }₦${formatMoney(amount)}

                        </p>

                        <p class="text-xs text-gray-400">
                            ${
                                transaction.status ||
                                "completed"
                            }
                        </p>

                    </div>
                `;

                transactionList.appendChild(row);
            });
    }

    /* =====================================================
       29. RENDER CUSTOM ACCOUNTS
    ===================================================== */

    function renderCustomAccounts() {

        if (!accountsGrid) return;

        /*
           Remove previously generated custom cards.
        */

        accountsGrid
            .querySelectorAll(
                ".dynamic-custom-account"
            )
            .forEach(card => card.remove());

        currentUser.accounts.forEach(
            account => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "dynamic-custom-account bg-white rounded-2xl border border-gray-100 shadow-sm p-5";

                account.balance =
                    Number(account.balance) || 0;

                card.innerHTML = `

                    <div class="flex items-start justify-between gap-3">

                        <div>

                            <div
                                class="
                                    w-11 h-11
                                    rounded-xl
                                    bg-blue-100
                                    text-blue-600
                                    flex items-center justify-center
                                    mb-4
                                "
                            >
                                <i class="fa-solid fa-wallet"></i>
                            </div>

                            <h3 class="font-semibold text-gray-800">
                                ${escapeHTML(account.name)}
                            </h3>

                            <p class="text-sm text-gray-500 mt-1">
                                ${
                                    escapeHTML(
                                        account.description ||
                                        "Personal account"
                                    )
                                }
                            </p>

                        </div>

                    </div>

                    <div class="mt-5">

                        <p class="text-xs text-gray-500">
                            Balance
                        </p>

                        <p class="text-xl font-bold text-gray-900 mt-1">
                            ₦${formatMoney(account.balance)}
                        </p>

                    </div>

                    <div class="flex gap-2 mt-5">

                        <button
                            type="button"
                            class="
                                flex-1
                                rounded-xl
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                py-2.5
                                text-sm
                                font-medium
                                fund-custom-account
                            "
                            data-account-id="${account.id}"
                        >
                            Fund
                        </button>

                        <button
                            type="button"
                            class="
                                flex-1
                                rounded-xl
                                border
                                border-gray-200
                                hover:bg-gray-50
                                text-gray-700
                                py-2.5
                                text-sm
                                font-medium
                                withdraw-custom-account
                            "
                            data-account-id="${account.id}"
                        >
                            Withdraw
                        </button>

                    </div>
                `;

                accountsGrid.appendChild(card);
            }
        );

        /*
           Custom FUND buttons
        */

        accountsGrid
            .querySelectorAll(
                ".fund-custom-account"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.accountId;

                        openFundModal(
                            `custom:${id}`
                        );
                    }
                );
            });

        /*
           Custom WITHDRAW buttons
        */

        accountsGrid
            .querySelectorAll(
                ".withdraw-custom-account"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.accountId;

                        openWithdrawModal(
                            `custom:${id}`
                        );
                    }
                );
            });
    }

    /* =====================================================
       30. ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =====================================================
       31. ADD ACCOUNT MODAL
    ===================================================== */

    if (addAccountButton) {

        addAccountButton.addEventListener(
            "click",
            () => {

                if (addAccountForm) {
                    addAccountForm.reset();
                }

                openModal(addAccountModal);
            }
        );
    }

    if (cancelAddAccount) {

        cancelAddAccount.addEventListener(
            "click",
            () =>
                closeModal(
                    addAccountModal
                )
        );
    }

    /* =====================================================
       32. CREATE ACCOUNT
    ===================================================== */

    if (addAccountForm) {

        addAccountForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                /*
                   IMPORTANT:
                   Your HTML uses IDs rather than
                   name="" attributes, so we read
                   directly from the inputs.
                */

                const name =
                    accountNameInput?.value.trim();

                const description =
                    accountDescriptionInput?.value.trim();

                if (!name) {

                    alert(
                        "Please enter an account name."
                    );

                    return;
                }

                const account = {

                    id:
                        "account_" +
                        Date.now(),

                    name,

                    description:
                        description ||
                        "Personal savings account",

                    balance: 0,

                    createdAt:
                        new Date().toISOString()
                };

                currentUser.accounts.push(
                    account
                );

                saveUser();

                renderCustomAccounts();

                closeModal(addAccountModal);

                if (createdAccountName) {

                    createdAccountName.textContent =
                        account.name;
                }

                openModal(
                    accountCreatedModal
                );

                addAccountForm.reset();
            }
        );
    }

    /* =====================================================
       33. ACCOUNT CREATED MODAL
    ===================================================== */

    if (goBackCreated) {

        goBackCreated.addEventListener(
            "click",
            () =>
                closeModal(
                    accountCreatedModal
                )
        );
    }

    if (fundCreatedAccount) {

        fundCreatedAccount.addEventListener(
            "click",
            () => {

                closeModal(
                    accountCreatedModal
                );

                const lastAccount =
                    currentUser.accounts[
                        currentUser.accounts.length - 1
                    ];

                if (lastAccount) {

                    openFundModal(
                        `custom:${lastAccount.id}`
                    );
                }
            }
        );
    }

    /* =====================================================
       34. VIEW ALL TRANSACTIONS
    ===================================================== */

    if (viewAllTransactions) {

        viewAllTransactions.addEventListener(
            "click",
            event => {

                /*
                   If your overview/transactions page
                   exists, change this path if necessary.
                */

                event.preventDefault();

                window.location.href =
                    "./transactions.html";
            }
        );
    }

    /* =====================================================
       35. SIDEBAR
    ===================================================== */

    function openSidebar() {

        if (sidebar) {
            sidebar.classList.remove(
                "-translate-x-full"
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

    /* =====================================================
       36. LOGOUT
    ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            () => openModal(logoutModal)
        );
    }

    if (cancelLogout) {

        cancelLogout.addEventListener(
            "click",
            () => closeModal(logoutModal)
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
                    "./login.html";
            }
        );
    }

    /* =====================================================
       37. CLOSE MODALS WHEN CLICKING OUTSIDE
    ===================================================== */

    [
        fundModal,
        withdrawModal,
        addAccountModal,
        accountCreatedModal,
        fundSuccessModal,
        withdrawSuccessModal,
        logoutModal
    ].forEach(modal => {

        if (!modal) return;

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {
                    closeModal(modal);
                }
            }
        );
    });

    /* =====================================================
       38. INITIAL RENDER
    ===================================================== */

    renderUser();
    renderBalances();
    renderTransactions();
    renderCustomAccounts();

    updatePaymentMethodUI();

    console.log(
        "Reen Bank Accounts loaded successfully."
    );

    console.log(
        "Current user:",
        currentUser
    );

    console.log(
        "Current balance:",
        currentUser.balance
    );

});

