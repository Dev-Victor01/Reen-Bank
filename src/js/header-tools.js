/* =========================================================
   REEN BANK — HEADER SEARCH + NOTIFICATIONS (STANDALONE)
   This file intentionally does not depend on overview.js or
   transaction.js, so the header keeps working even if another
   page script changes.
========================================================= */
(function () {
    "use strict";

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn, { once: true });
        } else {
            fn();
        }
    }

    ready(function () {
        const page = location.pathname.toLowerCase();
        const isTransactionPage = page.includes("transaction");

        /* =====================================================
           USER / NOTIFICATION STORAGE
        ===================================================== */
        function readJSON(key, fallback) {
            try {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : fallback;
            } catch (_) {
                return fallback;
            }
        }

        function getCurrentUser() {
            let identity = null;
            try {
                identity = JSON.parse(sessionStorage.getItem("currentUser") || "null");
            } catch (_) {}

            const users = readJSON("reenUsers", []);
            if (!Array.isArray(users)) return null;

            if (identity) {
                const found = users.find(user =>
                    (identity.id && String(user.id) === String(identity.id)) ||
                    (identity.accountNumber && String(user.accountNumber) === String(identity.accountNumber)) ||
                    (identity.email && String(user.email || "").toLowerCase() === String(identity.email).toLowerCase())
                );
                if (found) return found;
            }

            return users[0] || null;
        }

        function saveUser(user) {
            if (!user) return;

            const users = readJSON("reenUsers", []);
            if (!Array.isArray(users)) return;

            const index = users.findIndex(item =>
                (user.id && String(item.id) === String(user.id)) ||
                (user.accountNumber && String(item.accountNumber) === String(user.accountNumber)) ||
                (user.email && String(item.email || "").toLowerCase() === String(user.email).toLowerCase())
            );

            if (index >= 0) users[index] = user;
            else users.push(user);

            localStorage.setItem("reenUsers", JSON.stringify(users));

            try {
                const identity = {
                    id: user.id,
                    email: user.email,
                    accountNumber: user.accountNumber
                };
                sessionStorage.setItem("currentUser", JSON.stringify(identity));
            } catch (_) {}
        }

        function getNotifications() {
            const user = getCurrentUser();
            if (!user) return { user: null, list: [] };

            if (!Array.isArray(user.notifications)) {
                user.notifications = [];
            }

            return { user, list: user.notifications };
        }

        function escapeHTML(value) {
            return String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function notificationDate(value) {
            if (!value) return "";
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return String(value);
            return date.toLocaleString("en-NG", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        }

        /* =====================================================
           SEARCH
        ===================================================== */
        const searchButton = document.getElementById("searchButton");
        const searchBox = document.getElementById(
            isTransactionPage ? "transactionSearchBox" : "globalSearchBox"
        );
        const searchInput = document.getElementById(
            isTransactionPage ? "transactionSearch" : "globalSearchInput"
        );
        const searchWrapper = document.getElementById(
            isTransactionPage ? "transactionSearchWrapper" : "headerSearchWrapper"
        );
        const searchResults = document.getElementById("globalSearchResults");
        const clearButton = document.getElementById(
            isTransactionPage ? "clearTransactionFilters" : "clearGlobalSearchButton"
        );

        function closeSearch() {
            searchBox?.classList.add("hidden");
            searchButton?.setAttribute("aria-expanded", "false");
            if (!isTransactionPage) searchResults?.classList.add("hidden");
        }

        function openSearch(event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            if (!searchBox || !searchInput) return;

            const willOpen = searchBox.classList.contains("hidden");
            searchBox.classList.toggle("hidden", !willOpen);
            searchButton?.setAttribute("aria-expanded", String(willOpen));

            if (willOpen) {
                requestAnimationFrame(() => searchInput.focus());
            }
        }

        if (searchButton) {
            searchButton.addEventListener("click", openSearch, true);
        }

        function searchOverview(value) {
            const query = String(value || "").trim().toLowerCase();
            if (!searchResults) return;

            if (clearButton) {
                clearButton.classList.toggle("hidden", !query);
                clearButton.classList.toggle("flex", !!query);
            }

            if (!query) {
                searchResults.innerHTML = "";
                searchResults.classList.add("hidden");
                return;
            }

            const user = getCurrentUser();
            const accounts = Array.isArray(user?.accounts) ? user.accounts : [];
            const transactions = Array.isArray(user?.transactions) ? user.transactions : [];

            const accountMatches = accounts.filter(account =>
                `${account.name || ""} ${account.description || ""} ${account.balance || ""}`
                    .toLowerCase().includes(query)
            ).slice(0, 5);

            const transactionMatches = transactions.filter(transaction =>
                `${transaction.description || ""} ${transaction.accountName || ""} ${transaction.type || ""} ${transaction.paymentMethod || ""} ${transaction.amount || ""}`
                    .toLowerCase().includes(query)
            ).slice(0, 7);

            let html = "";

            accountMatches.forEach(account => {
                html += `
                    <div class="flex items-center gap-3 border-b border-[#edf1ef] p-3">
                        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e3f8ef] text-[#20b486]">
                            <i class="fa-regular fa-credit-card text-xs"></i>
                        </span>
                        <span class="min-w-0">
                            <span class="block truncate text-xs font-semibold">${escapeHTML(account.name || "Account")}</span>
                            <span class="block truncate text-[10px] text-[#8b9591]">Account</span>
                        </span>
                    </div>`;
            });

            transactionMatches.forEach(transaction => {
                html += `
                    <div class="flex items-center gap-3 border-b border-[#edf1ef] p-3">
                        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf3f1] text-[#66706d]">
                            <i class="fa-solid fa-arrow-right-arrow-left text-xs"></i>
                        </span>
                        <span class="min-w-0">
                            <span class="block truncate text-xs font-semibold">${escapeHTML(transaction.description || transaction.accountName || "Transaction")}</span>
                            <span class="block truncate text-[10px] text-[#8b9591]">${escapeHTML(transaction.accountName || transaction.type || "Transaction")}</span>
                        </span>
                    </div>`;
            });

            if (!html) {
                html = `<div class="px-4 py-8 text-center text-xs text-[#8993a4]">No matching accounts or transactions.</div>`;
            }

            searchResults.innerHTML = html;
            searchResults.classList.remove("hidden");
        }

        function searchTransactions(value) {
            const query = String(value || "").trim().toLowerCase();
            const rows = document.querySelectorAll("#transactionList > *");
            let visible = 0;

            rows.forEach(row => {
                if (row.id === "emptyTransactions") return;
                const matches = !query || row.textContent.toLowerCase().includes(query);
                row.classList.toggle("hidden", !matches);
                if (matches) visible++;
            });

            if (clearButton) {
                clearButton.classList.toggle("hidden", !query);
                clearButton.classList.toggle("flex", !!query);
            }

            const empty = document.getElementById("emptyTransactions");
            if (empty && query && visible === 0) empty.classList.remove("hidden");
            else if (empty && !query) empty.classList.add("hidden");
        }

        if (searchInput) {
            searchInput.addEventListener("input", event => {
                event.stopPropagation();
                event.stopImmediatePropagation();
                if (isTransactionPage) searchTransactions(event.target.value);
                else searchOverview(event.target.value);
            }, true);
        }

        if (clearButton) {
            clearButton.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                if (searchInput) searchInput.value = "";
                if (isTransactionPage) searchTransactions("");
                else searchOverview("");
                searchInput?.focus();
            }, true);
        }

        /* =====================================================
           NOTIFICATIONS
        ===================================================== */
        const notificationButton = document.getElementById("notificationButton");
        const notificationDropdown = document.getElementById("notificationDropdown");
        const notificationList = document.getElementById("notificationList") || document.getElementById("notificationsContainer");
        const notificationCount = document.getElementById("notificationCount") || document.getElementById("notificationDot");
        const notificationSummary = document.getElementById("notificationSummary") || document.getElementById("notificationUnreadCount");
        const markAll = document.getElementById("markAllNotificationsReadButton") || document.getElementById("markAllNotificationsRead");

        function renderNotifications() {
            if (!notificationDropdown || !notificationList) return;

            const { list } = getNotifications();
            const unread = list.filter(item => !item.read);

            if (notificationCount) {
                notificationCount.textContent = unread.length > 99 ? "99+" : String(unread.length);
                notificationCount.classList.toggle("hidden", unread.length === 0);
                notificationCount.classList.add("flex");
            }

            if (notificationSummary) {
                notificationSummary.textContent = unread.length
                    ? `${unread.length} unread notification${unread.length === 1 ? "" : "s"}`
                    : "No unread notifications";
            }

            notificationList.innerHTML = "";

            if (!list.length) {
                notificationList.innerHTML = `
                    <div class="px-5 py-10 text-center">
                        <div class="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#edf9f4]">
                            <i class="fa-regular fa-bell text-[#1aaa78]"></i>
                        </div>
                        <p class="mt-3 text-[11px] font-medium text-[#626966]">No notifications</p>
                        <p class="mt-1 text-[9px] text-[#a0a6a3]">You're all caught up.</p>
                    </div>`;
                return;
            }

            list.slice(0, 30).forEach((item, index) => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = `flex w-full gap-3 border-b border-[#edf1ef] px-5 py-4 text-left hover:bg-[#f7faf9] ${item.read ? "bg-white" : "bg-[#f5fbf8]"}`;
                button.innerHTML = `
                    <span class="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e4f8ef] text-[#20b486]">
                        <i class="fa-solid ${item.type === "success" ? "fa-check" : "fa-bell"} text-[11px]"></i>
                    </span>
                    <span class="min-w-0 flex-1">
                        <span class="flex items-start justify-between gap-2">
                            <span class="text-[12px] font-semibold text-[#343a37]">${escapeHTML(item.title || "Notification")}</span>
                            ${!item.read ? '<span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#20b486]"></span>' : ""}
                        </span>
                        <span class="mt-1 block text-[10px] leading-5 text-[#777]">${escapeHTML(item.message || item.description || "")}</span>
                        <span class="mt-1 block text-[9px] text-[#aaa]">${escapeHTML(notificationDate(item.createdAt || item.date))}</span>
                    </span>`;

                button.addEventListener("click", event => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    const current = getNotifications();
                    if (current.list[index]) current.list[index].read = true;
                    saveUser(current.user);
                    renderNotifications();
                });

                notificationList.appendChild(button);
            });
        }

        function toggleNotifications(event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            if (!notificationDropdown) return;
            const open = notificationDropdown.classList.contains("hidden");
            renderNotifications();
            notificationDropdown.classList.toggle("hidden", !open);
            notificationButton?.setAttribute("aria-expanded", String(open));
        }

        if (notificationButton) {
            notificationButton.addEventListener("click", toggleNotifications, true);
        }

        if (markAll) {
            markAll.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                const current = getNotifications();
                current.list.forEach(item => item.read = true);
                saveUser(current.user);
                renderNotifications();
            }, true);
        }

        if (notificationDropdown) {
            notificationDropdown.addEventListener("click", event => {
                event.stopPropagation();
            }, true);
        }

        document.addEventListener("click", event => {
            if (notificationDropdown && !notificationDropdown.contains(event.target) && event.target !== notificationButton) {
                notificationDropdown.classList.add("hidden");
                notificationButton?.setAttribute("aria-expanded", "false");
            }

            if (searchWrapper && !searchWrapper.contains(event.target)) {
                closeSearch();
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key !== "Escape") return;
            closeSearch();
            notificationDropdown?.classList.add("hidden");
            notificationButton?.setAttribute("aria-expanded", "false");
        });

        renderNotifications();
    });
})();
