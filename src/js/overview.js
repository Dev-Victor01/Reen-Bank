/* =========================================================
   REEN BANK — OVERVIEW.JS
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const USERS_KEY = "reenUsers";
    const CURRENT_USER_KEY = "currentUser";
    const NOTIFICATIONS_KEY = "reenNotifications";

    let users = readJSON(localStorage.getItem(USERS_KEY), []);
    let currentUser =
        readJSON(sessionStorage.getItem(CURRENT_USER_KEY), null) ||
        readJSON(localStorage.getItem(CURRENT_USER_KEY), null);

    currentUser = resolveUser(currentUser);

    if (!currentUser) {
        console.warn("Reen Bank: currentUser not found.");
        currentUser = {
            id: "demo-user",
            name: "User",
            email: "user@example.com",
            accountNumber: "0000000000",
            accounts: [],
            transactions: []
        };
    }

    let selectedFundingAccountId = null;
    let newlyCreatedAccountId = null;
    let balanceHidden = false;

    /* =====================================================
       STORAGE / HELPERS
    ===================================================== */

    function readJSON(value, fallback) {
        try {
            return value ? JSON.parse(value) : fallback;
        } catch {
            return fallback;
        }
    }

    function resolveUser(user) {
        if (!user) return null;

        const found = users.find((item) =>
            (user.id && item.id === user.id) ||
            (user.email && String(item.email || "").toLowerCase() === String(user.email).toLowerCase()) ||
            (user.accountNumber && item.accountNumber === user.accountNumber)
        );

        return found || user;
    }

    function saveUser() {
        const index = users.findIndex((item) =>
            (currentUser.id && item.id === currentUser.id) ||
            (currentUser.email && String(item.email || "").toLowerCase() === String(currentUser.email).toLowerCase())
        );

        if (index >= 0) {
            users[index] = currentUser;
        } else {
            users.push(currentUser);
        }

        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }

    function uid(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    function money(value) {
        return new Intl.NumberFormat("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number(value) || 0);
    }

    function naira(value) {
        return `₦ ${money(value)}`;
    }

    function dateText(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";

        return date.toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function esc(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function openModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;

        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }

    function closeModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;

        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }

    function accounts() {
        if (!Array.isArray(currentUser.accounts)) currentUser.accounts = [];
        return currentUser.accounts;
    }

    function transactions() {
        if (!Array.isArray(currentUser.transactions)) currentUser.transactions = [];
        return currentUser.transactions;
    }

    function totalBalance() {
        return accounts().reduce(
            (sum, account) => sum + (Number(account.balance) || 0),
            0
        );
    }

    function incomeTotal() {
        return transactions()
            .filter((t) => String(t.type).toLowerCase() === "deposit")
            .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
    }

    function expenseTotal() {
        return transactions()
            .filter((t) =>
                ["withdrawal", "expense"].includes(String(t.type).toLowerCase())
            )
            .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
    }

    function ensureMainAccount() {
        let main = accounts().find((a) => String(a.type).toLowerCase() === "main");

        if (!main) {
            main = {
                id: "main",
                type: "main",
                name: "Main Account",
                description: "Primary Reen Bank account",
                balance: Number(currentUser.currentBalance || currentUser.balance || 0) || 0,
                createdAt: new Date().toISOString()
            };

            currentUser.accounts.unshift(main);
        }

        currentUser.currentBalance = totalBalance();
        saveUser();
    }

    /* =====================================================
       HEADER
    ===================================================== */

    function renderHeader() {
        const name = currentUser.name || currentUser.fullName || "User";
        const number =
            currentUser.accountNumber ||
            currentUser.accountNo ||
            currentUser.account_number ||
            "0000000000";

        const nameEl = document.getElementById("headerUserName");
        const numberEl = document.getElementById("headerAccountNumber");
        const initialsEl = document.getElementById("headerProfileInitials");
        const imageEl = document.getElementById("headerProfileImage");

        if (nameEl) nameEl.textContent = name;
        if (numberEl) numberEl.textContent = number;

        if (initialsEl) {
            initialsEl.textContent = name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word[0].toUpperCase())
                .join("") || "U";
        }

        const image = currentUser.profileImage || currentUser.profilePicture || currentUser.avatar;
        if (imageEl && image) {
            imageEl.src = image;
            imageEl.classList.remove("hidden");
            initialsEl?.classList.add("hidden");
        }
    }

    /* =====================================================
       BALANCE + ACCOUNTS
    ===================================================== */

    function renderBalance() {
        const balance = totalBalance();
        const income = incomeTotal();
        const expense = expenseTotal();

        setMoney("currentBalance", balance);
        setMoney("totalIncome", income);
        setMoney("totalExpense", expense);

        const incomeEl = document.getElementById("statisticsIncome");
        const expenseEl = document.getElementById("statisticsExpense");

        if (incomeEl) incomeEl.textContent = balanceHidden ? "₦ ••••••" : naira(income);
        if (expenseEl) expenseEl.textContent = balanceHidden ? "₦ ••••••" : naira(expense);

        const total = income + expense;
        const incomeWidth = total ? (income / total) * 100 : 0;
        const expenseWidth = total ? (expense / total) * 100 : 0;

        const incomeProgress = document.getElementById("incomeProgress");
        const expenseProgress = document.getElementById("expenseProgress");

        if (incomeProgress) incomeProgress.style.width = `${incomeWidth}%`;
        if (expenseProgress) expenseProgress.style.width = `${expenseWidth}%`;

        const icon = document.getElementById("balanceVisibilityIcon");
        const button = document.getElementById("balanceVisibilityButton");

        if (icon) {
            icon.className = balanceHidden
                ? "fa-regular fa-eye text-[13px]"
                : "fa-regular fa-eye-slash text-[13px]";
        }

        if (button) button.title = balanceHidden ? "Show balance" : "Hide balance";

        ["main", "school", "holiday"].forEach((type) => {
            const account = accounts().find(
                (a) => String(a.type).toLowerCase() === type
            );

            const id = {
                main: "mainAccountBalance",
                school: "schoolAccountBalance",
                holiday: "holidayAccountBalance"
            }[type];

            const element = document.getElementById(id);
            if (element) {
                element.textContent = balanceHidden
                    ? "₦ ••••••"
                    : naira(account?.balance || 0);
            }
        });

        currentUser.currentBalance = balance;
        saveUser();
    }

    function setMoney(id, value) {
        const element = document.getElementById(id);
        if (!element) return;

        element.textContent = balanceHidden ? "₦ ••••••" : naira(value);
        element.dataset.balanceValue = String(value);
    }

    function renderCustomAccounts() {
        const container = document.getElementById("accountsContainer");
        if (!container) return;

        let wrapper = document.getElementById("customAccountsWrapper");

        if (!wrapper) {
            wrapper = document.createElement("div");
            wrapper.id = "customAccountsWrapper";
            wrapper.className = "contents";
            container.appendChild(wrapper);
        }

        const custom = accounts().filter((account) => {
            const type = String(account.type || "").toLowerCase();
            return !["main", "school", "holiday"].includes(type);
        });

        wrapper.innerHTML = custom.map((account) => `
            <button
                type="button"
                class="account-card group rounded-[10px] bg-[#d2f2e7] p-7 text-left transition hover:-translate-y-1 hover:shadow-md"
                data-account-id="${esc(account.id)}"
            >
                <p class="text-[15px] font-medium text-[#58468c]">${esc(account.name)}</p>
                <p class="mt-1 text-[19px] font-semibold text-[#292929]">
                    ${balanceHidden ? "₦ ••••••" : naira(account.balance)}
                </p>
                <p class="mt-2 truncate text-[10px] text-[#777]">${esc(account.description || "")}</p>
            </button>
        `).join("");
    }

    /* =====================================================
       ACCOUNT CREATION
    ===================================================== */

    document.getElementById("addAccountButton")?.addEventListener("click", () => {
        document.getElementById("addAccountForm")?.reset();
        openModal("addAccountModal");
    });

    document.getElementById("addAccountForm")?.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("accountName")?.value.trim();
        const description = document.getElementById("accountDescription")?.value.trim();

        if (!name || !description) return;

        const exists = accounts().some(
            (account) => String(account.name).toLowerCase() === name.toLowerCase()
        );

        if (exists) {
            alertlessError("accountName", "An account with this name already exists.");
            return;
        }

        const account = {
            id: uid("account"),
            type: "custom",
            name,
            description,
            balance: 0,
            createdAt: new Date().toISOString()
        };

        accounts().push(account);
        newlyCreatedAccountId = account.id;

        saveUser();
        renderCustomAccounts();
        renderBalance();

        document.getElementById("createdAccountName").textContent = account.name;
        document.getElementById("createdAccountDescription").textContent = account.description;

        closeModal("addAccountModal");
        addNotification(
            "Account created",
            `${account.name} was created successfully.`,
            "success"
        );

        openModal("accountCreatedModal");
    });

    document.getElementById("fundCreatedAccountButton")?.addEventListener("click", () => {
        if (!newlyCreatedAccountId) return;

        closeModal("accountCreatedModal");
        openFundingModal(newlyCreatedAccountId);
    });

    function alertlessError(inputId, message) {
        const input = document.getElementById(inputId);
        if (!input) return;

        let error = document.getElementById(`${inputId}Error`);

        if (!error) {
            error = document.createElement("p");
            error.id = `${inputId}Error`;
            error.className = "mt-2 text-xs text-[#ef5260]";
            input.parentElement.appendChild(error);
        }

        error.textContent = message;

        setTimeout(() => error.remove(), 3000);
    }

    /* =====================================================
       FUNDING
    ===================================================== */

    function openFundingModal(accountId) {
        const account = accounts().find((a) => a.id === accountId);
        if (!account) return;

        selectedFundingAccountId = accountId;

        document.getElementById("fundingAccountName").textContent =
            `Fund "${account.name}"`;

        closeModal("directPayModal");
        closeModal("creditCardModal");
        openModal("fundWalletModal");
    }

    document.getElementById("openDirectPayButton")?.addEventListener("click", () => {
        const account = accounts().find((a) => a.id === selectedFundingAccountId);
        if (!account) return;

        document.getElementById("directPayAccountLabel").textContent =
            `Funding: ${account.name}`;

        document.getElementById("directPayForm")?.reset();
        closeModal("fundWalletModal");
        openModal("directPayModal");
    });

    document.getElementById("openCreditCardButton")?.addEventListener("click", () => {
        const account = accounts().find((a) => a.id === selectedFundingAccountId);
        if (!account) return;

        document.getElementById("creditCardAccountLabel").textContent =
            `Funding: ${account.name}`;

        document.getElementById("creditCardForm")?.reset();
        closeModal("fundWalletModal");
        openModal("creditCardModal");
    });

    document.getElementById("directPayForm")?.addEventListener("submit", (event) => {
        event.preventDefault();

        const amount = Number(document.getElementById("directPayAmount").value);
        if (!amount || amount <= 0) {
            const error = document.getElementById("directPayError");
            error.textContent = "Enter a valid amount greater than ₦0.00.";
            error.classList.remove("hidden");
            return;
        }

        completeDeposit(amount, "Direct Pay");
    });

    document.getElementById("creditCardForm")?.addEventListener("submit", (event) => {
        event.preventDefault();

        const amount = Number(document.getElementById("cardAmount").value);
        const card = document.getElementById("cardNumber").value.replace(/\s/g, "");
        const holder = document.getElementById("cardHolderName").value.trim();
        const expiry = document.getElementById("cardExpiry").value.trim();
        const cvc = document.getElementById("cardCvc").value.trim();

        let errorMessage = "";

        if (!amount || amount <= 0) errorMessage = "Enter a valid amount.";
        else if (!/^\d{16}$/.test(card)) errorMessage = "Enter a valid 16-digit card number.";
        else if (!holder) errorMessage = "Enter the card holder name.";
        else if (!/^\d{2}\/\d{2}$/.test(expiry)) errorMessage = "Enter expiry as MM/YY.";
        else if (!/^\d{3}$/.test(cvc)) errorMessage = "Enter a valid 3-digit CVC.";

        if (errorMessage) {
            const error = document.getElementById("creditCardError");
            error.textContent = errorMessage;
            error.classList.remove("hidden");
            return;
        }

        completeDeposit(amount, "Credit Card");
    });

    function completeDeposit(amount, method) {
        const account = accounts().find((a) => a.id === selectedFundingAccountId);
        if (!account) return;

        account.balance = (Number(account.balance) || 0) + Number(amount);

        transactions().unshift({
            id: uid("txn"),
            accountId: account.id,
            accountName: account.name,
            description: `Deposit to ${account.name}`,
            amount: Number(amount),
            type: "deposit",
            paymentMethod: method,
            date: new Date().toISOString()
        });

        currentUser.currentBalance = totalBalance();
        saveUser();

        closeModal("fundWalletModal");
        closeModal("directPayModal");
        closeModal("creditCardModal");

        document.getElementById("depositSuccessAmount").textContent = naira(amount);
        document.getElementById("depositSuccessAccount").textContent = account.name;

        renderBalance();
        renderCustomAccounts();
        renderTransactions();

        addNotification(
            "Deposit successful",
            `${naira(amount)} was deposited into ${account.name}.`,
            "success"
        );

        openModal("depositSuccessModal");
    }

    /* =====================================================
       TRANSACTIONS
    ===================================================== */

    function renderTransactions(search = "") {
        const container = document.getElementById("transactionsContainer");
        const empty = document.getElementById("transactionsEmptyState");
        if (!container) return;

        container.querySelectorAll(".transaction-row").forEach((row) => row.remove());

        const query = String(search).trim().toLowerCase();

        const list = transactions().filter((transaction) => {
            if (!query) return true;

            return [
                transaction.description,
                transaction.accountName,
                transaction.type,
                transaction.paymentMethod,
                transaction.amount
            ].join(" ").toLowerCase().includes(query);
        });

        if (!list.length) {
            empty?.classList.remove("hidden");
            if (empty) {
                empty.innerHTML = `
                    <i class="fa-regular fa-folder-open mb-3 text-xl"></i>
                    <p>${query ? "No matching transactions found." : "No transactions yet."}</p>
                `;
            }
            return;
        }

        empty?.classList.add("hidden");

        list.slice(0, 8).forEach((transaction) => {
            const deposit = String(transaction.type).toLowerCase() === "deposit";
            const row = document.createElement("button");

            row.type = "button";
            row.className = "transaction-row flex w-full items-center justify-between gap-3 border-b border-[#edf1ef] py-4 text-left hover:bg-[#f8fbfa]";
            row.dataset.transactionId = transaction.id;

            row.innerHTML = `
                <span class="flex min-w-0 items-center gap-3">
                    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${deposit ? "bg-[#e3f8ef] text-[#20b486]" : "bg-[#fff0f1] text-[#ef5260]"}">
                        <i class="fa-solid ${deposit ? "fa-arrow-down" : "fa-arrow-up"} text-xs"></i>
                    </span>
                    <span class="min-w-0">
                        <span class="block truncate text-[12px] font-semibold">${esc(transaction.description || transaction.accountName)}</span>
                        <span class="mt-1 block text-[10px] text-[#999]">${dateText(transaction.date)}</span>
                    </span>
                </span>
                <span class="shrink-0 text-[12px] font-bold ${deposit ? "text-[#20b486]" : "text-[#ef5260]"}">
                    ${deposit ? "+" : "-"}${naira(transaction.amount)}
                </span>
            `;

            row.addEventListener("click", () => openTransaction(transaction));
            container.appendChild(row);
        });
    }

    function openTransaction(transaction) {
        document.getElementById("transactionModalName").textContent =
            transaction.description || transaction.accountName || "Transaction";

        document.getElementById("transactionModalAmount").textContent =
            naira(transaction.amount);

        document.getElementById("transactionModalDate").textContent =
            dateText(transaction.date);

        document.getElementById("transactionModalType").textContent =
            transaction.type || "Transaction";

        openModal("transactionModal");
    }

    /* =====================================================
       SEARCH BUTTON
    ===================================================== */

    document.getElementById("searchButton")?.addEventListener("click", (event) => {
        event.stopPropagation();

        const box = document.getElementById("globalSearchBox");
        const input = document.getElementById("globalSearchInput");
        const button = document.getElementById("searchButton");

        if (!box || !input) return;

        const shouldOpen = box.classList.contains("hidden");
        box.classList.toggle("hidden", !shouldOpen);
        button?.setAttribute("aria-expanded", String(shouldOpen));

        if (shouldOpen) {
            requestAnimationFrame(() => input.focus());
        }
    });


    /* =====================================================
       INLINE SEARCH
    ===================================================== */

    document.getElementById("globalSearchInput")?.addEventListener("input", (event) => {
        searchAll(event.target.value);
    });

    document.getElementById("clearGlobalSearchButton")?.addEventListener("click", () => {
        const input = document.getElementById("globalSearchInput");
        input.value = "";
        searchAll("");
        input.focus();
    });

    function searchAll(value) {
        const query = String(value).trim().toLowerCase();
        const results = document.getElementById("globalSearchResults");
        const clear = document.getElementById("clearGlobalSearchButton");

        clear?.classList.toggle("hidden", !query);
        clear?.classList.toggle("flex", !!query);

        renderTransactions(query);

        if (!query) {
            results?.classList.add("hidden");
            return;
        }

        const accountResults = accounts().filter((account) =>
            [account.name, account.description, account.type, account.id]
                .join(" ").toLowerCase().includes(query)
        );

        const transactionResults = transactions().filter((transaction) =>
            [
                transaction.description,
                transaction.accountName,
                transaction.type,
                transaction.paymentMethod,
                transaction.amount
            ].join(" ").toLowerCase().includes(query)
        );

        let output = "";

        accountResults.slice(0, 5).forEach((account) => {
            output += `
                <button type="button" class="search-result flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-[#f4f8f6]" data-account-result="${esc(account.id)}">
                    <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e3f8ef] text-[#20b486]">
                        <i class="fa-regular fa-credit-card text-xs"></i>
                    </span>
                    <span>
                        <span class="block text-xs font-semibold">${esc(account.name)}</span>
                        <span class="block text-[10px] text-[#999]">Account · ${naira(account.balance)}</span>
                    </span>
                </button>
            `;
        });

        transactionResults.slice(0, 7).forEach((transaction) => {
            output += `
                <button type="button" class="search-result flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-[#f4f8f6]" data-transaction-result="${esc(transaction.id)}">
                    <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf3f1] text-[#66706d]">
                        <i class="fa-solid fa-arrow-right-arrow-left text-xs"></i>
                    </span>
                    <span>
                        <span class="block text-xs font-semibold">${esc(transaction.description || transaction.accountName)}</span>
                        <span class="block text-[10px] text-[#999]">${transaction.type} · ${naira(transaction.amount)}</span>
                    </span>
                </button>
            `;
        });

        if (!output) {
            output = `<div class="px-4 py-8 text-center text-xs text-[#999]">No account or transaction found.</div>`;
        }

        results.innerHTML = output;
        results.classList.remove("hidden");

        results.querySelectorAll("[data-account-result]").forEach((button) => {
            button.addEventListener("click", () => {
                const id = button.dataset.accountResult;
                const card = document.querySelector(`[data-account-id="${CSS.escape(id)}"]`);

                results.classList.add("hidden");

                if (card) {
                    card.scrollIntoView({ behavior: "smooth", block: "center" });
                    card.classList.add("ring-2", "ring-[#20b486]");
                    setTimeout(() => card.classList.remove("ring-2", "ring-[#20b486]"), 1500);
                }
            });
        });

        results.querySelectorAll("[data-transaction-result]").forEach((button) => {
            button.addEventListener("click", () => {
                const transaction = transactions().find(
                    (t) => t.id === button.dataset.transactionResult
                );

                results.classList.add("hidden");

                if (transaction) openTransaction(transaction);
            });
        });
    }

    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    function getNotifications() {
        if (!Array.isArray(currentUser.notifications)) {
            currentUser.notifications = [];
        }

        return currentUser.notifications;
    }

    function saveNotifications(list) {
        currentUser.notifications = Array.isArray(list) ? list : [];
        saveUser();
    }

    function addNotification(title, message, type = "info") {
        const list = getNotifications();

        list.unshift({
            id: uid("notification"),
            title,
            message,
            type,
            read: false,
            createdAt: new Date().toISOString()
        });

        saveNotifications(list);
        renderNotifications();
    }

    function renderNotifications() {
        const list = getNotifications();
        const unread = list.filter((item) => !item.read);

        const count = document.getElementById("notificationCount");
        const summary = document.getElementById("notificationSummary");
        const container = document.getElementById("notificationsContainer");
        const empty = document.getElementById("notificationsEmptyState");

        if (count) {
            count.textContent = unread.length > 99 ? "99+" : unread.length;
            count.classList.toggle("hidden", unread.length === 0);
        }

        if (summary) {
            summary.textContent =
                unread.length
                    ? `${unread.length} unread notification${unread.length > 1 ? "s" : ""}`
                    : "No unread notifications";
        }

        if (!container) return;

        container.innerHTML = "";

        if (!list.length) {
            empty?.classList.remove("hidden");
            return;
        }

        empty?.classList.add("hidden");

        list.slice(0, 30).forEach((item) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "flex w-full gap-3 border-b border-[#edf1ef] px-5 py-4 text-left hover:bg-[#f7faf9]";

            button.innerHTML = `
                <span class="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.type === "success" ? "bg-[#e4f8ef] text-[#20b486]" : "bg-[#edf3f1] text-[#66706d]"}">
                    <i class="fa-solid ${item.type === "success" ? "fa-check" : "fa-bell"} text-[11px]"></i>
                </span>
                <span class="min-w-0 flex-1">
                    <span class="flex items-start justify-between gap-2">
                        <span class="text-[12px] font-semibold">${esc(item.title)}</span>
                        ${!item.read ? '<span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#20b486]"></span>' : ""}
                    </span>
                    <span class="mt-1 block text-[10px] leading-5 text-[#777]">${esc(item.message)}</span>
                    <span class="mt-1 block text-[9px] text-[#aaa]">${dateText(item.createdAt)}</span>
                </span>
            `;

            button.addEventListener("click", () => {
                item.read = true;
                saveNotifications(list);
                renderNotifications();
            });

            container.appendChild(button);
        });
    }

    document.getElementById("notificationButton")?.addEventListener("click", (event) => {
        event.stopPropagation();

        const dropdown = document.getElementById("notificationDropdown");
        const open = dropdown.classList.contains("hidden");

        dropdown.classList.toggle("hidden", !open);
        document.getElementById("notificationButton").setAttribute("aria-expanded", String(open));
    });

    document.getElementById("markAllNotificationsReadButton")?.addEventListener("click", () => {
        const list = getNotifications();

        list.forEach((item) => item.read = true);

        saveNotifications(list);
        renderNotifications();
    });

    /* =====================================================
       BALANCE VISIBILITY
    ===================================================== */

    document.getElementById("balanceVisibilityButton")?.addEventListener("click", () => {
        balanceHidden = !balanceHidden;
        renderBalance();
        renderCustomAccounts();
    });

    /* =====================================================
       ACCOUNT CARD FUNDING
    ===================================================== */

    document.addEventListener("click", (event) => {
        const card = event.target.closest(".account-card");
        if (!card) return;

        let accountId = card.dataset.accountId;

        if (!accountId) {
            const type = card.dataset.accountType;
            const account = accounts().find(
                (a) => String(a.type).toLowerCase() === String(type).toLowerCase()
            );

            accountId = account?.id;
        }

        if (accountId) openFundingModal(accountId);
    });

    /* =====================================================
       OTHER MODALS / UI
    ===================================================== */

    document.querySelectorAll("[data-close-modal]").forEach((button) => {
        button.addEventListener("click", () => closeModal(button.dataset.closeModal));
    });

    document.querySelectorAll(".modal").forEach((modal) => {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) closeModal(modal.id);
        });
    });

    document.getElementById("logoutButton")?.addEventListener("click", () => {
        openModal("logoutModal");
    });

    document.getElementById("confirmLogoutButton")?.addEventListener("click", () => {
        sessionStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(CURRENT_USER_KEY);
        window.location.href = "./index.html";
    });

    document.getElementById("upgradeProButton")?.addEventListener("click", () => {
        openModal("upgradeModal");
    });

    document.getElementById("continueUpgradeButton")?.addEventListener("click", () => {
        closeModal("upgradeModal");
        addNotification(
            "PRO upgrade",
            "The PRO upgrade flow is ready to connect to your payment provider.",
            "info"
        );
    });

    document.getElementById("cardNumber")?.addEventListener("input", (event) => {
        const digits = event.target.value.replace(/\D/g, "").slice(0, 16);
        event.target.value = digits.replace(/(.{4})/g, "$1 ").trim();
    });

    document.getElementById("cardExpiry")?.addEventListener("input", (event) => {
        let value = event.target.value.replace(/\D/g, "").slice(0, 4);
        if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
        event.target.value = value;
    });

    document.addEventListener("click", (event) => {
        const notificationWrapper = document.getElementById("notificationWrapper");
        const dropdown = document.getElementById("notificationDropdown");

        if (notificationWrapper && !notificationWrapper.contains(event.target)) {
            dropdown?.classList.add("hidden");
        }

        const searchWrapper = document.getElementById("headerSearchWrapper");
        if (searchWrapper && !searchWrapper.contains(event.target)) {
            document.getElementById("globalSearchBox")?.classList.add("hidden");
            document.getElementById("globalSearchResults")?.classList.add("hidden");
            document.getElementById("searchButton")?.setAttribute("aria-expanded", "false");
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;

        [
            "fundWalletModal",
            "directPayModal",
            "creditCardModal",
            "depositSuccessModal",
            "accountCreatedModal",
            "transactionModal",
            "upgradeModal",
            "logoutModal",
            "addAccountModal"
        ].forEach(closeModal);

        document.getElementById("notificationDropdown")?.classList.add("hidden");
        document.getElementById("globalSearchBox")?.classList.add("hidden");
        document.getElementById("globalSearchResults")?.classList.add("hidden");
        document.getElementById("searchButton")?.setAttribute("aria-expanded", "false");
    });

    /* =====================================================
       MOBILE SIDEBAR
    ===================================================== */

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const mobileButton = document.getElementById("mobileMenuButton");

    mobileButton?.addEventListener("click", () => {
        sidebar?.classList.remove("-translate-x-full");
        overlay?.classList.remove("hidden");
    });

    overlay?.addEventListener("click", () => {
        sidebar?.classList.add("-translate-x-full");
        overlay?.classList.add("hidden");
    });

    /* =====================================================
       INITIAL RENDER
    ===================================================== */

    ensureMainAccount();
    renderHeader();
    renderBalance();
    renderCustomAccounts();
    renderTransactions();
    renderNotifications();
});
