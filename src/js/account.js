// =========================================================
// REEN BANK - ACCOUNTS PAGE
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("ACCOUNTS.JS IS LOADED!");

    // =====================================================
    // STORAGE
    // =====================================================

    const USERS_KEY = "reenUsers";
    const CURRENT_USER_KEY = "currentUser";


    // =====================================================
    // GET USERS
    // =====================================================

    let users = [];

    try {
        users = JSON.parse(
            localStorage.getItem(USERS_KEY)
        ) || [];
    } catch (error) {
        console.error("Could not read users:", error);
        users = [];
    }

    if (!Array.isArray(users)) {
        users = [];
    }


    // =====================================================
    // GET CURRENT SESSION
    // =====================================================

    let currentUserSession = null;

    try {
        currentUserSession = JSON.parse(
            sessionStorage.getItem(CURRENT_USER_KEY)
        );
    } catch (error) {
        console.error("Could not read current user:", error);
    }


    // =====================================================
    // CHECK LOGIN
    // =====================================================

    if (!currentUserSession || !currentUserSession.email) {
        window.location.href = "./login.html";
        return;
    }


    // =====================================================
    // FIND USER
    // =====================================================

    let userIndex = users.findIndex(function (user) {

        return (
            user &&
            typeof user.email === "string" &&
            user.email.toLowerCase() ===
            currentUserSession.email.toLowerCase()
        );

    });


    if (userIndex === -1) {

        sessionStorage.removeItem(CURRENT_USER_KEY);

        window.location.href = "./login.html";

        return;
    }


    // =====================================================
    // CURRENT USER
    // =====================================================

    let currentUser = users[userIndex];


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

    if (typeof currentUser.schoolSavings !== "number") {
        currentUser.schoolSavings = 0;
    }

    if (typeof currentUser.holidayBalance !== "number") {
        currentUser.holidayBalance = 0;
    }

    if (!Array.isArray(currentUser.accounts)) {
        currentUser.accounts = [];
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
    // GENERATE ACCOUNT NUMBER
    // =====================================================

    function generateAccountNumber(email, allUsers) {

        let digits = "";

        for (let i = 0; i < email.length; i++) {
            digits += email.charCodeAt(i);
        }

        digits = digits.replace(/\D/g, "");

        let number =
            digits.substring(0, 10);

        while (number.length < 10) {
            number += Math.floor(
                Math.random() * 10
            );
        }

        let exists = allUsers.some(function (user) {

            return (
                user &&
                user.accountNumber === number
            );

        });

        while (exists) {

            number = "";

            for (let i = 0; i < 10; i++) {

                number += Math.floor(
                    Math.random() * 10
                );

            }

            exists = allUsers.some(function (user) {

                return (
                    user &&
                    user.accountNumber === number
                );

            });

        }

        return number;
    }


    // =====================================================
    // SAVE USERS
    // =====================================================

    function saveUsers() {

        users[userIndex] = currentUser;

        localStorage.setItem(
            USERS_KEY,
            JSON.stringify(users)
        );

    }


    saveUsers();


    // =====================================================
    // UPDATE SESSION
    // =====================================================

    sessionStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify({

            name: currentUser.name || "User",

            email: currentUser.email,

            accountNumber: currentUser.accountNumber

        })
    );


    // =====================================================
    // ELEMENTS
    // =====================================================

    const headerUserName =
        document.getElementById("headerUserName");

    const accountNumber =
        document.getElementById("accountNumber");

    const profileAvatar =
        document.getElementById("profileAvatar");

    const profileAvatarInitials =
        document.getElementById("profileAvatarInitials");

    const mainAccountBalance =
        document.getElementById("mainAccountBalance");

    const schoolSavingsBalance =
        document.getElementById("schoolSavingsBalance");

    const holidayBalance =
        document.getElementById("holidayBalance");

    const transactionList =
        document.getElementById("transactionList");

    const emptyTransactions =
        document.getElementById("emptyTransactions");

    const accountsGrid =
        document.getElementById("accountsGrid");


    // =====================================================
    // FORMAT MONEY
    // =====================================================

    function formatMoney(amount) {

        const value = Number(amount) || 0;

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
    // GET SECOND NAME
    // =====================================================

    function getSecondName(fullName) {

        if (!fullName) {
            return "User";
        }

        const parts =
            fullName
                .trim()
                .split(/\s+/);

        if (parts.length >= 2) {
            return parts[1];
        }

        return parts[0];
    }


    // =====================================================
    // INITIALS
    // =====================================================

    function getInitials(name) {

        if (!name) {
            return "U";
        }

        const parts =
            name.trim().split(/\s+/);

        if (parts.length === 1) {
            return parts[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();

    }


    // =====================================================
    // PROFILE AVATAR
    // =====================================================

    function updateProfileAvatar() {

        if (!profileAvatar) {
            return;
        }

        const initials =
            getInitials(
                currentUser.name
            );

        if (profileAvatarInitials) {
            profileAvatarInitials.textContent =
                initials;
        }


        /*
         * Check several possible names in case
         * the profile page stores the image differently.
         */

        const savedImage =
            currentUser.profileImage ||
            currentUser.profilePhoto ||
            currentUser.avatar ||
            localStorage.getItem("profileImage");


        if (!savedImage) {

            profileAvatar.style.backgroundImage =
                "";

            profileAvatarInitials.classList.remove(
                "hidden"
            );

            return;
        }


        const testImage =
            new Image();


        testImage.onload = function () {

            profileAvatar.style.backgroundImage =
                `url("${savedImage}")`;

            profileAvatar.style.backgroundSize =
                "cover";

            profileAvatar.style.backgroundPosition =
                "center";

            profileAvatarInitials.classList.add(
                "hidden"
            );

        };


        testImage.onerror = function () {

            profileAvatar.style.backgroundImage =
                "";

            profileAvatarInitials.classList.remove(
                "hidden"
            );

        };


        testImage.src = savedImage;

    }


    // =====================================================
    // USER INFORMATION
    // =====================================================

    function updateUserInformation() {

        if (headerUserName) {

            headerUserName.textContent =
                getSecondName(
                    currentUser.name
                );

        }


        if (accountNumber) {

            accountNumber.textContent =
                currentUser.accountNumber ||
                "0000000000";

        }


        updateProfileAvatar();

    }


    // =====================================================
    // UPDATE BALANCES
    // =====================================================

    function updateBalances() {

        if (mainAccountBalance) {

            mainAccountBalance.textContent =
                formatMoney(
                    currentUser.balance
                );

        }


        if (schoolSavingsBalance) {

            schoolSavingsBalance.textContent =
                formatMoney(
                    currentUser.schoolSavings
                );

        }


        if (holidayBalance) {

            holidayBalance.textContent =
                formatMoney(
                    currentUser.holidayBalance
                );

        }


        updateCustomAccountCards();

    }


    // =====================================================
    // MODAL HELPERS
    // =====================================================

    function openModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.remove("hidden");

        modal.classList.add("flex");

    }


    function closeModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.add("hidden");

        modal.classList.remove("flex");

    }


    // =====================================================
    // ADD ACCOUNT ELEMENTS
    // =====================================================

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

    const cancelAddAccount =
        document.getElementById(
            "cancelAddAccount"
        );


    // =====================================================
    // OPEN ADD ACCOUNT
    // =====================================================

    if (addAccountButton) {

        addAccountButton.addEventListener(
            "click",
            function () {

                openModal(
                    addAccountModal
                );

            }
        );

    }


    // =====================================================
    // CANCEL ADD ACCOUNT
    // =====================================================

    if (cancelAddAccount) {

        cancelAddAccount.addEventListener(
            "click",
            function () {

                closeModal(
                    addAccountModal
                );

            }
        );

    }


    // =====================================================
    // ADD ACCOUNT FORM
    // =====================================================

    if (addAccountForm) {

        addAccountForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const accountName =
                    document.getElementById(
                        "accountName"
                    ).value.trim();


                const description =
                    document.getElementById(
                        "accountDescription"
                    ).value.trim();


                if (!accountName) {

                    alert(
                        "Please enter an account name."
                    );

                    return;

                }


                const newAccount = {

                    id:
                        Date.now().toString(),

                    name:
                        accountName,

                    description:
                        description,

                    balance:
                        0,

                    transactions:
                        [],

                    createdAt:
                        new Date().toISOString()

                };


                currentUser.accounts.push(
                    newAccount
                );


                saveUsers();


                document.getElementById(
                    "createdAccountName"
                ).textContent =
                    accountName;


                addAccountForm.reset();


                closeModal(
                    addAccountModal
                );


                renderCustomAccounts();


                openModal(
                    document.getElementById(
                        "accountCreatedModal"
                    )
                );

            }
        );

    }


    // =====================================================
    // ACCOUNT CREATED
    // =====================================================

    const accountCreatedModal =
        document.getElementById(
            "accountCreatedModal"
        );

    const goBackCreated =
        document.getElementById(
            "goBackCreated"
        );

    const fundCreatedAccount =
        document.getElementById(
            "fundCreatedAccount"
        );


    let newlyCreatedAccountId = null;


    if (currentUser.accounts.length > 0) {

        newlyCreatedAccountId =
            currentUser.accounts[
                currentUser.accounts.length - 1
            ].id;

    }


    if (goBackCreated) {

        goBackCreated.addEventListener(
            "click",
            function () {

                closeModal(
                    accountCreatedModal
                );

            }
        );

    }


    if (fundCreatedAccount) {

        fundCreatedAccount.addEventListener(
            "click",
            function () {

                closeModal(
                    accountCreatedModal
                );


                if (newlyCreatedAccountId) {

                    openFundModal(
                        "custom",
                        newlyCreatedAccountId
                    );

                } else {

                    openFundModal(
                        "main"
                    );

                }

            }
        );

    }


    // =====================================================
    // FUND MODAL
    // =====================================================

    const fundModal =
        document.getElementById(
            "fundModal"
        );

    const fundForm =
        document.getElementById(
            "fundForm"
        );

    const cancelFund =
        document.getElementById(
            "cancelFund"
        );


    let selectedFundAccount = "main";

    let selectedCustomAccountId = null;


    function openFundModal(
        accountType,
        customAccountId = null
    ) {

        selectedFundAccount =
            accountType || "main";

        selectedCustomAccountId =
            customAccountId;


        if (fundForm) {
            fundForm.reset();
        }


        setPaymentMethod("direct");


        openModal(
            fundModal
        );

    }


    // =====================================================
    // FUND BUTTONS
    // =====================================================

    const mainFundButton =
        document.getElementById(
            "mainFundButton"
        );

    const schoolFundButton =
        document.getElementById(
            "schoolFundButton"
        );

    const holidayFundButton =
        document.getElementById(
            "holidayFundButton"
        );


    if (mainFundButton) {

        mainFundButton.addEventListener(
            "click",
            function () {

                openFundModal(
                    "main"
                );

            }
        );

    }


    if (schoolFundButton) {

        schoolFundButton.addEventListener(
            "click",
            function () {

                openFundModal(
                    "school"
                );

            }
        );

    }


    if (holidayFundButton) {

        holidayFundButton.addEventListener(
            "click",
            function () {

                openFundModal(
                    "holiday"
                );

            }
        );

    }


    // =====================================================
    // PAYMENT METHOD
    // =====================================================

    const directPayMethod =
        document.getElementById(
            "directPayMethod"
        );

    const creditCardMethod =
        document.getElementById(
            "creditCardMethod"
        );

    const creditCardFields =
        document.getElementById(
            "creditCardFields"
        );


    function setPaymentMethod(method) {

        if (method === "credit") {

            if (creditCardFields) {

                creditCardFields.classList.remove(
                    "hidden"
                );

            }


            if (directPayMethod) {

                directPayMethod.innerHTML =
                    '<i class="fa-regular fa-circle"></i> Direct Pay';

            }


            if (creditCardMethod) {

                creditCardMethod.innerHTML =
                    '<i class="fa-solid fa-circle text-red-400"></i> Credit Card';

            }

        } else {

            if (creditCardFields) {

                creditCardFields.classList.add(
                    "hidden"
                );

            }


            if (directPayMethod) {

                directPayMethod.innerHTML =
                    '<i class="fa-solid fa-circle text-red-400"></i> Direct Pay';

            }


            if (creditCardMethod) {

                creditCardMethod.innerHTML =
                    '<i class="fa-regular fa-circle"></i> Credit Card';

            }

        }

    }


    if (directPayMethod) {

        directPayMethod.addEventListener(
            "click",
            function () {

                setPaymentMethod(
                    "direct"
                );

            }
        );

    }


    if (creditCardMethod) {

        creditCardMethod.addEventListener(
            "click",
            function () {

                setPaymentMethod(
                    "credit"
                );

            }
        );

    }


    if (cancelFund) {

        cancelFund.addEventListener(
            "click",
            function () {

                closeModal(
                    fundModal
                );

            }
        );

    }


    // =====================================================
    // FUND FORM
    // =====================================================

    if (fundForm) {

        fundForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const amount =
                    Number(
                        document.getElementById(
                            "fundAmount"
                        ).value
                    );


                if (!amount || amount <= 0) {

                    alert(
                        "Please enter a valid amount."
                    );

                    return;

                }


                const creditVisible =
                    creditCardFields &&
                    !creditCardFields.classList.contains(
                        "hidden"
                    );


                if (creditVisible) {

                    const cardNumber =
                        document.getElementById(
                            "cardNumber"
                        ).value.trim();

                    const cardHolder =
                        document.getElementById(
                            "cardHolder"
                        ).value.trim();

                    const expiryDate =
                        document.getElementById(
                            "expiryDate"
                        ).value.trim();

                    const cvc =
                        document.getElementById(
                            "cvc"
                        ).value.trim();


                    if (
                        !cardNumber ||
                        !cardHolder ||
                        !expiryDate ||
                        !cvc
                    ) {

                        alert(
                            "Please complete all card details."
                        );

                        return;

                    }

                }


                let accountName =
                    "Main Account";


                // MAIN

                if (
                    selectedFundAccount ===
                    "main"
                ) {

                    currentUser.balance +=
                        amount;

                }


                // SCHOOL

                else if (
                    selectedFundAccount ===
                    "school"
                ) {

                    currentUser.schoolSavings +=
                        amount;

                    accountName =
                        "School Savings";

                }


                // HOLIDAY

                else if (
                    selectedFundAccount ===
                    "holiday"
                ) {

                    currentUser.holidayBalance +=
                        amount;

                    accountName =
                        "Holiday Plan";

                }


                // CUSTOM ACCOUNT

                else if (
                    selectedFundAccount ===
                    "custom"
                ) {

                    const customAccount =
                        currentUser.accounts.find(
                            function (account) {

                                return (
                                    account.id ===
                                    selectedCustomAccountId
                                );

                            }
                        );


                    if (!customAccount) {

                        alert(
                            "Account could not be found."
                        );

                        return;

                    }


                    customAccount.balance +=
                        amount;


                    accountName =
                        customAccount.name;

                }


                // INCOME

                currentUser.income +=
                    amount;


                // TRANSACTION

                currentUser.transactions.push({

                    type:
                        "deposit",

                    amount:
                        amount,

                    description:
                        "Fund " + accountName,

                    date:
                        new Date().toISOString(),

                    status:
                        "completed"

                });


                // SAVE

                saveUsers();


                updateBalances();

                updateTransactions();


                // SUCCESS

                document.getElementById(
                    "fundSuccessAmount"
                ).textContent =
                    formatMoney(
                        amount
                    );


                fundForm.reset();


                closeModal(
                    fundModal
                );


                openModal(
                    document.getElementById(
                        "fundSuccessModal"
                    )
                );

            }
        );

    }


    // =====================================================
    // FUND SUCCESS
    // =====================================================

    const fundSuccessModal =
        document.getElementById(
            "fundSuccessModal"
        );

    const fundSuccessBack =
        document.getElementById(
            "fundSuccessBack"
        );


    if (fundSuccessBack) {

        fundSuccessBack.addEventListener(
            "click",
            function () {

                closeModal(
                    fundSuccessModal
                );

            }
        );

    }


    // =====================================================
    // WITHDRAW
    // =====================================================

    const withdrawModal =
        document.getElementById(
            "withdrawModal"
        );

    const withdrawForm =
        document.getElementById(
            "withdrawForm"
        );

    const cancelWithdraw =
        document.getElementById(
            "cancelWithdraw"
        );


    let selectedWithdrawAccount =
        "main";

    let selectedWithdrawCustomId =
        null;


    function openWithdrawModal(
        accountType,
        customAccountId = null
    ) {

        selectedWithdrawAccount =
            accountType || "main";

        selectedWithdrawCustomId =
            customAccountId;


        if (withdrawForm) {
            withdrawForm.reset();
        }


        openModal(
            withdrawModal
        );

    }


    // =====================================================
    // WITHDRAW BUTTONS
    // =====================================================

    const mainWithdrawButton =
        document.getElementById(
            "mainWithdrawButton"
        );

    const schoolWithdrawButton =
        document.getElementById(
            "schoolWithdrawButton"
        );

    const holidayWithdrawButton =
        document.getElementById(
            "holidayWithdrawButton"
        );


    if (mainWithdrawButton) {

        mainWithdrawButton.addEventListener(
            "click",
            function () {

                openWithdrawModal(
                    "main"
                );

            }
        );

    }


    if (schoolWithdrawButton) {

        schoolWithdrawButton.addEventListener(
            "click",
            function () {

                openWithdrawModal(
                    "school"
                );

            }
        );

    }


    if (holidayWithdrawButton) {

        holidayWithdrawButton.addEventListener(
            "click",
            function () {

                openWithdrawModal(
                    "holiday"
                );

            }
        );

    }


    if (cancelWithdraw) {

        cancelWithdraw.addEventListener(
            "click",
            function () {

                closeModal(
                    withdrawModal
                );

            }
        );

    }


    // =====================================================
    // WITHDRAW FORM
    // =====================================================

    if (withdrawForm) {

        withdrawForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const amount =
                    Number(
                        document.getElementById(
                            "withdrawAmount"
                        ).value
                    );


                const bank =
                    document.getElementById(
                        "withdrawBank"
                    ).value;


                const accountNumberInput =
                    document.getElementById(
                        "withdrawAccountNumber"
                    ).value.trim();


                const accountNameInput =
                    document.getElementById(
                        "withdrawAccountName"
                    ).value.trim();


                if (!amount || amount <= 0) {

                    alert(
                        "Please enter a valid amount."
                    );

                    return;

                }


                if (!accountNumberInput) {

                    alert(
                        "Please enter the account number."
                    );

                    return;

                }


                if (!accountNameInput) {

                    alert(
                        "Please enter the account name."
                    );

                    return;

                }


                if (!bank) {

                    alert(
                        "Please select a bank."
                    );

                    return;

                }


                // =========================================
                // GET BALANCE
                // =========================================

                let availableBalance =
                    currentUser.balance;


                let accountName =
                    "Main Account";


                if (
                    selectedWithdrawAccount ===
                    "school"
                ) {

                    availableBalance =
                        currentUser.schoolSavings;

                    accountName =
                        "School Savings";

                }


                else if (
                    selectedWithdrawAccount ===
                    "holiday"
                ) {

                    availableBalance =
                        currentUser.holidayBalance;

                    accountName =
                        "Holiday Plan";

                }


                else if (
                    selectedWithdrawAccount ===
                    "custom"
                ) {

                    const customAccount =
                        currentUser.accounts.find(
                            function (account) {

                                return (
                                    account.id ===
                                    selectedWithdrawCustomId
                                );

                            }
                        );


                    if (!customAccount) {

                        alert(
                            "Account could not be found."
                        );

                        return;

                    }


                    availableBalance =
                        customAccount.balance;

                    accountName =
                        customAccount.name;

                }


                // =========================================
                // CHECK BALANCE
                // =========================================

                if (amount > availableBalance) {

                    alert(
                        "Insufficient balance."
                    );

                    return;

                }


                // =========================================
                // DEDUCT
                // =========================================

                if (
                    selectedWithdrawAccount ===
                    "main"
                ) {

                    currentUser.balance -=
                        amount;

                }


                else if (
                    selectedWithdrawAccount ===
                    "school"
                ) {

                    currentUser.schoolSavings -=
                        amount;

                }


                else if (
                    selectedWithdrawAccount ===
                    "holiday"
                ) {

                    currentUser.holidayBalance -=
                        amount;

                }


                else if (
                    selectedWithdrawAccount ===
                    "custom"
                ) {

                    const customAccount =
                        currentUser.accounts.find(
                            function (account) {

                                return (
                                    account.id ===
                                    selectedWithdrawCustomId
                                );

                            }
                        );


                    customAccount.balance -=
                        amount;

                }


                // =========================================
                // EXPENSE
                // =========================================

                currentUser.expense +=
                    amount;


                // =========================================
                // TRANSACTION
                // =========================================

                currentUser.transactions.push({

                    type:
                        "withdrawal",

                    amount:
                        amount,

                    description:
                        "Withdrawal from " +
                        accountName,

                    date:
                        new Date().toISOString(),

                    status:
                        "completed"

                });


                // SAVE

                saveUsers();


                updateBalances();

                updateTransactions();


                // SUCCESS

                document.getElementById(
                    "withdrawSuccessAmount"
                ).textContent =
                    formatMoney(
                        amount
                    );


                withdrawForm.reset();


                closeModal(
                    withdrawModal
                );


                openModal(
                    document.getElementById(
                        "withdrawSuccessModal"
                    )
                );

            }
        );

    }


    // =====================================================
    // WITHDRAW SUCCESS
    // =====================================================

    const withdrawSuccessModal =
        document.getElementById(
            "withdrawSuccessModal"
        );

    const withdrawSuccessBack =
        document.getElementById(
            "withdrawSuccessBack"
        );


    if (withdrawSuccessBack) {

        withdrawSuccessBack.addEventListener(
            "click",
            function () {

                closeModal(
                    withdrawSuccessModal
                );

            }
        );

    }


    // =====================================================
    // CUSTOM ACCOUNT CARDS
    // =====================================================

    function renderCustomAccounts() {

        if (!accountsGrid) {
            return;
        }


        // Remove previously rendered custom cards

        accountsGrid
            .querySelectorAll(
                ".custom-account-card"
            )
            .forEach(
                function (card) {
                    card.remove();
                }
            );


        currentUser.accounts.forEach(
            function (account) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "custom-account-card rounded-xl bg-[#d4f3e8] p-5";


                card.innerHTML = `

                    <div class="flex items-center justify-between">

                        <p class="text-xs font-medium text-[#482080]">
                            ${escapeHTML(account.name)}
                        </p>

                        <i class="fa-solid fa-wallet text-gray-500"></i>

                    </div>


                    <p
                        class="custom-account-balance mt-2 text-xl font-bold"
                        data-account-id="${account.id}"
                    >
                        ${formatMoney(account.balance)}
                    </p>


                    <p class="mt-1 truncate text-xs text-gray-500">
                        ${escapeHTML(account.description || "Custom account")}
                    </p>


                    <div class="mt-5 flex gap-3">

                        <button
                            type="button"
                            class="custom-fund-button rounded-md bg-[#20b985] px-5 py-2 text-xs font-semibold text-white"
                            data-account-id="${account.id}"
                        >
                            Fund
                        </button>


                        <button
                            type="button"
                            class="custom-withdraw-button rounded-md bg-gray-300 px-5 py-2 text-xs font-semibold text-gray-700"
                            data-account-id="${account.id}"
                        >
                            Withdraw
                        </button>

                    </div>

                `;


                accountsGrid.insertBefore(
                    card,
                    addAccountButton
                );


                const fundButton =
                    card.querySelector(
                        ".custom-fund-button"
                    );


                const withdrawButton =
                    card.querySelector(
                        ".custom-withdraw-button"
                    );


                if (fundButton) {

                    fundButton.addEventListener(
                        "click",
                        function () {

                            openFundModal(
                                "custom",
                                account.id
                            );

                        }
                    );

                }


                if (withdrawButton) {

                    withdrawButton.addEventListener(
                        "click",
                        function () {

                            openWithdrawModal(
                                "custom",
                                account.id
                            );

                        }
                    );

                }

            }
        );

    }


    // =====================================================
    // UPDATE CUSTOM ACCOUNT BALANCES
    // =====================================================

    function updateCustomAccountCards() {

        currentUser.accounts.forEach(
            function (account) {

                const balanceElement =
                    document.querySelector(
                        `.custom-account-balance[data-account-id="${account.id}"]`
                    );


                if (balanceElement) {

                    balanceElement.textContent =
                        formatMoney(
                            account.balance
                        );

                }

            }
        );

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // =====================================================
    // ACCOUNT VISIBILITY
    // =====================================================

    const visibilityButtons =
        document.querySelectorAll(
            ".account-visibility"
        );


    visibilityButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const targetId =
                        button.dataset.target;


                    const target =
                        document.getElementById(
                            targetId
                        );


                    const icon =
                        button.querySelector(
                            "i"
                        );


                    if (!target) {
                        return;
                    }


                    target.classList.toggle(
                        "blur-sm"
                    );


                    if (
                        target.classList.contains(
                            "blur-sm"
                        )
                    ) {

                        icon.className =
                            "fa-regular fa-eye";

                    } else {

                        icon.className =
                            "fa-regular fa-eye-slash";

                    }

                }
            );

        }
    );


    // =====================================================
    // TRANSACTIONS
    // =====================================================

    function updateTransactions() {

        if (!transactionList) {
            return;
        }


        transactionList.innerHTML = "";


        const transactions =
            Array.isArray(
                currentUser.transactions
            )
                ? [...currentUser.transactions]
                : [];


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


        transactions.reverse();


        const transactionWrapper =
            document.createElement(
                "div"
            );


        transactionWrapper.className =
            "min-w-[850px]";


        transactions.forEach(
            function (transaction) {

                const row =
                    document.createElement(
                        "div"
                    );


                /*
                 * IMPORTANT:
                 *
                 * There are now exactly 6 columns:
                 *
                 * 1. icon
                 * 2. name
                 * 3. description
                 * 4. date
                 * 5. amount
                 * 6. status
                 */

                row.className =
                    "grid grid-cols-[48px_1.3fr_1.2fr_1fr_1fr_120px] items-center gap-4 border-b border-gray-200 py-4 text-xs";


                // ICON

                const icon =
                    document.createElement(
                        "div"
                    );


                icon.className =
                    "flex h-8 w-8 items-center justify-center rounded-full text-white";


                const type =
                    transaction.type ||
                    "deposit";


                if (
                    type ===
                    "withdrawal"
                ) {

                    icon.classList.add(
                        "bg-red-500"
                    );


                    icon.innerHTML =
                        '<i class="fa-solid fa-minus"></i>';

                } else {

                    icon.classList.add(
                        "bg-[#20b985]"
                    );


                    icon.innerHTML =
                        '<i class="fa-solid fa-plus"></i>';

                }


                // NAME

                const name =
                    document.createElement(
                        "p"
                    );


                name.className =
                    "truncate text-gray-500";


                name.textContent =
                    currentUser.name ||
                    "User";


                // DESCRIPTION

                const description =
                    document.createElement(
                        "p"
                    );


                description.className =
                    "truncate text-gray-500";


                description.textContent =
                    transaction.description ||
                    (
                        type === "withdrawal"
                            ? "Withdrawal"
                            : "Deposit"
                    );


                // DATE

                const date =
                    document.createElement(
                        "p"
                    );


                date.className =
                    "text-gray-400";


                date.textContent =
                    formatTransactionDate(
                        transaction.date
                    );


                // AMOUNT

                const amount =
                    document.createElement(
                        "p"
                    );


                amount.className =
                    "font-semibold";


                if (
                    type ===
                    "withdrawal"
                ) {

                    amount.classList.add(
                        "text-red-500"
                    );


                    amount.textContent =
                        "- " +
                        formatMoney(
                            transaction.amount
                        );

                } else {

                    amount.classList.add(
                        "text-[#20b985]"
                    );


                    amount.textContent =
                        "+ " +
                        formatMoney(
                            transaction.amount
                        );

                }


                // STATUS

                const status =
                    document.createElement(
                        "span"
                    );


                status.className =
                    "rounded-md px-3 py-2 text-center font-medium";


                const transactionStatus =
                    transaction.status ||
                    "completed";


                if (
                    transactionStatus ===
                    "completed"
                ) {

                    status.classList.add(
                        "bg-[#20b985]",
                        "text-white"
                    );


                    status.textContent =
                        "Completed";

                }

                else if (
                    transactionStatus ===
                    "pending"
                ) {

                    status.classList.add(
                        "bg-gray-300",
                        "text-gray-700"
                    );


                    status.textContent =
                        "Pending";

                }

                else {

                    status.classList.add(
                        "bg-red-500",
                        "text-white"
                    );


                    status.textContent =
                        "Canceled";

                }


                row.appendChild(icon);

                row.appendChild(name);

                row.appendChild(description);

                row.appendChild(date);

                row.appendChild(amount);

                row.appendChild(status);


                transactionWrapper.appendChild(
                    row
                );

            }
        );


        transactionList.appendChild(
            transactionWrapper
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
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // =====================================================
    // VIEW ALL TRANSACTIONS
    // =====================================================

    const viewAllTransactions =
        document.getElementById(
            "viewAllTransactions"
        );


    if (viewAllTransactions) {

        viewAllTransactions.addEventListener(
            "click",
            function () {

                window.location.href =
                    "./transactions.html";

            }
        );

    }


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


                const rows =
                    transactionList.querySelectorAll(
                        "min-w-\\[850px\\] > div"
                    );


                if (!searchTerm) {

                    updateTransactions();

                    return;

                }


                transactionList
                    .querySelectorAll(
                        ".grid"
                    )
                    .forEach(
                        function (row) {

                            const text =
                                row.textContent
                                    .toLowerCase();


                            if (
                                text.includes(
                                    searchTerm
                                )
                            ) {

                                row.classList.remove(
                                    "hidden"
                                );

                            } else {

                                row.classList.add(
                                    "hidden"
                                );

                            }

                        }
                    );

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
    // LOGOUT
    // =====================================================

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


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                openModal(
                    logoutModal
                );

            }
        );

    }


    if (cancelLogout) {

        cancelLogout.addEventListener(
            "click",
            function () {

                closeModal(
                    logoutModal
                );

            }
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


    // =====================================================
    // CLOSE MODALS OUTSIDE
    // =====================================================

    const allModals =
        document.querySelectorAll(
            ".fixed.inset-0"
        );


    allModals.forEach(
        function (modal) {

            modal.addEventListener(
                "click",
                function (event) {

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


    // =====================================================
    // ESCAPE
    // =====================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                allModals.forEach(
                    function (modal) {

                        closeModal(
                            modal
                        );

                    }
                );

            }

        }
    );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    updateUserInformation();

    renderCustomAccounts();

    updateBalances();

    updateTransactions();


    console.log(
        "Accounts page initialized."
    );

});