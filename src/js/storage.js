/* =========================================================
   REEN BANK — SHARED STORAGE MODULE
   ---------------------------------------------------------
   Canonical user data:
       localStorage.reenUsers

   Active session identity:
       sessionStorage.currentUser

   sessionStorage.currentUser contains only:
       id
       email
       accountNumber

   localStorage.currentUser is intentionally not used.
========================================================= */
(function () {
    "use strict";

    const USERS_KEY = "reenUsers";
    const SESSION_KEY = "currentUser";

    function parseJSON(value, fallback = null) {
        try {
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.error("REEN STORAGE: Invalid JSON", error);
            return fallback;
        }
    }

    function getUsers() {
        const users = parseJSON(localStorage.getItem(USERS_KEY), []);
        return Array.isArray(users) ? users : [];
    }

    function setUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function generateUserId() {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
            return `user_${crypto.randomUUID()}`;
        }
        return `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    }

    function normalizeUsername(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, "")
            .replace(/^[._-]+|[._-]+$/g, "");
    }

    function createUsernameBase(user) {
        const emailBase = String(user?.email || "").split("@")[0];
        const emailUsername = normalizeUsername(emailBase);
        if (emailUsername) return emailUsername;

        const nameBase = String(user?.name || user?.fullName || "user")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "") || "user";
        return nameBase;
    }

    function usernameConflictsWithName(username, user) {
        const usernameKey = normalizeUsername(username);
        const nameKey = normalizeUsername(user?.name || user?.fullName || "");
        return Boolean(usernameKey && nameKey && usernameKey === nameKey);
    }

    function ensureUsername(user) {
        if (!user) return user;

        /* Existing usernames are permanent. Editing the profile name must
           never silently change the account username. */
        const existing = normalizeUsername(user.username);
        if (existing) {
            user.username = existing;
            return user;
        }

        const users = getUsers();
        const ownId = String(user.id || "");
        const base = createUsernameBase(user) || "user";
        let candidate = base;
        let suffix = 1;

        while (
            usernameConflictsWithName(candidate, user) ||
            users.some(item =>
                item &&
                String(item.id || "") !== ownId &&
                normalizeUsername(item.username) === candidate
            )
        ) {
            candidate = `${base}${suffix++}`;
        }

        user.username = candidate;
        return user;
    }

    function ensureUserId(user) {
        if (user && !user.id) user.id = generateUserId();
        return ensureUsername(user);
    }

    function createSessionIdentity(user) {
        if (!user) return null;
        return {
            id: user.id || "",
            email: String(user.email || "").trim().toLowerCase(),
            accountNumber: String(user.accountNumber || user.accountNo || "").trim()
        };
    }

    function getSessionIdentity() {
        return parseJSON(sessionStorage.getItem(SESSION_KEY), null);
    }

    function setSessionIdentity(user) {
        const identity = createSessionIdentity(user);
        if (!identity) return false;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(identity));
        localStorage.removeItem(SESSION_KEY);
        return true;
    }

    function findUserFromIdentity(identity) {
        if (!identity) return null;
        const users = getUsers();

        if (identity.id) {
            const byId = users.find(user =>
                user && user.id && String(user.id) === String(identity.id)
            );
            if (byId) return byId;
        }

        const accountNumber = String(identity.accountNumber || "").trim();
        if (accountNumber) {
            const byAccount = users.find(user =>
                String(user?.accountNumber || user?.accountNo || "").trim() === accountNumber
            );
            if (byAccount) return byAccount;
        }

        const email = String(identity.email || "").trim().toLowerCase();
        if (email) {
            const byEmail = users.find(user =>
                String(user?.email || "").trim().toLowerCase() === email
            );
            if (byEmail) return byEmail;
        }

        return null;
    }

    function loadCurrentUser(options = {}) {
        const redirect = options.redirect !== false;
        const redirectTo = options.redirectTo || "./login.html";
        let identity = getSessionIdentity();

        /* One-time migration for old localStorage.currentUser data. */
        if (!identity) {
            const legacy = parseJSON(localStorage.getItem(SESSION_KEY), null);
            if (legacy) {
                const migratedUser = findUserFromIdentity(legacy);
                if (migratedUser) {
                    setSessionIdentity(migratedUser);
                } else if (legacy.email || legacy.accountNumber || legacy.id) {
                    saveCurrentUser(legacy);
                }
                localStorage.removeItem(SESSION_KEY);
                identity = getSessionIdentity();
            }
        }

        if (!identity) {
            if (redirect) window.location.href = redirectTo;
            return null;
        }

        let user = findUserFromIdentity(identity);

        if (!user) {
            clearCurrentUser();
            if (redirect) window.location.href = redirectTo;
            return null;
        }

        const hadId = Boolean(user.id);
        user = ensureUserId({ ...user });

        if (!hadId) saveCurrentUser(user);
        else setSessionIdentity(user);

        return user;
    }

    function saveCurrentUser(user) {
        if (!user || typeof user !== "object") return false;

        const normalizedUser = ensureUserId({ ...user });
        const users = getUsers();
        const id = String(normalizedUser.id || "");
        const email = String(normalizedUser.email || "").trim().toLowerCase();
        const accountNumber = String(normalizedUser.accountNumber || normalizedUser.accountNo || "").trim();

        let index = -1;

        if (id) {
            index = users.findIndex(item => item?.id && String(item.id) === id);
        }

        if (index === -1 && email) {
            index = users.findIndex(item =>
                String(item?.email || "").trim().toLowerCase() === email
            );
        }

        if (index === -1 && accountNumber) {
            index = users.findIndex(item =>
                String(item?.accountNumber || item?.accountNo || "").trim() === accountNumber
            );
        }

        if (index === -1) users.push(normalizedUser);
        else users[index] = normalizedUser;

        setUsers(users);
        setSessionIdentity(normalizedUser);
        return true;
    }

    function clearCurrentUser() {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_KEY);
    }

    function hasActiveSession() {
        return Boolean(getSessionIdentity());
    }

    function getCurrentUserId() {
        return getSessionIdentity()?.id || null;
    }

    function getCurrentUsername() {
        const user = loadCurrentUser({ redirect: false });
        return user?.username || "User";
    }

    window.ReenStorage = {
        USERS_KEY,
        SESSION_KEY,
        getUsers,
        setUsers,
        getSessionIdentity,
        setSessionIdentity,
        createSessionIdentity,
        findUserFromIdentity,
        loadCurrentUser,
        saveCurrentUser,
        clearCurrentUser,
        hasActiveSession,
        getCurrentUserId,
        getCurrentUsername,
        normalizeUsername
    };
})();
