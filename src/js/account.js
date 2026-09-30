/* =========================================================
   REEN BANK — ACCOUNTS PAGE JAVASCRIPT
   ---------------------------------------------------------
   Compatible with:
   - accounts.html
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
   ✓ Fund Account
   ✓ Direct Pay
   ✓ Credit Card
   ✓ Withdraw
   ✓ Deposit Transactions
   ✓ Withdrawal Transactions
   ✓ Notifications
   ✓ Search
   ✓ Balance Visibility
   ✓ Add Account
   ✓ Account Created Modal
   ✓ Deposit Success Modal
   ✓ Withdrawal Success Modal
   ✓ Logout Modal
   ✓ Cross-page synchronization
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. STORAGE
    ===================================================== */

    let currentUser = ReenStorage.loadCurrentUser();

    if (!currentUser) {
        return;
    }

    let users = ReenStorage.getUsers();

    /* =====================================================
       3. NORMALIZE USER DATA
    ===================================================== */

    function normalizeCurrentUser() {

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

        currentUser.notifications =
            Array.isArray(currentUser.notifications)
                ? currentUser.notifications
                : [];

        currentUser.accounts =
            Array.isArray(currentUser.accounts)
                ? currentUser.accounts
                : [];

        currentUser.cards =
            Array.isArray(currentUser.cards)
                ? currentUser.cards
                : [];


        /*
           IMPORTANT:

           Every custom account must have a numeric balance.
           This makes the aggregate Current Balance reliable.
        */

        currentUser.accounts.forEach(account => {

            account.balance =
                Number(account.balance) || 0;

            account.transactions =
                Array.isArray(account.transactions)
                    ? account.transactions
                    : [];

        });
    }

    normalizeCurrentUser();


    /* =====================================================
       3B. ENSURE STANDARD ACCOUNTS
       -----------------------------------------------------
       All account balances use accounts[] as the canonical
       source. Legacy fields remain synchronized for older
       code and existing saved users.
    ===================================================== */

    function ensureStandardAccounts() {
        const definitions = [
            { id: "main", type: "main", name: "Main Account", description: "Primary Reen Bank account", legacy: "balance" },
            { id: "schoolSavings", type: "school", name: "School Savings", description: "Savings for school expenses", legacy: "schoolSavings" },
            { id: "holidaySavings", type: "holiday", name: "Holiday Plan", description: "Savings for holidays and trips", legacy: "holidayBalance" }
        ];

        definitions.forEach((definition) => {
            let account = currentUser.accounts.find(
                item => String(item.id) === definition.id ||
                    String(item.type || "").toLowerCase() === definition.type
            );

            if (!account) {
                account = {
                    id: definition.id,
                    type: definition.type,
                    name: definition.name,
                    description: definition.description,
                    balance: Number(currentUser[definition.legacy]) || 0,
                    createdAt: new Date().toISOString()
                };
                currentUser.accounts.push(account);
            }

            account.balance = Number(account.balance) || 0;
            currentUser[definition.legacy] = account.balance;
        });
    }

    ensureStandardAccounts();


    /* =====================================================
       4. DEFAULT ACCOUNT DATA
    ===================================================== */

    let accountNumberWasGenerated = false;

    if (
        !currentUser.accountNumber &&
        !currentUser.accountNo
    ) {
        currentUser.accountNumber =
            generateAccountNumber();
        accountNumberWasGenerated = true;
    }


    /* =====================================================
       5. SAVE USER
    ===================================================== */

    function saveUser() {
        return ReenStorage.saveCurrentUser(currentUser);
    }


    /* =====================================================
       6. HELPERS
    ===================================================== */

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


    function generateAccountNumber() {

        return String(
            Math.floor(
                1000000000 +
                Math.random() * 9000000000
            )
        );
    }


    function formatMoney(amount) {

        return (
            "₦ " +
            Number(amount || 0).toLocaleString(
                "en-NG",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )
        );
    }


    function formatDateTime(dateValue) {

        const date =
            dateValue
                ? new Date(dateValue)
                : new Date();


        if (Number.isNaN(date.getTime())) {
            return "—";
        }


        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ) +
            " - " +
            date.toLocaleTimeString(
                "en-GB",
                {
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


    function getUserName() {
        return currentUser?.username || "User";
    }


    function getAccountNumber() {

        return (
            currentUser.accountNumber ||
            currentUser.accountNo ||
            "0000000000"
        );
    }


    /* =====================================================
       7. ACCOUNT HELPERS
    ===================================================== */

    function getAccountName(accountId) {

        switch (accountId) {

            case "main":
                return "Main Account";

            case "schoolSavings":
                return "School Savings";

            case "holidaySavings":
                return "Holiday Plan";

            default: {

                const account =
                    currentUser.accounts.find(
                        item =>
                            String(item.id) ===
                            String(accountId)
                    );

                return account
                    ? account.name
                    : "Account";
            }
        }
    }


    function getAccountBalance(accountId) {
        const account = currentUser.accounts.find(
            item => String(item.id) === String(accountId)
        );

        if (account) {
            return Number(account.balance) || 0;
        }

        /* Legacy fallback for older accounts created before the unified model. */
        if (accountId === "main") return Number(currentUser.balance) || 0;
        if (accountId === "schoolSavings") return Number(currentUser.schoolSavings) || 0;
        if (accountId === "holidaySavings") return Number(currentUser.holidayBalance) || 0;

        return 0;
    }


    function setAccountBalance(accountId, newBalance) {
        const balance = Math.max(0, Number(newBalance) || 0);
        let account = currentUser.accounts.find(
            item => String(item.id) === String(accountId)
        );

        if (!account) {
            const definitions = {
                main: { type: "main", name: "Main Account", description: "Primary Reen Bank account" },
                schoolSavings: { type: "school", name: "School Savings", description: "Savings for school expenses" },
                holidaySavings: { type: "holiday", name: "Holiday Plan", description: "Savings for holidays and trips" }
            };

            const definition = definitions[accountId];
            if (definition) {
                account = {
                    id: accountId,
                    ...definition,
                    balance: 0,
                    createdAt: new Date().toISOString()
                };
                currentUser.accounts.push(account);
            }
        }

        if (account) account.balance = balance;

        /* Keep old fields synchronized for compatibility with older code. */
        if (accountId === "main") currentUser.balance = balance;
        if (accountId === "schoolSavings") currentUser.schoolSavings = balance;
        if (accountId === "holidaySavings") currentUser.holidayBalance = balance;
    }


    /* =====================================================
       8. IMPORTANT CURRENT BALANCE CALCULATION
       -----------------------------------------------------
       Current Balance is the TOTAL of every account in the
       canonical accounts array. This prevents the same money
       from being counted twice when legacy balance fields exist.
    ===================================================== */

    function calculateCurrentBalance() {
        return currentUser.accounts.reduce(
            (total, account) => total + (Number(account.balance) || 0),
            0
        );
    }


    function getAccountObject(accountId) {

        if (
            accountId === "main" ||
            accountId === "schoolSavings" ||
            accountId === "holidaySavings"
        ) {
            return null;
        }


        return currentUser.accounts.find(
            account =>
                String(account.id) ===
                String(accountId)
        ) || null;
    }


    /* =====================================================
       9. HEADER
    ===================================================== */

    function renderHeader() {

        const nameElement =
            document.getElementById(
                "headerUserName"
            );


        const accountElement =
            document.getElementById(
                "headerAccountNumber"
            );


        if (nameElement) {

            nameElement.textContent =
                getUserName();
        }


        if (accountElement) {

            accountElement.textContent =
                getAccountNumber();
        }


        const profileImage =
            document.getElementById(
                "headerProfileImage"
            );

        const profileInitials =
            document.getElementById(
                "headerProfileInitials"
            );

        const image = String(
            currentUser?.profileImage ||
            currentUser?.avatar ||
            ""
        ).trim();

        const name = String(
            currentUser?.name ||
            currentUser?.username ||
            "User"
        ).trim();

        const initials = name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("") || "U";

        if (profileInitials) {
            profileInitials.textContent = initials;
        }

        if (profileImage) {
            if (image) {
                profileImage.src = image;
                profileImage.classList.remove("hidden");
                profileImage.style.display = "block";

                if (profileInitials) {
                    profileInitials.classList.add("hidden");
                    profileInitials.classList.remove("flex");
                }
            } else {
                profileImage.removeAttribute("src");
                profileImage.classList.add("hidden");
                profileImage.style.display = "none";

                if (profileInitials) {
                    profileInitials.classList.remove("hidden");
                    profileInitials.classList.add("flex");
                }
            }
        }
    }


    /* =====================================================
       10. BALANCE VISIBILITY
    ===================================================== */

    const hiddenBalances = {};


    function renderBalances() {

        /*
           -------------------------------------------------
           INDIVIDUAL ACCOUNT BALANCES
           -------------------------------------------------
        */

        document
            .querySelectorAll(
                "[data-balance]"
            )
            .forEach(element => {

                const accountId =
                    element.dataset.balance;


                /*
                   "current" is reserved for the
                   aggregate Current Balance.
                */

                if (
                    accountId === "current" ||
                    accountId === "total"
                ) {
                    return;
                }


                const balance =
                    getAccountBalance(
                        accountId
                    );


                if (
                    hiddenBalances[accountId]
                ) {

                    element.textContent =
                        "₦ ••••••";

                } else {

                    element.textContent =
                        formatMoney(
                            balance
                        );
                }
            });


        /*
           -------------------------------------------------
           AGGREGATE CURRENT BALANCE
           -------------------------------------------------
        */

        const currentBalance =
            calculateCurrentBalance();


        /*
           Support the IDs commonly used by
           your Overview / Accounts HTML.
        */

        const currentBalanceElements =
            new Set();


        const currentBalanceById = [
            "currentBalance",
            "totalCurrentBalance",
            "accountCurrentBalance"
        ];


        currentBalanceById.forEach(id => {

            const element =
                document.getElementById(id);

            if (element) {
                currentBalanceElements.add(
                    element
                );
            }
        });


        document
            .querySelectorAll(
                "[data-current-balance]"
            )
            .forEach(element => {

                currentBalanceElements.add(
                    element
                );
            });


        document
            .querySelectorAll(
                '[data-balance="current"], [data-balance="total"]'
            )
            .forEach(element => {

                currentBalanceElements.add(
                    element
                );
            });


        currentBalanceElements.forEach(
            element => {

                if (
                    hiddenBalances.currentBalance
                ) {

                    element.textContent =
                        "₦ ••••••";

                } else {

                    element.textContent =
                        formatMoney(
                            currentBalance
                        );
                }
            }
        );


        updateBalanceEyes();
    }


    function updateBalanceEyes() {

        document
            .querySelectorAll(
                "[data-balance-toggle]"
            )
            .forEach(button => {

                const accountId =
                    button.dataset.balanceToggle;


                const icon =
                    button.querySelector("i");


                if (!icon) {
                    return;
                }


                /*
                   Current Balance eye can use:
                   data-balance-toggle="current"
                   or
                   data-balance-toggle="total"
                */

                const visibilityKey =
                    (
                        accountId === "current" ||
                        accountId === "total"
                    )
                        ? "currentBalance"
                        : accountId;


                if (
                    hiddenBalances[
                        visibilityKey
                    ]
                ) {

                    icon.className =
                        "fa-regular fa-eye text-[12px]";

                    button.setAttribute(
                        "aria-label",
                        "Show balance"
                    );

                } else {

                    icon.className =
                        "fa-regular fa-eye-slash text-[12px]";

                    button.setAttribute(
                        "aria-label",
                        "Hide balance"
                    );
                }
            });
    }


    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-balance-toggle]"
                );


            if (!button) {
                return;
            }


            const accountId =
                button.dataset.balanceToggle;


            const visibilityKey =
                (
                    accountId === "current" ||
                    accountId === "total"
                )
                    ? "currentBalance"
                    : accountId;


            hiddenBalances[
                visibilityKey
            ] =
                !hiddenBalances[
                    visibilityKey
                ];


            renderBalances();
        }
    );


    /* =====================================================
       11. MODAL HELPERS
    ===================================================== */

    function openModal(id) {

        const modal =
            document.getElementById(id);


        if (!modal) {
            return;
        }


        modal.classList.remove("hidden");
        modal.classList.add("flex");


        document.body.classList.add(
            "overflow-hidden"
        );
    }


    function closeModal(id) {

        const modal =
            document.getElementById(id);


        if (!modal) {
            return;
        }


        modal.classList.add("hidden");
        modal.classList.remove("flex");


        const activeModal =
            document.querySelector(
                ".fixed.inset-0.flex"
            );


        if (!activeModal) {

            document.body.classList.remove(
                "overflow-hidden"
            );
        }
    }


    document.addEventListener(
        "click",
        event => {

            const modal =
                event.target.closest(
                    ".modal-backdrop"
                );


            if (
                modal &&
                event.target === modal
            ) {

                closeModal(
                    modal.id
                );
            }
        }
    );


    /* =====================================================
       12. ADD ACCOUNT
    ===================================================== */

    const addAccountButton =
        document.getElementById(
            "addAccountButton"
        );


    const addAccountForm =
        document.getElementById(
            "addAccountForm"
        );


    const cancelAddAccountButton =
        document.getElementById(
            "cancelAddAccountButton"
        );


    const closeAddAccountModal =
        document.getElementById(
            "closeAddAccountModal"
        );


    if (addAccountButton) {

        addAccountButton.addEventListener(
            "click",
            () => {

                const form =
                    document.getElementById(
                        "addAccountForm"
                    );


                if (form) {
                    form.reset();
                }


                const error =
                    document.getElementById(
                        "accountNameError"
                    );


                if (error) {

                    error.classList.add(
                        "hidden"
                    );

                    error.textContent = "";
                }


                openModal(
                    "addAccountModal"
                );
            }
        );
    }


    function closeAddAccount() {

        closeModal(
            "addAccountModal"
        );
    }


    if (cancelAddAccountButton) {

        cancelAddAccountButton.addEventListener(
            "click",
            closeAddAccount
        );
    }


    if (closeAddAccountModal) {

        closeAddAccountModal.addEventListener(
            "click",
            closeAddAccount
        );
    }


    if (addAccountForm) {

        addAccountForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const nameInput =
                    document.getElementById(
                        "accountNameInput"
                    );


                const typeInput =
                    document.getElementById(
                        "accountTypeInput"
                    );


                const descriptionInput =
                    document.getElementById(
                        "accountDescriptionInput"
                    );


                const errorElement =
                    document.getElementById(
                        "accountNameError"
                    );


                const name =
                    nameInput?.value.trim() || "";


                const type =
                    typeInput?.value ||
                    "savings";


                const description =
                    descriptionInput?.value.trim() ||
                    "";


                if (!name) {

                    if (errorElement) {

                        errorElement.textContent =
                            "Please enter an account name.";

                        errorElement.classList.remove(
                            "hidden"
                        );
                    }

                    nameInput?.focus();

                    return;
                }


                if (errorElement) {

                    errorElement.classList.add(
                        "hidden"
                    );

                    errorElement.textContent = "";
                }


                const account = {

                    id:
                        generateId(
                            "account"
                        ),

                    name,

                    type,

                    description,

                    balance: 0,

                    transactions: [],

                    createdAt:
                        new Date().toISOString()
                };


                currentUser.accounts.push(
                    account
                );


                saveUser();


                renderCustomAccounts();
                renderBalances();


                closeModal(
                    "addAccountModal"
                );


                const message =
                    document.getElementById(
                        "createdAccountMessage"
                    );


                if (message) {

                    message.textContent =
                        `${name} has been created successfully.`;
                }


                newlyCreatedAccountId =
                    account.id;


                openModal(
                    "accountCreatedModal"
                );
            }
        );
    }


    /* =====================================================
       13. CUSTOM ACCOUNT RENDERING
    ===================================================== */

    function renderCustomAccounts() {

        document
            .querySelectorAll(
                ".custom-account-card"
            )
            .forEach(
                card => card.remove()
            );


        const grid =
            document.getElementById(
                "accountsGrid"
            );


        const addButton =
            document.getElementById(
                "addAccountButton"
            );


        if (
            !grid ||
            !addButton
        ) {
            return;
        }


        const standardAccountIds = new Set([
            "main",
            "schoolSavings",
            "holidaySavings"
        ]);

        currentUser.accounts
            .filter(account => !standardAccountIds.has(String(account?.id || "")))
            .forEach(account => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "custom-account-card account-card relative min-h-[131px] overflow-hidden rounded-[9px] bg-[#d3f5e8] px-[22px] py-[22px]";


                card.dataset.accountId =
                    account.id;


                card.innerHTML = `

                    <div class="absolute left-0 top-0 h-full w-[6px] bg-[#5926a6]"></div>

                    <div class="flex items-start justify-between">

                        <div>

                            <p class="text-[12px] font-medium text-[#49317c]">
                                ${escapeHTML(account.name)}
                            </p>

                            <p
                                data-balance="${escapeHTML(account.id)}"
                                class="mt-[4px] text-[20px] font-semibold tracking-[-0.5px]"
                            >
                                ${formatMoney(account.balance)}
                            </p>

                        </div>

                        <button
                            type="button"
                            data-balance-toggle="${escapeHTML(account.id)}"
                            class="accountBalanceToggle mt-1 text-[#4b5653]"
                            aria-label="Hide balance"
                        >
                            <i class="fa-regular fa-eye-slash text-[12px]"></i>
                        </button>

                    </div>

                    <div class="mt-[16px] flex gap-3">

                        <button
                            type="button"
                            data-account-id="${escapeHTML(account.id)}"
                            class="fundAccountButton h-[23px] min-w-[57px] rounded-[4px] bg-[#2ebd8d] px-4 text-[10px] font-semibold text-white transition hover:bg-[#24ab7d]"
                        >
                            Fund
                        </button>

                        <button
                            type="button"
                            data-account-id="${escapeHTML(account.id)}"
                            class="withdrawAccountButton h-[23px] min-w-[82px] rounded-[4px] bg-[#d1d1d1] px-4 text-[10px] font-semibold text-[#333] transition hover:bg-[#c5c5c5]"
                        >
                            Withdraw
                        </button>

                    </div>
                `;


                grid.insertBefore(
                    card,
                    addButton
                );
            }
        );


        renderBalances();
    }


    /* =====================================================
       14. ACCOUNT CREATED MODAL
    ===================================================== */

    let newlyCreatedAccountId = null;


    const createdAccountGoBackButton =
        document.getElementById(
            "createdAccountGoBackButton"
        );


    const createdAccountFundButton =
        document.getElementById(
            "createdAccountFundButton"
        );


    if (createdAccountGoBackButton) {

        createdAccountGoBackButton.addEventListener(
            "click",
            () => {

                newlyCreatedAccountId =
                    null;

                closeModal(
                    "accountCreatedModal"
                );
            }
        );
    }


    if (createdAccountFundButton) {

        createdAccountFundButton.addEventListener(
            "click",
            () => {

                const accountId =
                    newlyCreatedAccountId;


                closeModal(
                    "accountCreatedModal"
                );


                if (accountId) {

                    setTimeout(
                        () => {

                            openFundingModal(
                                accountId
                            );

                        },
                        150
                    );
                }
            }
        );
    }


    /* =====================================================
       15. FUNDING STATE
    ===================================================== */

    let selectedFundingAccountId =
        "main";


    function openFundingModal(
        accountId
    ) {

        selectedFundingAccountId =
            accountId || "main";


        const targetName =
            getAccountName(
                selectedFundingAccountId
            );


        const directPayTarget =
            document.getElementById(
                "directPayTarget"
            );


        const creditCardTarget =
            document.getElementById(
                "creditCardTarget"
            );


        const directPayAccountName =
            document.getElementById(
                "directPayAccountName"
            );


        const creditCardAccountName =
            document.getElementById(
                "creditCardAccountName"
            );


        if (directPayTarget) {

            directPayTarget.textContent =
                `Fund ${targetName} directly.`;
        }


        if (creditCardTarget) {

            creditCardTarget.textContent =
                `Fund ${targetName} with a card.`;
        }


        if (directPayAccountName) {

            directPayAccountName.textContent =
                targetName;
        }


        if (creditCardAccountName) {

            creditCardAccountName.textContent =
                targetName;
        }


        resetFundingForms();


        openModal(
            "fundWalletModal"
        );
    }


    function resetFundingForms() {

        const fundForm =
            document.getElementById(
                "fundWalletForm"
            );


        const directForm =
            document.getElementById(
                "directPayForm"
            );


        const creditForm =
            document.getElementById(
                "creditCardForm"
            );


        fundForm?.reset();
        directForm?.reset();
        creditForm?.reset();


        const directSection =
            document.getElementById(
                "directPaySection"
            );


        const creditSection =
            document.getElementById(
                "creditCardSection"
            );


        directSection?.classList.remove(
            "hidden"
        );


        creditSection?.classList.add(
            "hidden"
        );


        const directOption =
            document.getElementById(
                "directPayOption"
            );


        if (directOption) {

            directOption.checked = true;
        }
    }


    /* =====================================================
       16. FUND BUTTONS
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".fundAccountButton"
                );


            if (!button) {
                return;
            }


            const accountId =
                button.dataset.accountId ||
                button.dataset.fundAccountId ||
                "main";


            openFundingModal(
                accountId
            );
        }
    );


    /* =====================================================
       17. PAYMENT METHOD SWITCH
    ===================================================== */

    const directPayOption =
        document.getElementById(
            "directPayOption"
        );


    const creditCardOption =
        document.getElementById(
            "creditCardOption"
        );


    function updatePaymentMethod() {

        const directSection =
            document.getElementById(
                "directPaySection"
            );


        const creditSection =
            document.getElementById(
                "creditCardSection"
            );


        if (
            directPayOption?.checked
        ) {

            directSection?.classList.remove(
                "hidden"
            );

            creditSection?.classList.add(
                "hidden"
            );

        } else {

            directSection?.classList.add(
                "hidden"
            );

            creditSection?.classList.remove(
                "hidden"
            );
        }
    }


    directPayOption?.addEventListener(
        "change",
        updatePaymentMethod
    );


    creditCardOption?.addEventListener(
        "change",
        updatePaymentMethod
    );


    /* =====================================================
       18. FUND WALLET SUBMIT
    ===================================================== */

    const fundWalletForm =
        document.getElementById(
            "fundWalletForm"
        );


    if (fundWalletForm) {

        fundWalletForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const paymentMethod =
                    directPayOption?.checked
                        ? "directPay"
                        : "creditCard";


                let amount = 0;


                if (
                    paymentMethod ===
                    "directPay"
                ) {

                    const amountInput =
                        fundWalletForm.querySelector(
                            "#directPayAmount"
                        );


                    amount =
                        Number(
                            amountInput?.value
                        ) || 0;

                } else {

                    const amountInput =
                        fundWalletForm.querySelector(
                            "#cardAmount"
                        );


                    amount =
                        Number(
                            amountInput?.value
                        ) || 0;
                }


                if (
                    !amount ||
                    amount <= 0
                ) {

                    showError(
                        "Invalid Amount",
                        "Please enter a valid amount greater than ₦0.00."
                    );

                    return;
                }


                if (
                    paymentMethod ===
                    "creditCard"
                ) {

                    if (
                        !validateFundingCard()
                    ) {
                        return;
                    }
                }


                completeDeposit(
                    selectedFundingAccountId,
                    amount,
                    paymentMethod
                );
            }
        );
    }


    /* =====================================================
       19. CARD VALIDATION
    ===================================================== */

    function validateFundingCard() {

        const cardNumber =
            fundWalletForm?.querySelector(
                "#cardNumber"
            )?.value
                ?.replace(/\s/g, "") ||
            "";


        const cardHolder =
            fundWalletForm?.querySelector(
                "#cardHolderName"
            )?.value
                ?.trim() ||
            "";


        const expiry =
            fundWalletForm?.querySelector(
                "#cardExpiry"
            )?.value
                ?.trim() ||
            "";


        const cvc =
            fundWalletForm?.querySelector(
                "#cardCvc"
            )?.value
                ?.trim() ||
            "";


        if (
            cardNumber.length < 12
        ) {

            showError(
                "Invalid Card Number",
                "Please enter a valid card number."
            );

            return false;
        }


        if (!cardHolder) {

            showError(
                "Cardholder Required",
                "Please enter the cardholder name."
            );

            return false;
        }


        if (
            !/^\d{2}\/\d{2}$/.test(
                expiry
            )
        ) {

            showError(
                "Invalid Expiry Date",
                "Please enter the expiry date in MM/YY format."
            );

            return false;
        }


        if (
            !/^\d{3,4}$/.test(cvc)
        ) {

            showError(
                "Invalid CVC",
                "Please enter a valid card CVC."
            );

            return false;
        }


        return true;
    }


    /* =====================================================
       20. COMPLETE DEPOSIT
    ===================================================== */

    function completeDeposit(
        accountId,
        amount,
        paymentMethod
    ) {

        const targetAccount =
            getAccountName(
                accountId
            );


        const oldBalance =
            getAccountBalance(
                accountId
            );


        const newBalance =
            oldBalance + amount;


        /*
           Update selected account only.

           IMPORTANT:
           We DO NOT add the amount to
           currentUser.balance unless the selected
           account is actually Main Account.
        */

        setAccountBalance(
            accountId,
            newBalance
        );


        /*
           Income remains GLOBAL.

           This is intentionally unchanged.
        */

        currentUser.income =
            (Number(
                currentUser.income
            ) || 0) +
            amount;


        const transactionId =
            generateId(
                "transaction"
            );


        const now =
            new Date().toISOString();


        const transaction = {

            id: transactionId,

            name: "Account Funding",

            title: "Deposit",

            description:
                `Deposit to ${targetAccount}`,

            amount: amount,

            type: "deposit",

            transactionType: "deposit",

            category: "deposit",

            direction: "credit",

            accountId: accountId,

            accountName: targetAccount,

            paymentMethod:
                paymentMethod,

            date: now,

            createdAt: now,

            status: "successful"
        };


        currentUser.transactions.unshift(
            transaction
        );


        const customAccount =
            getAccountObject(
                accountId
            );


        if (customAccount) {

            if (
                !Array.isArray(
                    customAccount.transactions
                )
            ) {

                customAccount.transactions = [];
            }


            customAccount.transactions.unshift(
                {
                    ...transaction
                }
            );
        }


        currentUser.notifications.unshift({

            id:
                generateId(
                    "notification"
                ),

            type: "deposit",

            title:
                "Deposit Successful",

            message:
                `${formatMoney(amount)} was added to ${targetAccount}.`,

            amount: amount,

            transactionId:
                transactionId,

            accountId:
                accountId,

            read: false,

            createdAt: now,

            date: now
        });


        /*
           Keep the aggregate balance synchronized before saving.
        */
        currentUser.currentBalance = calculateCurrentBalance();

        /*
           Save everything BEFORE rendering.
        */

        saveUser();


        /*
           IMPORTANT:
           renderBalances() now recalculates:

           Main
           + School
           + Holiday
           + Custom
        */

        renderBalances();

        renderTransactions();

        renderNotifications();


        closeModal(
            "fundWalletModal"
        );


        showDepositSuccess(
            amount,
            targetAccount
        );
    }


    /* =====================================================
       21. DEPOSIT SUCCESS
    ===================================================== */

    function showDepositSuccess(
        amount,
        accountName
    ) {

        const amountElement =
            document.getElementById(
                "successfulDepositAmount"
            );


        const messageElement =
            document.getElementById(
                "depositSuccessMessage"
            );


        if (amountElement) {

            amountElement.textContent =
                formatMoney(amount);
        }


        if (messageElement) {

            messageElement.textContent =
                `${formatMoney(amount)} has been added to ${accountName}.`;
        }


        openModal(
            "depositSuccessModal"
        );
    }


    const closeDepositSuccessButton =
        document.getElementById(
            "closeDepositSuccessButton"
        );


    closeDepositSuccessButton?.addEventListener(
        "click",
        () => {

            closeModal(
                "depositSuccessModal"
            );
        }
    );


    /* =====================================================
       22. DIRECT PAY BUTTON / MODAL
    ===================================================== */

    const closeDirectPayModal =
        document.getElementById(
            "closeDirectPayModal"
        );


    closeDirectPayModal?.addEventListener(
        "click",
        () => {

            closeModal(
                "directPayModal"
            );
        }
    );


    /* =====================================================
       23. CREDIT CARD BUTTON / MODAL
    ===================================================== */

    const closeCreditCardModal =
        document.getElementById(
            "closeCreditCardModal"
        );


    closeCreditCardModal?.addEventListener(
        "click",
        () => {

            closeModal(
                "creditCardModal"
            );
        }
    );


    /* =====================================================
       24. CANCEL FUNDING
    ===================================================== */

    const cancelFundWalletBtn =
        document.getElementById(
            "cancelFundWalletBtn"
        );


    cancelFundWalletBtn?.addEventListener(
        "click",
        () => {

            closeModal(
                "fundWalletModal"
            );
        }
    );


    /* =====================================================
       25. TRANSACTION TYPE HELPERS
    ===================================================== */

    function getTransactionType(
        transaction
    ) {

        if (!transaction) {
            return "other";
        }


        const explicitType =
            String(
                transaction.transactionType ||
                ""
            ).toLowerCase();


        if (
            explicitType === "deposit" ||
            explicitType === "income"
        ) {
            return "deposit";
        }


        if (
            explicitType === "withdrawal" ||
            explicitType === "expense"
        ) {
            return "withdrawal";
        }


        const type =
            String(
                transaction.type || ""
            ).toLowerCase();


        if (type === "income") {
            return "deposit";
        }


        if (
            type === "withdrawal" ||
            type === "expense"
        ) {
            return "withdrawal";
        }


        const category =
            String(
                transaction.category || ""
            ).toLowerCase();


        if (
            category === "deposit" ||
            category === "income"
        ) {
            return "deposit";
        }


        if (
            category === "withdrawal" ||
            category === "expense"
        ) {
            return "withdrawal";
        }


        const direction =
            String(
                transaction.direction || ""
            ).toLowerCase();


        if (
            direction === "credit"
        ) {
            return "deposit";
        }


        if (
            direction === "debit"
        ) {
            return "withdrawal";
        }


        return "other";
    }


    function getTransactionIcon(
        transaction
    ) {

        const type =
            getTransactionType(
                transaction
            );


        if (type === "deposit") {

            return `
                <span
                    class="flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[#2dbd8d] text-white"
                >
                    <i class="fa-solid fa-plus text-[12px]"></i>
                </span>
            `;
        }


        if (type === "withdrawal") {

            return `
                <span
                    class="flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[#ef5260] text-white"
                >
                    <i class="fa-solid fa-minus text-[12px]"></i>
                </span>
            `;
        }


        return `
            <span
                class="flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[#d1d1d1] text-[#666]"
            >
                <i class="fa-solid fa-arrow-right-arrow-left text-[11px]"></i>
            </span>
        `;
    }


    function getTransactionAmount(
        transaction
    ) {

        const amount =
            Number(
                transaction.amount
            ) || 0;


        const type =
            getTransactionType(
                transaction
            );


        if (type === "deposit") {

            return `
                <p class="text-[13px] font-semibold text-[#2dbd8d]">
                    + ${Number(amount).toLocaleString(
                        "en-NG",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )}
                </p>
            `;
        }


        if (type === "withdrawal") {

            return `
                <p class="text-[13px] font-semibold text-[#ef5260]">
                    - ${Number(amount).toLocaleString(
                        "en-NG",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )}
                </p>
            `;
        }


        return `
            <p class="text-[13px] font-semibold text-[#555]">
                ${Number(amount).toLocaleString(
                    "en-NG",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )}
            </p>
        `;
    }


    /* =====================================================
       26. TRANSACTION STATUS
    ===================================================== */

    function getStatusClass(status) {

        const value =
            String(
                status || "successful"
            ).toLowerCase();


        if (
            value === "successful" ||
            value === "completed"
        ) {

            return {
                bg: "bg-[#2dbd8d]",
                text: "text-white"
            };
        }


        if (
            value === "failed" ||
            value === "canceled" ||
            value === "cancelled"
        ) {

            return {
                bg: "bg-[#ef5260]",
                text: "text-white"
            };
        }


        return {
            bg: "bg-[#d1d1d1]",
            text: "text-[#666]"
        };
    }


    /* =====================================================
       27. RENDER TRANSACTIONS
    ===================================================== */

    function renderTransactions(
        transactions =
            currentUser.transactions
    ) {

        const container =
            document.getElementById(
                "transactionsList"
            );


        if (!container) {
            return;
        }


        container.innerHTML = "";


        if (
            !Array.isArray(transactions) ||
            transactions.length === 0
        ) {

            container.innerHTML = `

                <div class="py-12 text-center">

                    <div class="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#e9f8f3]">

                        <i class="fa-solid fa-receipt text-[19px] text-[#2dbd8d]"></i>

                    </div>

                    <p class="mt-3 text-[13px] font-semibold text-[#555]">
                        No transactions yet
                    </p>

                    <p class="mt-1 text-[11px] text-[#999]">
                        Your deposits and withdrawals will appear here.
                    </p>

                </div>
            `;

            return;
        }


        transactions
            .slice(0, 20)
            .forEach(transaction => {

                const type =
                    getTransactionType(
                        transaction
                    );


                const accountName =
                    transaction.accountName ||
                    getAccountName(
                        transaction.accountId
                    );


                const status =
                    transaction.status ||
                    "successful";


                const statusClass =
                    getStatusClass(
                        status
                    );


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "transaction-row grid min-w-[760px] grid-cols-[70px_1.3fr_1fr_1.2fr_1fr_145px] items-center border-b border-[#dce4e1] py-[9px]";


                row.dataset.transactionId =
                    transaction.id || "";


                row.dataset.searchable =
                    [
                        transaction.name,
                        transaction.title,
                        transaction.description,
                        transaction.accountName,
                        transaction.paymentMethod,
                        formatDateTime(
                            transaction.date ||
                            transaction.createdAt
                        )
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                const displayName =
                    transaction.name ||
                    transaction.title ||
                    "Transaction";


                const method =
                    transaction.paymentMethod ===
                    "creditCard"
                        ? "Credit Card"
                        : transaction.paymentMethod ===
                          "directPay"
                            ? "Direct Pay"
                            : type === "deposit"
                                ? "Deposit"
                                : type === "withdrawal"
                                    ? "Withdrawal"
                                    : "Transaction";


                row.innerHTML = `

                    <div>
                        ${getTransactionIcon(
                            transaction
                        )}
                    </div>

                    <p class="text-[11px] text-[#888] truncate pr-3">
                        ${escapeHTML(
                            displayName
                        )}
                    </p>

                    <p class="text-[11px] text-[#888] truncate pr-3">
                        ${escapeHTML(
                            method
                        )}
                    </p>

                    <p class="text-[11px] text-[#888]">
                        ${escapeHTML(
                            formatDateTime(
                                transaction.date ||
                                transaction.createdAt
                            )
                        )}
                    </p>

                    <div>
                        ${getTransactionAmount(
                            transaction
                        )}
                    </div>

                    <span
                        class="flex h-[29px] items-center justify-center rounded-[6px] ${statusClass.bg} ${statusClass.text} text-[11px] font-semibold"
                    >
                        ${escapeHTML(
                            status
                        )}
                    </span>
                `;


                row.addEventListener(
                    "click",
                    () => {

                        showTransactionDetails(
                            transaction
                        );
                    }
                );


                row.classList.add(
                    "cursor-pointer"
                );


                row.classList.add(
                    "transition"
                );


                row.classList.add(
                    "hover:bg-white/50"
                );


                container.appendChild(
                    row
                );
            });
    }


    /* =====================================================
       28. WITHDRAW STATE
    ===================================================== */

    let selectedWithdrawAccountId =
        "main";


    /* =====================================================
       29. OPEN WITHDRAW
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".withdrawAccountButton"
                );


            if (!button) {
                return;
            }


            selectedWithdrawAccountId =
                button.dataset.accountId ||
                "main";


            openWithdrawModal();
        }
    );


    function openWithdrawModal() {

        const accountName =
            getAccountName(
                selectedWithdrawAccountId
            );


        const accountBalance =
            getAccountBalance(
                selectedWithdrawAccountId
            );


        const form =
            document.getElementById(
                "withdrawForm"
            );


        form?.reset();


        const accountNumberInput =
            document.getElementById(
                "withdrawAccountNumber"
            );


        const accountNameInput =
            document.getElementById(
                "withdrawAccountName"
            );


        if (accountNumberInput) {

            accountNumberInput.value =
                getAccountNumber();
        }


        if (accountNameInput) {

            accountNameInput.value =
                getUserName();
        }


        const amountInput =
            document.getElementById(
                "withdrawAmount"
            );


        if (amountInput) {

            amountInput.placeholder =
                accountBalance > 0
                    ? `Available: ${Number(
                        accountBalance
                    ).toLocaleString(
                        "en-NG",
                        {
                            minimumFractionDigits: 2
                        }
                    )}`
                    : "0.00";
        }


        const title =
            document.querySelector(
                "#withdrawModal h2"
            );


        if (title) {

            title.textContent =
                "Withdraw";
        }


        openModal(
            "withdrawModal"
        );
    }


    /* =====================================================
       30. CANCEL WITHDRAW
    ===================================================== */

    const cancelWithdrawBtn =
        document.getElementById(
            "cancelWithdrawBtn"
        );


    cancelWithdrawBtn?.addEventListener(
        "click",
        () => {

            closeModal(
                "withdrawModal"
            );
        }
    );


    /* =====================================================
       31. WITHDRAW SUBMIT
    ===================================================== */

    const withdrawForm =
        document.getElementById(
            "withdrawForm"
        );


    if (withdrawForm) {

        withdrawForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const amountInput =
                    document.getElementById(
                        "withdrawAmount"
                    );


                const accountNumberInput =
                    document.getElementById(
                        "withdrawAccountNumber"
                    );


                const accountNameInput =
                    document.getElementById(
                        "withdrawAccountName"
                    );


                const bankInput =
                    document.getElementById(
                        "withdrawBank"
                    );


                const amount =
                    Number(
                        amountInput?.value
                    ) || 0;


                const accountNumber =
                    accountNumberInput?.value
                        ?.replace(/\D/g, "") ||
                    "";


                const accountName =
                    accountNameInput?.value
                        ?.trim() ||
                    "";


                const bank =
                    bankInput?.value ||
                    "";


                const availableBalance =
                    getAccountBalance(
                        selectedWithdrawAccountId
                    );


                if (
                    !amount ||
                    amount <= 0
                ) {

                    showError(
                        "Invalid Amount",
                        "Please enter a withdrawal amount greater than ₦0.00."
                    );

                    return;
                }


                if (
                    amount >
                    availableBalance
                ) {

                    showError(
                        "Insufficient Balance",
                        `You cannot withdraw ${formatMoney(
                            amount
                        )}. Your available balance is ${formatMoney(
                            availableBalance
                        )}.`
                    );

                    return;
                }


                if (
                    accountNumber.length !== 10
                ) {

                    showError(
                        "Invalid Account Number",
                        "Please enter a valid 10-digit bank account number."
                    );

                    return;
                }


                if (!accountName) {

                    showError(
                        "Account Name Required",
                        "Please enter the bank account name."
                    );

                    return;
                }


                if (!bank) {

                    showError(
                        "Select Bank",
                        "Please select the receiving bank."
                    );

                    return;
                }


                completeWithdrawal({

                    accountId:
                        selectedWithdrawAccountId,

                    amount,

                    accountNumber,

                    accountName,

                    bank
                });
            }
        );
    }


    /* =====================================================
       32. COMPLETE WITHDRAWAL
    ===================================================== */

    function completeWithdrawal(data) {

        const {
            accountId,
            amount,
            accountNumber,
            accountName,
            bank
        } = data;


        const accountNameInternal =
            getAccountName(
                accountId
            );


        const oldBalance =
            getAccountBalance(
                accountId
            );


        if (
            amount >
            oldBalance
        ) {

            showError(
                "Insufficient Balance",
                "The withdrawal amount is greater than the selected account balance."
            );

            return;
        }


        /*
           Subtract only from the selected account.
        */

        setAccountBalance(
            accountId,
            oldBalance - amount
        );


        /*
           Expense remains GLOBAL.

           This is intentionally unchanged.
        */

        currentUser.expense =
            (Number(
                currentUser.expense
            ) || 0) +
            amount;


        const transactionId =
            generateId(
                "transaction"
            );


        const now =
            new Date().toISOString();


        const transaction = {

            id: transactionId,

            name: "Bank Withdrawal",

            title: "Withdrawal",

            description:
                `Withdrawal from ${accountNameInternal}`,

            amount: amount,

            type: "withdrawal",

            transactionType: "withdrawal",

            category: "withdrawal",

            direction: "debit",

            accountId: accountId,

            accountName:
                accountNameInternal,

            bank: bank,

            bankAccountNumber:
                accountNumber,

            recipientName:
                accountName,

            date: now,

            createdAt: now,

            status: "successful"
        };


        currentUser.transactions.unshift(
            transaction
        );


        const customAccount =
            getAccountObject(
                accountId
            );


        if (customAccount) {

            if (
                !Array.isArray(
                    customAccount.transactions
                )
            ) {

                customAccount.transactions = [];
            }


            customAccount.transactions.unshift(
                {
                    ...transaction
                }
            );
        }


        currentUser.notifications.unshift({

            id:
                generateId(
                    "notification"
                ),

            type:
                "withdrawal",

            title:
                "Withdrawal Successful",

            message:
                `${formatMoney(amount)} was withdrawn from ${accountNameInternal}.`,

            amount: amount,

            transactionId:
                transactionId,

            accountId:
                accountId,

            read: false,

            createdAt: now,

            date: now
        });


        saveUser();


        /*
           Current Balance is automatically
           recalculated here.
        */

        renderBalances();

        renderTransactions();

        renderNotifications();


        closeModal(
            "withdrawModal"
        );


        showWithdrawalSuccess(
            amount,
            accountNameInternal
        );
    }


    /* =====================================================
       33. WITHDRAW SUCCESS
    ===================================================== */

    function showWithdrawalSuccess(
        amount,
        accountName
    ) {

        const amountElement =
            document.getElementById(
                "successfulWithdrawAmount"
            );


        const messageElement =
            document.getElementById(
                "withdrawSuccessMessage"
            );


        if (amountElement) {

            amountElement.textContent =
                `- ${formatMoney(amount)}`;
        }


        if (messageElement) {

            messageElement.textContent =
                `${formatMoney(
                    amount
                )} has been withdrawn from ${accountName}.`;
        }


        openModal(
            "withdrawSuccessModal"
        );
    }


    const closeWithdrawSuccessButton =
        document.getElementById(
            "closeWithdrawSuccessButton"
        );


    closeWithdrawSuccessButton?.addEventListener(
        "click",
        () => {

            closeModal(
                "withdrawSuccessModal"
            );
        }
    );


    /* =====================================================
       34. TRANSACTION DETAILS
    ===================================================== */

    function showTransactionDetails(
        transaction
    ) {

        const type =
            getTransactionType(
                transaction
            );


        const title =
            type === "deposit"
                ? "Deposit"
                : type === "withdrawal"
                    ? "Withdrawal"
                    : "Transaction";


        const modal =
            document.getElementById(
                "transactionModal"
            );


        if (!modal) {
            return;
        }


        const nameElement =
            document.getElementById(
                "transactionModalName"
            );


        const amountElement =
            document.getElementById(
                "transactionModalAmount"
            );


        const dateElement =
            document.getElementById(
                "transactionModalDate"
            );


        const typeElement =
            document.getElementById(
                "transactionModalType"
            );


        if (nameElement) {

            nameElement.textContent =
                transaction.name ||
                transaction.title ||
                title;
        }


        if (amountElement) {

            amountElement.textContent =
                type === "withdrawal"
                    ? `- ${formatMoney(
                        transaction.amount
                    )}`
                    : `+ ${formatMoney(
                        transaction.amount
                    )}`;
        }


        if (dateElement) {

            dateElement.textContent =
                formatDateTime(
                    transaction.date ||
                    transaction.createdAt
                );
        }


        if (typeElement) {

            typeElement.textContent =
                title;
        }


        openModal(
            "transactionModal"
        );
    }


    /* =====================================================
       35. NOTIFICATIONS
    ===================================================== */

    function renderNotifications() {

        const list =
            document.getElementById(
                "notificationList"
            );


        const empty =
            document.getElementById(
                "emptyNotifications"
            );


        const count =
            document.getElementById(
                "notificationCount"
            );


        const subtitle =
            document.getElementById(
                "notificationSubtitle"
            );


        if (!list) {
            return;
        }


        const unread =
            currentUser.notifications.filter(
                notification =>
                    !notification.read
            );


        if (count) {

            if (unread.length > 0) {

                count.classList.remove(
                    "hidden"
                );

            } else {

                count.classList.add(
                    "hidden"
                );
            }
        }


        if (subtitle) {

            subtitle.textContent =
                unread.length > 0
                    ? `You have ${unread.length} new notification${unread.length === 1 ? "" : "s"}`
                    : "You have no new notifications";
        }


        list.innerHTML = "";


        if (
            currentUser.notifications.length === 0
        ) {

            empty?.classList.remove(
                "hidden"
            );

            return;
        }


        empty?.classList.add(
            "hidden"
        );


        currentUser.notifications
            .slice(0, 20)
            .forEach(
                notification => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "border-b border-gray-100 px-5 py-4";


                    const isDeposit =
                        notification.type ===
                        "deposit";


                    item.innerHTML = `

                        <div class="flex gap-3">

                            <div
                                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                    isDeposit
                                        ? "bg-[#e2f8ef] text-[#2dbd8d]"
                                        : "bg-[#fff0f1] text-[#ef5260]"
                                }"
                            >

                                <i
                                    class="fa-solid ${
                                        isDeposit
                                            ? "fa-plus"
                                            : "fa-minus"
                                    } text-[12px]"
                                ></i>

                            </div>


                            <div class="min-w-0 flex-1">

                                <div class="flex items-start justify-between gap-3">

                                    <p class="text-[12px] font-semibold text-[#333]">
                                        ${escapeHTML(
                                            notification.title ||
                                            "Notification"
                                        )}
                                    </p>

                                    ${
                                        !notification.read
                                            ? `
                                                <span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#ef5260]"></span>
                                            `
                                            : ""
                                    }

                                </div>


                                <p class="mt-1 text-[11px] leading-4 text-[#888]">
                                    ${escapeHTML(
                                        notification.message ||
                                        ""
                                    )}
                                </p>


                                <p class="mt-2 text-[10px] text-[#aaa]">
                                    ${escapeHTML(
                                        formatDateTime(
                                            notification.createdAt ||
                                            notification.date
                                        )
                                    )}
                                </p>

                            </div>

                        </div>
                    `;


                    item.addEventListener(
                        "click",
                        () => {

                            notification.read =
                                true;

                            saveUser();

                            renderNotifications();
                        }
                    );


                    list.appendChild(
                        item
                    );
                }
            );
    }


    /* =====================================================
       36. NOTIFICATION BUTTON
    ===================================================== */

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );


    const notificationDropdown =
        document.getElementById(
            "notificationDropdown"
        );


    notificationButton?.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            if (
                notificationDropdown?.classList.contains(
                    "hidden"
                )
            ) {

                notificationDropdown.classList.remove(
                    "hidden"
                );

            } else {

                notificationDropdown?.classList.add(
                    "hidden"
                );
            }
        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !event.target.closest(
                    "#notificationWrapper"
                )
            ) {

                notificationDropdown?.classList.add(
                    "hidden"
                );
            }
        }
    );


    /* =====================================================
       37. MARK ALL NOTIFICATIONS READ
    ===================================================== */

    const markAllNotificationsButton =
        document.getElementById(
            "markAllNotificationsButton"
        );


    markAllNotificationsButton?.addEventListener(
        "click",
        () => {

            currentUser.notifications
                .forEach(
                    notification => {

                        notification.read =
                            true;
                    }
                );


            saveUser();

            renderNotifications();
        }
    );


    /* =====================================================
       38. SEARCH
    ===================================================== */

    const globalSearchInput =
        document.getElementById(
            "globalSearchInput"
        );


    const globalSearchResults =
        document.getElementById(
            "globalSearchResults"
        );


    const searchResultsList =
        document.getElementById(
            "searchResultsList"
        );


    function performSearch(
        query
    ) {

        if (
            !query ||
            query.trim().length === 0
        ) {

            globalSearchResults?.classList.add(
                "hidden"
            );

            return;
        }


        const search =
            query
                .trim()
                .toLowerCase();


        const accountResults = [];


        [
            {
                id: "main",
                name: "Main Account"
            },
            {
                id: "schoolSavings",
                name: "School Savings"
            },
            {
                id: "holidaySavings",
                name: "Holiday Plan"
            }
        ]
            .forEach(account => {

                if (
                    account.name
                        .toLowerCase()
                        .includes(search)
                ) {

                    accountResults.push(
                        {
                            ...account,
                            balance:
                                getAccountBalance(
                                    account.id
                                )
                        }
                    );
                }
            });


        currentUser.accounts
            .forEach(account => {

                if (
                    account.name
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        account.description ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search)
                ) {

                    accountResults.push(
                        {
                            id: account.id,
                            name: account.name,
                            balance:
                                Number(
                                    account.balance
                                ) || 0
                        }
                    );
                }
            });


        const transactionResults =
            currentUser.transactions
                .filter(transaction => {

                    const text =
                        [
                            transaction.name,
                            transaction.title,
                            transaction.description,
                            transaction.accountName,
                            transaction.paymentMethod,
                            transaction.type,
                            transaction.transactionType
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                    return text.includes(
                        search
                    );
                })
                .slice(0, 8);


        if (
            accountResults.length === 0 &&
            transactionResults.length === 0
        ) {

            searchResultsList.innerHTML = `

                <div class="px-5 py-8 text-center">

                    <i class="fa-solid fa-magnifying-glass text-[20px] text-[#bbb]"></i>

                    <p class="mt-2 text-[12px] text-[#888]">
                        No results found
                    </p>

                </div>
            `;

        } else {

            searchResultsList.innerHTML = "";


            if (
                accountResults.length > 0
            ) {

                const heading =
                    document.createElement(
                        "p"
                    );


                heading.className =
                    "px-5 pb-2 pt-4 text-[10px] font-bold uppercase tracking-wide text-[#aaa]";


                heading.textContent =
                    "Accounts";


                searchResultsList.appendChild(
                    heading
                );


                accountResults.forEach(
                    account => {

                        const item =
                            document.createElement(
                                "button"
                            );


                        item.type =
                            "button";


                        item.className =
                            "flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-[#f5faf8]";


                        item.innerHTML = `

                            <div>

                                <p class="text-[12px] font-semibold text-[#444]">
                                    ${escapeHTML(
                                        account.name
                                    )}
                                </p>

                                <p class="mt-1 text-[10px] text-[#999]">
                                    Account
                                </p>

                            </div>

                            <span class="text-[11px] font-semibold text-[#2dbd8d]">
                                ${formatMoney(
                                    account.balance
                                )}
                            </span>
                        `;


                        item.addEventListener(
                            "click",
                            () => {

                                globalSearchInput.value =
                                    account.name;

                                globalSearchResults?.classList.add(
                                    "hidden"
                                );
                            }
                        );


                        searchResultsList.appendChild(
                            item
                        );
                    }
                );
            }


            if (
                transactionResults.length > 0
            ) {

                const heading =
                    document.createElement(
                        "p"
                    );


                heading.className =
                    "px-5 pb-2 pt-4 text-[10px] font-bold uppercase tracking-wide text-[#aaa]";


                heading.textContent =
                    "Transactions";


                searchResultsList.appendChild(
                    heading
                );


                transactionResults.forEach(
                    transaction => {

                        const type =
                            getTransactionType(
                                transaction
                            );


                        const item =
                            document.createElement(
                                "button"
                            );


                        item.type =
                            "button";


                        item.className =
                            "flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-[#f5faf8]";


                        item.innerHTML = `

                            <div>
                                ${getTransactionIcon(
                                    transaction
                                )}
                            </div>

                            <div class="min-w-0 flex-1">

                                <p class="truncate text-[11px] font-semibold text-[#444]">
                                    ${escapeHTML(
                                        transaction.name ||
                                        transaction.title ||
                                        "Transaction"
                                    )}
                                </p>

                                <p class="mt-1 text-[10px] text-[#999]">
                                    ${escapeHTML(
                                        type === "deposit"
                                            ? "Deposit"
                                            : type === "withdrawal"
                                                ? "Withdrawal"
                                                : "Transaction"
                                    )}
                                </p>

                            </div>

                            <div>
                                ${getTransactionAmount(
                                    transaction
                                )}
                            </div>
                        `;


                        item.addEventListener(
                            "click",
                            () => {

                                globalSearchResults?.classList.add(
                                    "hidden"
                                );

                                showTransactionDetails(
                                    transaction
                                );
                            }
                        );


                        searchResultsList.appendChild(
                            item
                        );
                    }
                );
            }
        }


        globalSearchResults?.classList.remove(
            "hidden"
        );
    }


    globalSearchInput?.addEventListener(
        "input",
        event => {

            performSearch(
                event.target.value
            );
        }
    );


    globalSearchInput?.addEventListener(
        "focus",
        event => {

            if (
                event.target.value.trim()
            ) {

                performSearch(
                    event.target.value
                );
            }
        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !event.target.closest(
                    "#headerSearchWrapper"
                )
            ) {

                globalSearchResults?.classList.add(
                    "hidden"
                );
            }
        }
    );


    /* =====================================================
       39. VIEW ALL TRANSACTIONS
    ===================================================== */

    const viewAllTransactionsButton =
        document.getElementById(
            "viewAllTransactionsButton"
        );


    viewAllTransactionsButton?.addEventListener(
        "click",
        () => {

            window.location.href =
                "./transaction.html";
        }
    );


    /* =====================================================
       40. PROFILE BUTTON
    ===================================================== */

    const profileButton =
        document.getElementById(
            "profileButton"
        );


    profileButton?.addEventListener(
        "click",
        () => {

            window.location.href =
                "./profile.html";
        }
    );


    /* =====================================================
       41. SIDEBAR NAVIGATION
    ===================================================== */

    const overviewLink =
        document.getElementById(
            "overviewNavLink"
        );


    const accountsLink =
        document.getElementById(
            "accountsNavLink"
        );


    const transactionsLink =
        document.getElementById(
            "transactionsNavLink"
        );


    const profileLink =
        document.getElementById(
            "profileNavLink"
        );


    const mobileOverviewLink =
        document.getElementById(
            "mobileOverviewLink"
        );


    const mobileAccountsLink =
        document.getElementById(
            "mobileAccountsLink"
        );


    const mobileTransactionsLink =
        document.getElementById(
            "mobileTransactionsLink"
        );


    const mobileProfileLink =
        document.getElementById(
            "mobileProfileLink"
        );


    /* =====================================================
       42. MOBILE SIDEBAR
    ===================================================== */

    const mobileMenuButton =
        document.getElementById(
            "mobileMenuButton"
        );


    const mobileSidebar =
        document.getElementById(
            "mobileSidebar"
        );


    const mobileSidebarOverlay =
        document.getElementById(
            "mobileSidebarOverlay"
        );


    function openMobileSidebar() {

        mobileSidebar?.classList.remove(
            "-translate-x-full"
        );


        mobileSidebarOverlay?.classList.remove(
            "hidden"
        );
    }


    function closeMobileSidebar() {

        mobileSidebar?.classList.add(
            "-translate-x-full"
        );


        mobileSidebarOverlay?.classList.add(
            "hidden"
        );
    }


    mobileMenuButton?.addEventListener(
        "click",
        openMobileSidebar
    );


    mobileSidebarOverlay?.addEventListener(
        "click",
        closeMobileSidebar
    );


    document
        .querySelectorAll(
            "#mobileSidebar a"
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                closeMobileSidebar
            );
        });


    /* =====================================================
       43. MOBILE LOGOUT
    ===================================================== */

    const mobileLogoutButton =
        document.getElementById(
            "mobileLogoutButton"
        );


    mobileLogoutButton?.addEventListener(
        "click",
        () => {

            closeMobileSidebar();

            openModal(
                "logoutModal"
            );
        }
    );


    /* =====================================================
       44. LOGOUT
    ===================================================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    const cancelLogoutButton =
        document.getElementById(
            "cancelLogoutButton"
        );


    const confirmLogoutButton =
        document.getElementById(
            "confirmLogoutButton"
        );


    logoutButton?.addEventListener(
        "click",
        () => {

            openModal(
                "logoutModal"
            );
        }
    );


    cancelLogoutButton?.addEventListener(
        "click",
        () => {

            closeModal(
                "logoutModal"
            );
        }
    );


    confirmLogoutButton?.addEventListener(
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


    /* =====================================================
       45. ERROR MODAL
    ===================================================== */

    function showError(
        title,
        message
    ) {

        const titleElement =
            document.getElementById(
                "errorModalTitle"
            );


        const messageElement =
            document.getElementById(
                "errorModalMessage"
            );


        if (titleElement) {

            titleElement.textContent =
                title;
        }


        if (messageElement) {

            messageElement.textContent =
                message;
        }


        openModal(
            "errorModal"
        );
    }


    const closeErrorModal =
        document.getElementById(
            "closeErrorModal"
        );


    closeErrorModal?.addEventListener(
        "click",
        () => {

            closeModal(
                "errorModal"
            );
        }
    );


    /* =====================================================
       46. ESCAPE KEY
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
                    ".fixed.inset-0.flex"
                )
                .forEach(modal => {

                    if (
                        modal.id
                    ) {

                        closeModal(
                            modal.id
                        );
                    }
                });


            globalSearchResults?.classList.add(
                "hidden"
            );


            notificationDropdown?.classList.add(
                "hidden"
            );


            closeMobileSidebar();
        }
    );


    /* =====================================================
       47. FORMAT CARD NUMBER
    ===================================================== */

    const fundingCardNumber =
        fundWalletForm?.querySelector(
            "#cardNumber"
        );


    fundingCardNumber?.addEventListener(
        "input",
        event => {

            let value =
                event.target.value
                    .replace(/\D/g, "")
                    .substring(0, 16);


            value =
                value.match(/.{1,4}/g)
                    ?.join(" ") ||
                "";


            event.target.value =
                value;
        }
    );


    /* =====================================================
       48. FORMAT FUNDING EXPIRY
    ===================================================== */

    const fundingCardExpiry =
        fundWalletForm?.querySelector(
            "#cardExpiry"
        );


    fundingCardExpiry?.addEventListener(
        "input",
        event => {

            let value =
                event.target.value
                    .replace(/\D/g, "")
                    .substring(0, 4);


            if (
                value.length > 2
            ) {

                value =
                    value.substring(0, 2) +
                    "/" +
                    value.substring(2);
            }


            event.target.value =
                value;
        }
    );


    /* =====================================================
       49. FORMAT CVC
    ===================================================== */

    const fundingCvc =
        fundWalletForm?.querySelector(
            "#cardCvc"
        );


    fundingCvc?.addEventListener(
        "input",
        event => {

            event.target.value =
                event.target.value
                    .replace(/\D/g, "")
                    .substring(0, 4);
        }
    );


    /* =====================================================
       50. WITHDRAW ACCOUNT NUMBER
    ===================================================== */

    const withdrawAccountNumber =
        document.getElementById(
            "withdrawAccountNumber"
        );


    withdrawAccountNumber?.addEventListener(
        "input",
        event => {

            event.target.value =
                event.target.value
                    .replace(/\D/g, "")
                    .substring(0, 10);
        }
    );


    /* =====================================================
       51. INITIAL RENDER
    ===================================================== */

    normalizeCurrentUser();

    renderHeader();

    renderCustomAccounts();

    renderBalances();

    renderTransactions();

    renderNotifications();

    saveUser();


    /* =====================================================
       52. CROSS-PAGE STORAGE SYNCHRONIZATION
    ===================================================== */

    window.addEventListener(
        "storage",
        event => {

            if (
                event.key !==
                "reenUsers"
            ) {
                return;
            }


            try {

                const updatedUsers =
                    JSON.parse(
                        event.newValue || "[]"
                    );


                const updatedUser =
                    updatedUsers.find(
                        user => {

                            if (
                                currentUser.id &&
                                user.id
                            ) {

                                return String(
                                    user.id
                                ) ===
                                String(
                                    currentUser.id
                                );
                            }


                            return (
                                user.email &&
                                currentUser.email &&
                                user.email.toLowerCase() ===
                                currentUser.email.toLowerCase()
                            );
                        }
                    );


                if (!updatedUser) {
                    return;
                }


                currentUser =
                    updatedUser;


                normalizeCurrentUser();


                renderHeader();

                renderCustomAccounts();

                renderBalances();

                renderTransactions();

                renderNotifications();

            } catch (error) {

                console.error(
                    "Reen Bank storage synchronization error:",
                    error
                );
            }
        }
    );

});