/* =========================================================
   REEN BANK — COMPLETE OVERVIEW.JS
   ---------------------------------------------------------
   Works with:
   - overview.html
   - reenUsers -> localStorage
   - currentUser -> sessionStorage / localStorage
   - Custom accounts
   - Transactions
   - Funding
   - Notifications
   - Search
   - Modals

   IMPORTANT:
   This script is designed for the HTML structure provided.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. STORAGE
    ===================================================== */

    let users = JSON.parse(localStorage.getItem("reenUsers")) || [];

    let sessionUser = null;

    try {
        sessionUser = JSON.parse(
            sessionStorage.getItem("currentUser") ||
            localStorage.getItem("currentUser") ||
            "null"
        );
    } catch (error) {
        sessionUser = null;
    }

    if (!sessionUser || !sessionUser.email) {
        window.location.href = "./register.html";
        return;
    }

    /* =====================================================
       2. FIND FULL USER
    ===================================================== */

    let currentUser = users.find(
        user =>
            String(user.email || "").toLowerCase() ===
            String(sessionUser.email || "").toLowerCase()
    );

    /*
       If user does not exist in reenUsers yet,
       use the session user.
    */

    if (!currentUser) {
        currentUser = {
            ...sessionUser
        };

        users.push(currentUser);

        localStorage.setItem(
            "reenUsers",
            JSON.stringify(users)
        );
    }

    /* =====================================================
       3. NORMALIZE USER DATA
    ===================================================== */

    currentUser.balance = Number(currentUser.balance) || 0;
    currentUser.income = Number(currentUser.income) || 0;
    currentUser.expense = Number(currentUser.expense) || 0;

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


    /* =====================================================
       4. SAVE USER
    ===================================================== */

    function saveUser() {

        const index = users.findIndex(
            user =>
                String(user.email || "").toLowerCase() ===
                String(currentUser.email || "").toLowerCase()
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

        /*
           Keep session identity synchronized.
        */

        const sessionData = {
            name: currentUser.name || "",
            email: currentUser.email || "",
            accountNumber: currentUser.accountNumber || ""
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
       5. HELPERS
    ===================================================== */

    function formatMoney(amount) {

        amount = Number(amount) || 0;

        return `₦ ${amount.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }


    function generateId(prefix = "id") {

        return (
            prefix +
            "_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 9)
        );
    }


    function formatDate(dateValue) {

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }


    function formatDateTime(dateValue) {

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
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
       6. HEADER USER INFORMATION
    ===================================================== */

    const headerUserName =
        document.getElementById("headerUserName");

    const headerAccountNumber =
        document.getElementById("headerAccountNumber");

    const headerProfileImage =
        document.getElementById("headerProfileImage");

    const headerProfileInitials =
        document.getElementById("headerProfileInitials");


    if (headerUserName) {

        headerUserName.textContent =
            currentUser.name ||
            currentUser.email?.split("@")[0] ||
            "User";
    }


    if (headerAccountNumber) {

        headerAccountNumber.textContent =
            currentUser.accountNumber ||
            "0000000000";
    }


    function getInitials(name) {

        if (!name) return "U";

        const parts =
            String(name)
                .trim()
                .split(/\s+/);

        if (parts.length === 1) {
            return parts[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            parts[0][0] +
            parts[parts.length - 1][0]
        ).toUpperCase();
    }


    if (headerProfileInitials) {

        headerProfileInitials.textContent =
            getInitials(currentUser.name);
    }


    if (
        headerProfileImage &&
        currentUser.profileImage
    ) {

        headerProfileImage.src =
            currentUser.profileImage;

        headerProfileImage.classList.remove("hidden");

        if (headerProfileInitials) {
            headerProfileInitials.classList.add("hidden");
        }
    }


    /* =====================================================
       7. BALANCE DISPLAY
    ===================================================== */

    let balanceVisible = true;

    const currentBalance =
        document.getElementById("currentBalance");

    const totalIncome =
        document.getElementById("totalIncome");

    const totalExpense =
        document.getElementById("totalExpense");

    const mainAccountBalance =
        document.getElementById("mainAccountBalance");

    const schoolAccountBalance =
        document.getElementById("schoolAccountBalance");

    const holidayAccountBalance =
        document.getElementById("holidayAccountBalance");


    function renderBalances() {

        if (currentBalance) {
            currentBalance.textContent =
                balanceVisible
                    ? formatMoney(currentUser.balance)
                    : "₦ ••••••";
        }


        if (totalIncome) {
            totalIncome.textContent =
                balanceVisible
                    ? formatMoney(currentUser.income)
                    : "₦ ••••••";
        }


        if (totalExpense) {
            totalExpense.textContent =
                balanceVisible
                    ? formatMoney(currentUser.expense)
                    : "₦ ••••••";
        }


        if (mainAccountBalance) {
            mainAccountBalance.textContent =
                balanceVisible
                    ? formatMoney(currentUser.balance)
                    : "₦ ••••••";
        }


        if (schoolAccountBalance) {
            schoolAccountBalance.textContent =
                balanceVisible
                    ? formatMoney(currentUser.schoolSavings)
                    : "₦ ••••••";
        }


        if (holidayAccountBalance) {
            holidayAccountBalance.textContent =
                balanceVisible
                    ? formatMoney(currentUser.holidayBalance)
                    : "₦ ••••••";
        }


        /*
           Update custom accounts.
        */

        currentUser.accounts.forEach(account => {

            const element =
                document.querySelector(
                    `[data-account-id="${account.id}"]`
                );

            if (!element) return;

            const balanceElement =
                element.querySelector(
                    ".custom-account-balance"
                );

            if (balanceElement) {

                balanceElement.textContent =
                    balanceVisible
                        ? formatMoney(account.balance)
                        : "₦ ••••••";
            }
        });
    }


    const balanceVisibilityButton =
        document.getElementById(
            "balanceVisibilityButton"
        );

    const balanceVisibilityIcon =
        document.getElementById(
            "balanceVisibilityIcon"
        );


    if (balanceVisibilityButton) {

        balanceVisibilityButton.addEventListener(
            "click",
            () => {

                balanceVisible =
                    !balanceVisible;

                if (balanceVisibilityIcon) {

                    balanceVisibilityIcon.className =
                        balanceVisible
                            ? "fa-regular fa-eye-slash text-[13px]"
                            : "fa-regular fa-eye text-[13px]";
                }

                balanceVisibilityButton.title =
                    balanceVisible
                        ? "Hide balance"
                        : "Show balance";

                renderBalances();
            }
        );
    }


    /* =====================================================
       8. STATISTICS
    ===================================================== */

    function renderStatistics() {

        const statisticsIncome =
            document.getElementById(
                "statisticsIncome"
            );

        const statisticsExpense =
            document.getElementById(
                "statisticsExpense"
            );

        const incomeProgress =
            document.getElementById(
                "incomeProgress"
            );

        const expenseProgress =
            document.getElementById(
                "expenseProgress"
            );


        if (statisticsIncome) {

            statisticsIncome.textContent =
                balanceVisible
                    ? formatMoney(currentUser.income)
                    : "₦ ••••••";
        }


        if (statisticsExpense) {

            statisticsExpense.textContent =
                balanceVisible
                    ? formatMoney(currentUser.expense)
                    : "₦ ••••••";
        }


        const total =
            currentUser.income +
            currentUser.expense;


        let incomePercentage = 0;
        let expensePercentage = 0;


        if (total > 0) {

            incomePercentage =
                (currentUser.income / total) * 100;

            expensePercentage =
                (currentUser.expense / total) * 100;
        }


        if (incomeProgress) {

            incomeProgress.style.width =
                `${Math.min(incomePercentage, 100)}%`;
        }


        if (expenseProgress) {

            expenseProgress.style.width =
                `${Math.min(expensePercentage, 100)}%`;
        }
    }


    /* =====================================================
       9. CUSTOM ACCOUNT SUCCESS MODAL
    ===================================================== */

    function createAccountSuccessModal() {

        if (
            document.getElementById(
                "accountCreatedSuccessModal"
            )
        ) {
            return;
        }


        const modal =
            document.createElement("div");

        modal.id =
            "accountCreatedSuccessModal";

        modal.className =
            "fixed inset-0 z-[200] hidden items-center justify-center bg-black/40 px-5 backdrop-blur-sm";


        modal.innerHTML = `

            <div class="w-full max-w-[420px] rounded-[24px] bg-white p-7 text-center shadow-2xl">

                <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f8f1] text-[#20b486]">

                    <i class="fa-solid fa-check text-2xl"></i>

                </div>

                <h3 class="mt-5 text-2xl font-bold text-[#292929]">
                    Account Created Successfully
                </h3>

                <p
                    id="createdAccountSuccessText"
                    class="mt-2 text-sm leading-6 text-[#777]"
                >
                    Your account has been created successfully.
                </p>

                <div class="mt-7 grid grid-cols-2 gap-3">

                    <button
                        type="button"
                        id="createdAccountGoBack"
                        class="h-11 rounded-lg bg-[#edf1ef] text-sm font-semibold text-[#555]"
                    >
                        Go Back
                    </button>

                    <button
                        type="button"
                        id="createdAccountFundButton"
                        class="h-11 rounded-lg bg-[#20b486] text-sm font-semibold text-white"
                    >
                        Fund Account
                    </button>

                </div>

            </div>
        `;


        document.body.appendChild(modal);


        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {
                    closeModal(modal.id);
                }
            }
        );
    }


    createAccountSuccessModal();


    /* =====================================================
       10. DEPOSIT SUCCESS MODAL
    ===================================================== */

    function createDepositSuccessModal() {

        if (
            document.getElementById(
                "depositSuccessModal"
            )
        ) {
            return;
        }


        const modal =
            document.createElement("div");

        modal.id =
            "depositSuccessModal";

        modal.className =
            "fixed inset-0 z-[220] hidden items-center justify-center bg-black/40 px-5 backdrop-blur-sm";


        modal.innerHTML = `

            <div class="w-full max-w-[400px] rounded-[24px] bg-white p-8 text-center shadow-2xl">

                <div class="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#e4f8ef]">

                    <div class="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#20b486] text-white">

                        <i class="fa-solid fa-check text-2xl"></i>

                    </div>

                </div>

                <h3 class="mt-6 text-[25px] font-bold text-[#292929]">
                    Deposit Successful
                </h3>

                <p
                    id="depositSuccessMessage"
                    class="mt-2 text-sm leading-6 text-[#777]"
                >
                    Your deposit was successful.
                </p>

                <div class="mt-5 rounded-xl bg-[#f5faf8] p-4">

                    <p class="text-xs text-[#777]">
                        Amount Deposited
                    </p>

                    <p
                        id="depositSuccessAmount"
                        class="mt-1 text-xl font-bold text-[#20b486]"
                    >
                        ₦ 0.00
                    </p>

                </div>

                <button
                    type="button"
                    id="closeDepositSuccessButton"
                    class="mt-6 h-11 w-full rounded-lg bg-[#20b486] text-sm font-semibold text-white"
                >
                    Done
                </button>

            </div>
        `;


        document.body.appendChild(modal);


        document
            .getElementById(
                "closeDepositSuccessButton"
            )
            ?.addEventListener(
                "click",
                () => {
                    closeModal(
                        "depositSuccessModal"
                    );
                }
            );


        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {

                    closeModal(
                        "depositSuccessModal"
                    );
                }
            }
        );
    }


    createDepositSuccessModal();


    /* =====================================================
       11. GENERIC MODAL FUNCTIONS
    ===================================================== */

    function openModal(id) {

        const modal =
            document.getElementById(id);

        if (!modal) return;

        modal.classList.remove("hidden");
        modal.classList.add("flex");

        document.body.classList.add(
            "overflow-hidden"
        );
    }


    function closeModal(id) {

        const modal =
            document.getElementById(id);

        if (!modal) return;

        modal.classList.add("hidden");
        modal.classList.remove("flex");

        document.body.classList.remove(
            "overflow-hidden"
        );
    }


    document
        .querySelectorAll("[data-close-modal]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.dataset.closeModal
                    );
                }
            );
        });


    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {
                        closeModal(modal.id);
                    }
                }
            );
        });

/* =====================================================
   ADD ACCOUNT
===================================================== */

const addAccountButton =
    document.getElementById("addAccountButton");

const addAccountForm =
    document.getElementById("addAccountForm");

const cancelAddAccountBtn =
    document.getElementById("cancelAddAccountBtn");


addAccountButton?.addEventListener("click", () => {

    addAccountForm?.reset();

    openModal("addAccountModal");
});


cancelAddAccountBtn?.addEventListener("click", () => {

    closeModal("addAccountModal");
});


let newlyCreatedAccount = null;


addAccountForm?.addEventListener("submit", (event) => {

    event.preventDefault();


    /* =================================================
       GET VALUES
    ================================================= */

    const name =
        document
            .getElementById("accountName")
            ?.value
            .trim();


    /*
       Description is OPTIONAL.
       If empty, save an empty string.
    */

    const description =
        document
            .getElementById("accountDescription")
            ?.value
            .trim() || "";


    /* =================================================
       ACCOUNT NAME IS THE ONLY REQUIRED FIELD
    ================================================= */

    if (!name) {

        const accountNameInput =
            document.getElementById("accountName");

        accountNameInput?.focus();

        return;
    }


    /* =================================================
       CREATE ACCOUNT
    ================================================= */

    const newAccount = {

        id: generateId("account"),

        name: name,

        description: description,

        balance: 0,

        transactions: [],

        createdAt: new Date().toISOString()
    };


    /* =================================================
       SAVE ACCOUNT TO CURRENT USER
    ================================================= */

    if (!Array.isArray(currentUser.accounts)) {

        currentUser.accounts = [];
    }


    currentUser.accounts.push(newAccount);


    newlyCreatedAccount = newAccount;


    /* =================================================
       SAVE TO LOCAL STORAGE
    ================================================= */

    saveUser();


    /* =================================================
       RENDER ACCOUNT IMMEDIATELY
    ================================================= */

    renderCustomAccounts();


    /* =================================================
       CLOSE ADD ACCOUNT MODAL
    ================================================= */

    closeModal("addAccountModal");


    /* =================================================
       SHOW SUCCESS MODAL
    ================================================= */

    const successText =
        document.getElementById(
            "createdAccountSuccessText"
        );


    if (successText) {

        successText.textContent =
            `${name} has been created successfully.`;
    }


    openModal(
        "accountCreatedSuccessModal"
    );


    /* =================================================
       RESET FORM
    ================================================= */

    addAccountForm.reset();
});

   

    /* =====================================================
       13. RENDER CUSTOM ACCOUNTS
    ===================================================== */

    function renderCustomAccounts() {

        const container =
            document.getElementById(
                "accountsContainer"
            );

        if (!container) return;


        /*
           Keep the three default accounts.
        */

        const customCards =
            container.querySelectorAll(
                ".custom-account-card"
            );

        customCards.forEach(card => {
            card.remove();
        });


        currentUser.accounts.forEach(
            account => {

                const card =
                    document.createElement("div");

                card.className =
                    "custom-account-card group rounded-[10px] bg-[#d2f2e7] p-7 text-left transition hover:-translate-y-1 hover:shadow-md";

                card.dataset.accountId =
                    account.id;


                card.innerHTML = `

                    <div class="flex items-start justify-between gap-3">

                        <div class="min-w-0">

                            <p class="truncate text-[15px] font-medium text-[#58468c]">
                                ${escapeHTML(account.name)}
                            </p>

                            <p class="custom-account-balance mt-1 text-[19px] font-semibold text-[#292929]">
                                ${formatMoney(account.balance)}
                            </p>
                        </div>
                    </div>
                `;


                container.appendChild(card);
            }
        );


        /*
           Attach funding buttons.
        */

        container
            .querySelectorAll(
                "[data-fund-account-id]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        const accountId =
                            button.dataset
                                .fundAccountId;

                        openFundingModal(
                            accountId
                        );
                    }
                );
            });


        renderBalances();
    }


    /* =====================================================
       14. ACCOUNT CREATED SUCCESS BUTTONS
    ===================================================== */

    document
        .getElementById(
            "createdAccountGoBack"
        )
        ?.addEventListener(
            "click",
            () => {

                closeModal(
                    "accountCreatedSuccessModal"
                );
            }
        );


    document
        .getElementById(
            "createdAccountFundButton"
        )
        ?.addEventListener(
            "click",
            () => {

                if (!newlyCreatedAccount) {
                    closeModal(
                        "accountCreatedSuccessModal"
                    );
                    return;
                }


                const accountId =
                    newlyCreatedAccount.id;


                closeModal(
                    "accountCreatedSuccessModal"
                );


                setTimeout(() => {

                    openFundingModal(
                        accountId
                    );

                }, 200);
            }
        );


    /* =====================================================
       15. FUND WALLET
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


    let selectedFundingAccountId = null;


    /*
       Open funding modal.

       accountId:
       - null = main wallet
       - custom account id = custom account
    */

    function openFundingModal(accountId = null) {

        selectedFundingAccountId =
            accountId || null;


        fundWalletForm?.reset();


        const directPayOption =
            document.getElementById(
                "directPayOption"
            );

        if (directPayOption) {
            directPayOption.checked = true;
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


        openModal(
            "fundWalletModal"
        );
    }


    cancelFundWalletBtn?.addEventListener(
        "click",
        () => {

            closeModal(
                "fundWalletModal"
            );

            selectedFundingAccountId =
                null;
        }
    );


    /* =====================================================
       16. FUNDING METHOD SWITCH
    ===================================================== */

    const paymentMethods =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    paymentMethods.forEach(
        radio => {

            radio.addEventListener(
                "change",
                () => {

                    if (
                        radio.value ===
                        "directPay"
                    ) {

                        directPaySection
                            ?.classList
                            .remove("hidden");

                        creditCardSection
                            ?.classList
                            .add("hidden");

                    } else {

                        directPaySection
                            ?.classList
                            .add("hidden");

                        creditCardSection
                            ?.classList
                            .remove("hidden");
                    }
                }
            );
        }
    );


    /* =====================================================
       17. CARD NUMBER FORMAT
    ===================================================== */

    const cardNumber =
        document.getElementById(
            "cardNumber"
        );


    cardNumber?.addEventListener(
        "input",
        () => {

            let value =
                cardNumber.value
                    .replace(/\D/g, "")
                    .substring(0, 16);

            value =
                value.match(/.{1,4}/g)
                    ?.join(" ") || "";

            cardNumber.value =
                value;
        }
    );


    /* =====================================================
       18. CARD EXPIRY FORMAT
    ===================================================== */

    const cardExpiry =
        document.getElementById(
            "cardExpiry"
        );


    cardExpiry?.addEventListener(
        "input",
        () => {

            let value =
                cardExpiry.value
                    .replace(/\D/g, "")
                    .substring(0, 4);


            if (value.length > 2) {

                value =
                    value.substring(0, 2) +
                    "/" +
                    value.substring(2);
            }


            cardExpiry.value =
                value;
        }
    );


    /* =====================================================
       19. CARD CVC
    ===================================================== */

    const cardCvc =
        document.getElementById(
            "cardCvc"
        );


    cardCvc?.addEventListener(
        "input",
        () => {

            cardCvc.value =
                cardCvc.value
                    .replace(/\D/g, "")
                    .substring(0, 3);
        }
    );


    /* =====================================================
       20. DIRECT PAY VALIDATION
    ===================================================== */

    function getFundingAmount() {

        const selectedMethod =
            document.querySelector(
                'input[name="paymentMethod"]:checked'
            )?.value;


        let amount = 0;


        if (
            selectedMethod ===
            "directPay"
        ) {

            amount =
                Number(
                    document.getElementById(
                        "directPayAmount"
                    )?.value
                );

        } else {

            amount =
                Number(
                    document.getElementById(
                        "cardAmount"
                    )?.value
                );
        }


        return {
            amount,
            method: selectedMethod
        };
    }
/* =====================================================
   21. FUND WALLET SUBMIT
   -----------------------------------------------------
   Deposit/Funding transaction:
   - Green + icon
   - Positive amount
   - transactionType: "deposit"
   - direction: "credit"
===================================================== */

fundWalletForm?.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const {
            amount,
            method
        } = getFundingAmount();


        if (
            !amount ||
            amount <= 0
        ) {
            return;
        }


        /*
           Credit card validation.
        */

        if (
            method ===
            "creditCard"
        ) {

            const number =
                document
                    .getElementById(
                        "cardNumber"
                    )
                    ?.value
                    .replace(/\s/g, "");

            const holder =
                document
                    .getElementById(
                        "cardHolderName"
                    )
                    ?.value
                    .trim();

            const expiry =
                document
                    .getElementById(
                        "cardExpiry"
                    )
                    ?.value
                    .trim();

            const cvc =
                document
                    .getElementById(
                        "cardCvc"
                    )
                    ?.value
                    .trim();


            if (
                !number ||
                number.length < 16 ||
                !holder ||
                !/^\d{2}\/\d{2}$/.test(expiry) ||
                !/^\d{3}$/.test(cvc)
            ) {
                return;
            }


            /*
               Store only safe card information.
               Never store CVC.
            */

            const existingCard =
                currentUser.cards.find(
                    card =>
                        card.lastFour ===
                        number.slice(-4)
                );


            if (!existingCard) {

                currentUser.cards.push({

                    id:
                        generateId("card"),

                    holder,

                    lastFour:
                        number.slice(-4),

                    expiryDate:
                        expiry,

                    addedAt:
                        new Date().toISOString()
                });
            }
        }


        /* =================================================
           DETERMINE TARGET ACCOUNT
        ================================================= */

        let targetAccountName =
            "Main Account";


        let targetAccount = null;


        if (selectedFundingAccountId) {

            targetAccount =
                currentUser.accounts.find(
                    account =>
                        account.id ===
                        selectedFundingAccountId
                );


            if (targetAccount) {

                targetAccountName =
                    targetAccount.name;
            }
        }


        /* =================================================
           UPDATE BALANCE
        ================================================= */

        if (targetAccount) {

            /*
               Funding a custom account.
            */

            targetAccount.balance =
                Number(targetAccount.balance) || 0;

            targetAccount.balance += amount;


            /*
               Make sure its transaction history exists.
            */

            if (
                !Array.isArray(
                    targetAccount.transactions
                )
            ) {

                targetAccount.transactions = [];
            }

        } else {

            /*
               Funding the main account.
            */

            currentUser.balance =
                Number(currentUser.balance) || 0;

            currentUser.balance += amount;
        }


        /*
           Income represents money coming into
           the user's banking system.
        */

        currentUser.income =
            Number(currentUser.income) || 0;

        currentUser.income += amount;


        /* =================================================
           CREATE ONE CONSISTENT DEPOSIT TRANSACTION
        ================================================= */

        const transactionId =
            generateId("transaction");

        const transactionDate =
            new Date().toISOString();


        const transaction = {

            id:
                transactionId,

            /*
               Main transaction classification.
            */

            type:
                "deposit",

            transactionType:
                "deposit",

            category:
                "deposit",

            direction:
                "credit",


            /*
               Display information.
            */

            name:
                "Account Funding",

            title:
                "Deposit",

            description:
                `Deposit to ${targetAccountName}`,


            /*
               Money.
            */

            amount:
                amount,


            /*
               Payment information.
            */

            paymentMethod:
                method,

            accountId:
                selectedFundingAccountId || null,

            accountName:
                targetAccountName,


            /*
               Dates.
            */

            date:
                transactionDate,

            createdAt:
                transactionDate,


            /*
               Status.
            */

            status:
                "successful"
        };


        /*
           Save transaction to the main
           transaction history.
        */

        currentUser.transactions.unshift(
            transaction
        );


        /* =================================================
           SAVE TRANSACTION TO CUSTOM ACCOUNT
        ================================================= */

        if (targetAccount) {

            targetAccount.transactions.unshift({

                id:
                    transactionId,

                type:
                    "deposit",

                transactionType:
                    "deposit",

                category:
                    "deposit",

                direction:
                    "credit",

                name:
                    "Account Funding",

                title:
                    "Deposit",

                description:
                    `Deposit to ${targetAccount.name}`,

                amount:
                    amount,

                paymentMethod:
                    method,

                accountId:
                    targetAccount.id,

                accountName:
                    targetAccount.name,

                date:
                    transactionDate,

                createdAt:
                    transactionDate,

                status:
                    "successful"
            });
        }


        /* =================================================
           CREATE NOTIFICATION
        ================================================= */

        currentUser.notifications.unshift({

            id:
                generateId(
                    "notification"
                ),

            title:
                "Deposit Successful",

            message:
                `${formatMoney(amount)} was deposited into ${targetAccountName}.`,

            type:
                "deposit",

            transactionId:
                transactionId,

            read:
                false,

            createdAt:
                transactionDate
        });


        /* =================================================
           SAVE EVERYTHING
        ================================================= */

        saveUser();


        /* =================================================
           UPDATE DASHBOARD
        ================================================= */

        renderBalances();

        renderStatistics();

        renderTransactions();

        renderNotifications();


        /* =================================================
           CLOSE FUNDING MODAL
        ================================================= */

        closeModal(
            "fundWalletModal"
        );


        /* =================================================
           SUCCESS MODAL
        ================================================= */

        const successAmount =
            document.getElementById(
                "depositSuccessAmount"
            );

        const successMessage =
            document.getElementById(
                "depositSuccessMessage"
            );


        if (successAmount) {

            successAmount.textContent =
                formatMoney(amount);
        }


        if (successMessage) {

            successMessage.textContent =
                `${formatMoney(amount)} has been successfully deposited into ${targetAccountName}.`;
        }


        setTimeout(() => {

            openModal(
                "depositSuccessModal"
            );

        }, 200);


        selectedFundingAccountId =
            null;
    }
);


/* =====================================================
   22. TRANSACTIONS
===================================================== */

const transactionsContainer =
    document.getElementById(
        "transactionsContainer"
    );

const transactionsEmptyState =
    document.getElementById(
        "transactionsEmptyState"
    );


/* =====================================================
   GET TRANSACTION TYPE
===================================================== */

function getTransactionType(transaction) {

    const transactionType =
        String(
            transaction?.transactionType ||
            ""
        ).toLowerCase();


    const type =
        String(
            transaction?.type ||
            ""
        ).toLowerCase();


    const category =
        String(
            transaction?.category ||
            ""
        ).toLowerCase();


    /*
       Always prioritize the explicit
       transactionType.
    */

    if (
        transactionType ===
        "deposit"
    ) {

        return "deposit";
    }


    if (
        transactionType ===
        "withdrawal"
    ) {

        return "withdrawal";
    }


    if (
        transactionType ===
        "expense"
    ) {

        return "withdrawal";
    }


    if (
        type ===
        "deposit" ||
        type ===
        "income"
    ) {

        return "deposit";
    }


    if (
        type ===
        "withdrawal" ||
        type ===
        "expense"
    ) {

        return "withdrawal";
    }


    if (
        category ===
        "deposit"
    ) {

        return "deposit";
    }


    if (
        category ===
        "withdrawal" ||
        category ===
        "expense"
    ) {

        return "withdrawal";
    }


    /*
       Finally use direction.
    */

    if (
        transaction.direction ===
        "credit"
    ) {

        return "deposit";
    }


    if (
        transaction.direction ===
        "debit"
    ) {

        return "withdrawal";
    }


    return "other";
}


/* =====================================================
   CHECK DEPOSIT
===================================================== */

function isDepositTransaction(
    transaction
) {

    return (
        getTransactionType(
            transaction
        ) === "deposit"
    );
}


/* =====================================================
   CHECK WITHDRAWAL
===================================================== */

function isWithdrawalTransaction(
    transaction
) {

    const type =
        getTransactionType(
            transaction
        );


    return (
        type === "withdrawal"
    );
}


/* =====================================================
   TRANSACTION ICON
===================================================== */

function getTransactionIconHTML(
    transaction
) {

    const isDeposit =
        isDepositTransaction(
            transaction
        );


    const isWithdrawal =
        isWithdrawalTransaction(
            transaction
        );


    /*
       DEPOSIT
       Green + icon.
    */

    if (isDeposit) {

        return `

            <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e7f8f1] text-[#20b486]"
            >

                <i
                    class="fa-solid fa-plus text-sm"
                ></i>

            </div>

        `;
    }


    /*
       WITHDRAWAL
       Red - icon.
    */

    if (isWithdrawal) {

        return `

            <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff0f1] text-[#ef5260]"
            >

                <i
                    class="fa-solid fa-minus text-sm"
                ></i>

            </div>

        `;
    }


    /*
       OTHER TRANSACTIONS
       Neutral icon.
    */

    return `

        <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0f2f1] text-[#777]"
        >

            <i
                class="fa-solid fa-arrow-right-arrow-left text-sm"
            ></i>

        </div>

    `;
}


/* =====================================================
   TRANSACTION AMOUNT
===================================================== */

function getTransactionAmountHTML(
    transaction
) {

    const amount =
        Number(
            transaction.amount
        ) || 0;


    const isDeposit =
        isDepositTransaction(
            transaction
        );


    const isWithdrawal =
        isWithdrawalTransaction(
            transaction
        );


    /*
       DEPOSIT
       +₦10,000.00
    */

    if (isDeposit) {

        return `

            <span
                class="font-semibold text-[#20b486]"
            >
                +${balanceVisible
                    ? formatMoney(amount)
                    : "₦ ••••••"
                }
            </span>

        `;
    }


    /*
       WITHDRAWAL
       -₦10,000.00
    */

    if (isWithdrawal) {

        return `

            <span
                class="font-semibold text-[#ef5260]"
            >
                -${balanceVisible
                    ? formatMoney(amount)
                    : "₦ ••••••"
                }
            </span>

        `;
    }


    /*
       OTHER
    */

    return `

        <span
            class="font-semibold text-[#555]"
        >
            ${balanceVisible
                ? formatMoney(amount)
                : "₦ ••••••"
            }
        </span>

    `;
}


/* =====================================================
   RENDER TRANSACTIONS
===================================================== */

function renderTransactions(
    transactions =
        currentUser.transactions
) {

    if (!transactionsContainer) {
        return;
    }


    /*
       Remove existing transaction rows.
    */

    transactionsContainer
        .querySelectorAll(
            ".transaction-row"
        )
        .forEach(row => {

            row.remove();

        });


    /*
       Empty state.
    */

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
       Show latest 8 transactions.
    */

    const latest =
        transactions.slice(
            0,
            8
        );


    latest.forEach(
        transaction => {

            const row =
                document.createElement(
                    "button"
                );


            row.type =
                "button";


            row.className =
                "transaction-row flex w-full items-center justify-between border-b border-[#edf1ef] py-4 text-left transition hover:bg-[#f7fbf9]";


            const title =
                transaction.title ||
                transaction.name ||
                transaction.description ||
                "Transaction";


            const secondaryText =
                transaction.accountName ||
                transaction.description ||
                formatDateTime(
                    transaction.date ||
                    transaction.createdAt
                );


            row.innerHTML = `

                <div class="flex min-w-0 items-center gap-3">

                    ${getTransactionIconHTML(
                        transaction
                    )}

                    <div class="min-w-0">

                        <p
                            class="truncate text-[13px] font-semibold text-[#292929]"
                        >
                            ${escapeHTML(title)}
                        </p>

                        <p
                            class="mt-1 truncate text-[10px] text-[#888]"
                        >
                            ${escapeHTML(
                                secondaryText
                            )}
                        </p>

                    </div>

                </div>


                <div
                    class="ml-3 shrink-0 text-right"
                >

                    <p class="text-[13px]">

                        ${getTransactionAmountHTML(
                            transaction
                        )}

                    </p>

                    <p
                        class="mt-1 text-[9px] text-[#999]"
                    >
                        ${formatDate(
                            transaction.date ||
                            transaction.createdAt
                        )}
                    </p>

                </div>

            `;


            row.addEventListener(
                "click",
                () => {

                    showTransactionDetails(
                        transaction
                    );

                }
            );


            transactionsContainer.appendChild(
                row
            );

        }
    );
}


    /* =====================================================
       23. TRANSACTION DETAILS MODAL
    ===================================================== */

    function showTransactionDetails(
        transaction
    ) {

        const name =
            document.getElementById(
                "transactionModalName"
            );

        const amount =
            document.getElementById(
                "transactionModalAmount"
            );

        const date =
            document.getElementById(
                "transactionModalDate"
            );

        const type =
            document.getElementById(
                "transactionModalType"
            );


        const transactionAmount =
            Number(
                transaction.amount
            ) || 0;


        if (name) {

            name.textContent =
                transaction.title ||
                transaction.name ||
                transaction.description ||
                "Transaction";
        }


        if (amount) {

            amount.textContent =
                formatMoney(
                    transactionAmount
                );
        }


        if (date) {

            date.textContent =
                formatDateTime(
                    transaction.date ||
                    transaction.createdAt
                );
        }


        if (type) {

            type.textContent =
                transaction.transactionType ||
                transaction.type ||
                "Transaction";
        }


        openModal(
            "transactionModal"
        );
    }


    /* =====================================================
       24. VIEW ALL TRANSACTIONS
    ===================================================== */

    document
        .getElementById(
            "viewAllTransactionsButton"
        )
        ?.addEventListener(
            "click",
            () => {

                /*
                   If you later create transactions.html,
                   this will take the user there.
                */

                window.location.href =
                    "./transactions.html";
            }
        );


    /* =====================================================
       25. NOTIFICATION DROPDOWN
    ===================================================== */

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );

    const notificationDot =
        document.getElementById(
            "notificationDot"
        );


    let notificationDropdown = null;


    function createNotificationDropdown() {

        if (
            document.getElementById(
                "notificationDropdown"
            )
        ) {

            notificationDropdown =
                document.getElementById(
                    "notificationDropdown"
                );

            return;
        }


        notificationDropdown =
            document.createElement("div");

        notificationDropdown.id =
            "notificationDropdown";

        notificationDropdown.className =
            "fixed right-5 top-[82px] z-[150] hidden w-[350px] max-w-[calc(100vw-40px)] overflow-hidden rounded-2xl border border-[#e5ece9] bg-white shadow-[0_15px_50px_rgba(0,0,0,0.12)]";


        notificationDropdown.innerHTML = `

            <div class="flex items-center justify-between border-b border-[#edf1ef] px-5 py-4">

                <div>

                    <h3 class="text-sm font-bold text-[#292929]">
                        Notifications
                    </h3>

                    <p
                        id="notificationUnreadText"
                        class="mt-1 text-[10px] text-[#888]"
                    >
                        No unread notifications
                    </p>

                </div>

                <button
                    type="button"
                    id="markAllNotificationsRead"
                    class="text-[10px] font-semibold text-[#20b486] hover:underline"
                >
                    Mark all as read
                </button>

            </div>

            <div
                id="notificationList"
                class="max-h-[420px] overflow-y-auto"
            ></div>

        `;


        document.body.appendChild(
            notificationDropdown
        );


        document
            .getElementById(
                "markAllNotificationsRead"
            )
            ?.addEventListener(
                "click",
                () => {

                    currentUser.notifications
                        .forEach(notification => {
                            notification.read = true;
                        });


                    saveUser();

                    renderNotifications();
                }
            );
    }


    createNotificationDropdown();


    function renderNotifications() {

        if (!notificationDropdown) {
            createNotificationDropdown();
        }


        const list =
            document.getElementById(
                "notificationList"
            );

        const unreadText =
            document.getElementById(
                "notificationUnreadText"
            );


        if (!list) return;


        const unreadCount =
            currentUser.notifications.filter(
                notification =>
                    !notification.read
            ).length;


        /*
           Notification icon count.
        */

        let countElement =
            document.getElementById(
                "notificationCount"
            );


        if (!countElement) {

            countElement =
                document.createElement("span");

            countElement.id =
                "notificationCount";

            countElement.className =
                "absolute -right-1 -top-1 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#ef5260] px-1 text-[8px] font-bold text-white";

            notificationButton?.appendChild(
                countElement
            );
        }


        if (unreadCount > 0) {

            countElement.textContent =
                unreadCount > 99
                    ? "99+"
                    : unreadCount;

            countElement.classList.remove(
                "hidden"
            );

            notificationDot?.classList.add(
                "hidden"
            );

        } else {

            countElement.classList.add(
                "hidden"
            );

            notificationDot?.classList.add(
                "hidden"
            );
        }


        if (unreadText) {

            unreadText.textContent =
                unreadCount === 0
                    ? "No unread notifications"
                    : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`;
        }


        list.innerHTML = "";


        if (
            currentUser.notifications.length === 0
        ) {

            list.innerHTML = `

                <div class="px-5 py-12 text-center">

                    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f7f4] text-[#20b486]">

                        <i class="fa-regular fa-bell"></i>

                    </div>

                    <p class="mt-3 text-sm font-semibold text-[#555]">
                        No notifications
                    </p>

                    <p class="mt-1 text-xs text-[#999]">
                        New account activity will appear here.
                    </p>

                </div>

            `;

            return;
        }


        currentUser.notifications
            .slice(0, 30)
            .forEach(
                notification => {

                    const item =
                        document.createElement("button");

                    item.type =
                        "button";

                    item.className =
                        `flex w-full gap-3 border-b border-[#edf1ef] px-5 py-4 text-left transition hover:bg-[#f7fbf9] ${
                            notification.read
                                ? "bg-white"
                                : "bg-[#f1fbf7]"
                        }`;


                    item.innerHTML = `

                        <div class="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            notification.read
                                ? "bg-[#f0f2f1] text-[#777]"
                                : "bg-[#dff7ed] text-[#20b486]"
                        }">

                            <i class="fa-solid fa-bell text-xs"></i>

                        </div>

                        <div class="min-w-0 flex-1">

                            <div class="flex items-start justify-between gap-2">

                                <p class="text-[12px] font-semibold text-[#292929]">
                                    ${escapeHTML(
                                        notification.title ||
                                        "Notification"
                                    )}
                                </p>

                                ${
                                    !notification.read
                                        ? `<span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#20b486]"></span>`
                                        : ""
                                }

                            </div>

                            <p class="mt-1 text-[11px] leading-5 text-[#777]">
                                ${escapeHTML(
                                    notification.message ||
                                    ""
                                )}
                            </p>

                            <p class="mt-1 text-[9px] text-[#aaa]">
                                ${formatDateTime(
                                    notification.createdAt
                                )}
                            </p>

                        </div>
                    `;


                    item.addEventListener(
                        "click",
                        () => {

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
                                            item.id ===
                                            notification.transactionId
                                    );


                                if (transaction) {

                                    closeNotificationDropdown();

                                    showTransactionDetails(
                                        transaction
                                    );
                                }
                            }
                        }
                    );


                    list.appendChild(item);
                }
            );
    }


    function openNotificationDropdown() {

        notificationDropdown?.classList.remove(
            "hidden"
        );
    }


    function closeNotificationDropdown() {

        notificationDropdown?.classList.add(
            "hidden"
        );
    }


    notificationButton?.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            const isHidden =
                notificationDropdown?.classList.contains(
                    "hidden"
                );


            if (isHidden) {

                renderNotifications();

                openNotificationDropdown();

            } else {

                closeNotificationDropdown();
            }
        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                notificationDropdown &&
                !notificationDropdown.contains(
                    event.target
                ) &&
                !notificationButton?.contains(
                    event.target
                )
            ) {

                closeNotificationDropdown();
            }
        }
    );


    /* =====================================================
       26. SEARCH
    ===================================================== */

    const searchButton =
        document.getElementById(
            "searchButton"
        );


    let searchWrapper = null;
    let searchInput = null;
    let searchResults = null;


    function createSearchUI() {

        if (
            document.getElementById(
                "dashboardSearchWrapper"
            )
        ) {

            searchWrapper =
                document.getElementById(
                    "dashboardSearchWrapper"
                );

            searchInput =
                document.getElementById(
                    "dashboardSearchInput"
                );

            searchResults =
                document.getElementById(
                    "dashboardSearchResults"
                );

            return;
        }


        searchWrapper =
            document.createElement("div");

        searchWrapper.id =
            "dashboardSearchWrapper";

        searchWrapper.className =
            "fixed right-5 top-[70px] z-[150] w-[390px] max-w-[calc(100vw-40px)]";


        searchWrapper.innerHTML = `

            <div class="relative">

                <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#888]"></i>

                <input
                    id="dashboardSearchInput"
                    type="text"
                    autocomplete="off"
                    placeholder="Search transactions or accounts..."
                    class="h-12 w-full rounded-xl border border-[#dfe8e4] bg-white pl-11 pr-10 text-sm text-[#333] shadow-lg outline-none focus:border-[#20b486]"
                >

                <button
                    type="button"
                    id="closeDashboardSearch"
                    class="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#777] hover:bg-[#f0f4f2]"
                >

                    <i class="fa-solid fa-xmark text-xs"></i>

                </button>

            </div>

            <div
                id="dashboardSearchResults"
                class="mt-2 hidden max-h-[420px] overflow-y-auto rounded-xl border border-[#e5ece9] bg-white shadow-xl"
            ></div>

        `;


        document.body.appendChild(
            searchWrapper
        );


        searchInput =
            document.getElementById(
                "dashboardSearchInput"
            );

        searchResults =
            document.getElementById(
                "dashboardSearchResults"
            );


        document
            .getElementById(
                "closeDashboardSearch"
            )
            ?.addEventListener(
                "click",
                closeSearch
            );


        searchInput?.addEventListener(
            "input",
            () => {

                performSearch(
                    searchInput.value
                );
            }
        );


        searchInput?.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeSearch();
                }
            }
        );
    }


    function openSearch() {

        createSearchUI();

        searchWrapper?.classList.remove(
            "hidden"
        );

        setTimeout(() => {

            searchInput?.focus();

        }, 50);
    }


    function closeSearch() {

        searchWrapper?.classList.add(
            "hidden"
        );

        if (searchResults) {

            searchResults.classList.add(
                "hidden"
            );
        }
    }


    searchButton?.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            openSearch();
        }
    );


    function performSearch(value) {

        const query =
            String(value || "")
                .trim()
                .toLowerCase();


        if (!searchResults) return;


        if (!query) {

            searchResults.classList.add(
                "hidden"
            );

            searchResults.innerHTML =
                "";

            return;
        }


        searchResults.classList.remove(
            "hidden"
        );


        const matchingAccounts =
            currentUser.accounts.filter(
                account =>
                    String(
                        account.name || ""
                    )
                        .toLowerCase()
                        .includes(query) ||

                    String(
                        account.description || ""
                    )
                        .toLowerCase()
                        .includes(query)
            );


        const matchingTransactions =
            currentUser.transactions.filter(
                transaction => {

                    const searchable = [

                        transaction.name,

                        transaction.title,

                        transaction.description,

                        transaction.accountName,

                        transaction.paymentMethod,

                        transaction.type,

                        transaction.transactionType,

                        transaction.category

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return searchable.includes(
                        query
                    );
                }
            );


        if (
            matchingAccounts.length === 0 &&
            matchingTransactions.length === 0
        ) {

            searchResults.innerHTML = `

                <div class="px-5 py-10 text-center">

                    <i class="fa-solid fa-magnifying-glass text-xl text-[#aaa]"></i>

                    <p class="mt-3 text-sm font-semibold text-[#555]">
                        No results found
                    </p>

                    <p class="mt-1 text-xs text-[#999]">
                        Try another account or transaction.
                    </p>

                </div>

            `;

            return;
        }


        let html = "";


        if (
            matchingAccounts.length > 0
        ) {

            html += `

                <div class="border-b border-[#edf1ef]">

                    <div class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#999]">
                        Accounts
                    </div>

            `;


            matchingAccounts
                .slice(0, 5)
                .forEach(account => {

                    html += `

                        <button
                            type="button"
                            data-search-account="${account.id}"
                            class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#f6faf8]"
                        >

                            <div class="flex min-w-0 items-center gap-3">

                                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#dff7ed] text-[#20b486]">

                                    <i class="fa-regular fa-credit-card text-xs"></i>

                                </div>

                                <div class="min-w-0">

                                    <p class="truncate text-xs font-semibold text-[#333]">
                                        ${escapeHTML(account.name)}
                                    </p>

                                    <p class="truncate text-[10px] text-[#999]">
                                        ${escapeHTML(account.description)}
                                    </p>

                                </div>

                            </div>

                            <span class="ml-3 shrink-0 text-xs font-semibold text-[#20b486]">
                                ${formatMoney(account.balance)}
                            </span>

                        </button>
                    `;
                });


            html += `</div>`;
        }


        if (
            matchingTransactions.length > 0
        ) {

            html += `

                <div>

                    <div class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#999]">
                        Transactions
                    </div>

            `;


            matchingTransactions
                .slice(0, 8)
                .forEach(transaction => {

                    const amount =
                        Number(
                            transaction.amount
                        ) || 0;


                    const type =
                        getTransactionType(
                            transaction
                        );


                    const isExpense =
                        type === "expense" ||
                        type === "withdrawal" ||
                        transaction.direction ===
                            "debit";


                    html += `

                        <button
                            type="button"
                            data-search-transaction="${transaction.id}"
                            class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#f6faf8]"
                        >

                            <div class="flex min-w-0 items-center gap-3">

                                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                    isExpense
                                        ? "bg-[#fff0f1] text-[#ef5260]"
                                        : "bg-[#e7f8f1] text-[#20b486]"
                                }">

                                    <i class="fa-solid ${
                                        isExpense
                                            ? "fa-arrow-up-right-from-square"
                                            : "fa-arrow-down-left"
                                    } text-xs"></i>

                                </div>

                                <div class="min-w-0">

                                    <p class="truncate text-xs font-semibold text-[#333]">
                                        ${escapeHTML(
                                            transaction.title ||
                                            transaction.name ||
                                            "Transaction"
                                        )}
                                    </p>

                                    <p class="truncate text-[10px] text-[#999]">
                                        ${formatDate(
                                            transaction.date ||
                                            transaction.createdAt
                                        )}
                                    </p>

                                </div>

                            </div>

                            <span class="ml-3 shrink-0 text-xs font-semibold ${
                                isExpense
                                    ? "text-[#ef5260]"
                                    : "text-[#20b486]"
                            }">

                                ${isExpense ? "-" : "+"}
                                ${formatMoney(amount)}

                            </span>

                        </button>
                    `;
                });


            html += `</div>`;
        }


        searchResults.innerHTML =
            html;


        /*
           Account results.
        */

        searchResults
            .querySelectorAll(
                "[data-search-account]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset
                                .searchAccount;

                        const card =
                            document.querySelector(
                                `[data-account-id="${id}"]`
                            );


                        closeSearch();


                        if (card) {

                            card.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });


                            card.classList.add(
                                "ring-2",
                                "ring-[#20b486]"
                            );


                            setTimeout(() => {

                                card.classList.remove(
                                    "ring-2",
                                    "ring-[#20b486]"
                                );

                            }, 1800);
                        }
                    }
                );
            });


        /*
           Transaction results.
        */

        searchResults
            .querySelectorAll(
                "[data-search-transaction]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset
                                .searchTransaction;


                        const transaction =
                            currentUser.transactions.find(
                                item =>
                                    item.id === id
                            );


                        if (transaction) {

                            closeSearch();

                            showTransactionDetails(
                                transaction
                            );
                        }
                    }
                );
            });
    }


    /* =====================================================
       27. DATE FILTERS
    ===================================================== */

    const dateFilterButton =
        document.getElementById(
            "dateFilterButton"
        );

    const dateFilterText =
        document.getElementById(
            "dateFilterText"
        );


    const statisticsFilterButton =
        document.getElementById(
            "statisticsFilterButton"
        );

    const statisticsFilterText =
        document.getElementById(
            "statisticsFilterText"
        );


    /*
       Simple dropdown for date filters.
    */

    function createDateFilter(
        button,
        textElement,
        onSelect
    ) {

        if (!button) return;


        let dropdown = null;


        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                if (dropdown) {

                    dropdown.remove();

                    dropdown = null;

                    return;
                }


                dropdown =
                    document.createElement("div");


                dropdown.className =
                    "absolute z-[120] mt-2 w-[150px] overflow-hidden rounded-xl border border-[#e5ece9] bg-white shadow-xl";


                const options = [
                    "Today",
                    "This Week",
                    "This Month",
                    "This Year"
                ];


                options.forEach(option => {

                    const item =
                        document.createElement("button");

                    item.type =
                        "button";

                    item.className =
                        "block w-full px-4 py-3 text-left text-xs text-[#555] hover:bg-[#f2f8f5]";


                    item.textContent =
                        option;


                    item.addEventListener(
                        "click",
                        () => {

                            if (textElement) {
                                textElement.textContent =
                                    option;
                            }


                            onSelect(option);


                            dropdown?.remove();

                            dropdown =
                                null;
                        }
                    );


                    dropdown.appendChild(
                        item
                    );
                });


                button.parentElement.style.position =
                    "relative";


                button.parentElement.appendChild(
                    dropdown
                );
            }
        );


        document.addEventListener(
            "click",
            () => {

                dropdown?.remove();

                dropdown = null;
            }
        );
    }


    createDateFilter(
        dateFilterButton,
        dateFilterText,
        () => {}
    );


    createDateFilter(
        statisticsFilterButton,
        statisticsFilterText,
        () => {}
    );


    /* =====================================================
       28. PRO MODAL
    ===================================================== */

    document
        .getElementById(
            "upgradeProButton"
        )
        ?.addEventListener(
            "click",
            () => {

                openModal(
                    "upgradeModal"
                );
            }
        );


    document
        .getElementById(
            "continueUpgradeButton"
        )
        ?.addEventListener(
            "click",
            () => {

                /*
                   PRO functionality can be connected
                   here later.
                */

                closeModal(
                    "upgradeModal"
                );
            }
        );


    /* =====================================================
       29. LOGOUT
    ===================================================== */

    document
        .getElementById(
            "logoutButton"
        )
        ?.addEventListener(
            "click",
            () => {

                openModal(
                    "logoutModal"
                );
            }
        );


    document
        .getElementById(
            "confirmLogoutButton"
        )
        ?.addEventListener(
            "click",
            () => {

                sessionStorage.removeItem(
                    "currentUser"
                );

                localStorage.removeItem(
                    "currentUser"
                );

                window.location.href =
                    "./index.html";
            }
        );


    /* =====================================================
       30. MOBILE SIDEBAR
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


    function openSidebar() {

        sidebar?.classList.remove(
            "-translate-x-full"
        );

        sidebarOverlay?.classList.remove(
            "hidden"
        );

        document.body.classList.add(
            "overflow-hidden"
        );
    }


    function closeSidebar() {

        sidebar?.classList.add(
            "-translate-x-full"
        );

        sidebarOverlay?.classList.add(
            "hidden"
        );

        document.body.classList.remove(
            "overflow-hidden"
        );
    }


    mobileMenuButton?.addEventListener(
        "click",
        openSidebar
    );


    sidebarOverlay?.addEventListener(
        "click",
        closeSidebar
    );


    /* =====================================================
       31. SIDEBAR NAVIGATION
    ===================================================== */

    document
        .getElementById(
            "accountsNav"
        )
        ?.addEventListener(
            "click",
            () => {

                window.location.href =
                    "./account.html";
            }
        );


    document
        .getElementById(
            "profileNav"
        )
        ?.addEventListener(
            "click",
            () => {

                window.location.href =
                    "./profile.html";
            }
        );


    document
        .getElementById(
            "transactionsNav"
        )
        ?.addEventListener(
            "click",
            () => {

                window.location.href =
                    "./transactions.html";
            }
        );


    /* =====================================================
       32. HEADER PROFILE
    ===================================================== */

    document
        .getElementById(
            "headerProfileButton"
        )
        ?.addEventListener(
            "click",
            event => {

                /*
                   Prevent the nested <a> from causing
                   double navigation.
                */

                const link =
                    event.currentTarget
                        .querySelector("a");

                if (link) {
                    window.location.href =
                        link.href;
                }
            }
        );


    /* =====================================================
       33. CLOSE MODALS WITH ESCAPE
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


            document
                .querySelectorAll(
                    ".modal, #fundWalletModal, #addAccountModal, #accountCreatedSuccessModal, #depositSuccessModal"
                )
                .forEach(modal => {

                    if (
                        !modal.classList.contains(
                            "hidden"
                        )
                    ) {

                        closeModal(
                            modal.id
                        );
                    }
                });


            closeSearch();

            closeNotificationDropdown();

            closeSidebar();
        }
    );


    /* =====================================================
       34. INITIAL RENDER
    ===================================================== */

    renderCustomAccounts();

    renderBalances();

    renderStatistics();

    renderTransactions();

    renderNotifications();


    /* =====================================================
       35. FINAL SAVE
       -----------------------------------------------------
       Save only after normalization. This makes sure old
       users receive the new arrays without losing data.
    ===================================================== */

    saveUser();

});