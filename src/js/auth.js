// =========================================================
// REEN BANK - AUTH.JS
// ONE SOURCE OF TRUTH FOR AUTHENTICATION + USER STORAGE
// =========================================================

(function () {
    "use strict";

    const USERS_KEY = "reenUsers";
    const CURRENT_USER_KEY = "currentUser";

    // =====================================================
    // USERS
    // =====================================================

    function getUsers() {
        try {
            const stored = localStorage.getItem(USERS_KEY);

            if (!stored) {
                return [];
            }

            const users = JSON.parse(stored);

            return Array.isArray(users) ? users : [];

        } catch (error) {
            console.error("AUTH: Could not read reenUsers:", error);
            return [];
        }
    }


    function saveUsers(users) {
        try {
            localStorage.setItem(
                USERS_KEY,
                JSON.stringify(users)
            );

            return true;

        } catch (error) {
            console.error("AUTH: Could not save reenUsers:", error);
            return false;
        }
    }


    // =====================================================
    // CURRENT SESSION
    // =====================================================

    function getSession() {
        try {
            const stored =
                sessionStorage.getItem(CURRENT_USER_KEY);

            if (!stored) {
                return null;
            }

            const session = JSON.parse(stored);

            if (
                !session ||
                typeof session !== "object" ||
                !session.email
            ) {
                return null;
            }

            return session;

        } catch (error) {
            console.error(
                "AUTH: Could not read currentUser:",
                error
            );

            return null;
        }
    }


    function setSession(user) {
        if (!user || !user.email) {
            console.error(
                "AUTH: Cannot create session. User email is missing."
            );

            return false;
        }

        const session = {
            name: user.name || "User",
            email: String(user.email)
                .trim()
                .toLowerCase(),
            accountNumber: user.accountNumber || ""
        };

        try {
            sessionStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(session)
            );

            return true;

        } catch (error) {
            console.error(
                "AUTH: Could not save currentUser:",
                error
            );

            return false;
        }
    }


    // =====================================================
    // FIND CURRENT USER
    // =====================================================

    function getCurrentUser() {

        const session = getSession();

        if (!session || !session.email) {
            return null;
        }

        const users = getUsers();

        const email =
            String(session.email)
                .trim()
                .toLowerCase();

        const userIndex =
            users.findIndex(function (user) {

                return (
                    user &&
                    typeof user.email === "string" &&
                    user.email
                        .trim()
                        .toLowerCase() === email
                );

            });


        if (userIndex === -1) {

            console.error(
                "AUTH: Current session user was not found in reenUsers."
            );

            return null;
        }


        return {
            user: users[userIndex],
            users: users,
            userIndex: userIndex
        };
    }


    // =====================================================
    // REQUIRE LOGIN
    // =====================================================

    function requireAuth() {

        const result = getCurrentUser();

        if (!result) {

            console.warn(
                "AUTH: No authenticated user."
            );

            window.location.replace("./login.html");

            return null;
        }


        // Keep the session synchronized
        setSession(result.user);


        return result;
    }


    // =====================================================
    // SAVE CURRENT USER
    // =====================================================

    function saveCurrentUser(user) {

        if (!user || !user.email) {

            console.error(
                "AUTH: Cannot save user."
            );

            return false;
        }


        const users = getUsers();

        const email =
            String(user.email)
                .trim()
                .toLowerCase();


        const userIndex =
            users.findIndex(function (item) {

                return (
                    item &&
                    typeof item.email === "string" &&
                    item.email
                        .trim()
                        .toLowerCase() === email
                );

            });


        if (userIndex === -1) {

            console.error(
                "AUTH: User does not exist in reenUsers."
            );

            return false;
        }


        users[userIndex] = user;


        const saved = saveUsers(users);


        if (saved) {
            setSession(user);
        }


        return saved;
    }


    // =====================================================
    // UPDATE USER FIELD
    // =====================================================

    function updateCurrentUser(callback) {

        const result = getCurrentUser();

        if (!result) {
            return null;
        }


        const updatedUser =
            callback(result.user);


        if (!updatedUser) {
            return null;
        }


        result.users[result.userIndex] =
            updatedUser;


        const saved =
            saveUsers(result.users);


        if (!saved) {
            return null;
        }


        setSession(updatedUser);


        return updatedUser;
    }


    // =====================================================
    // LOGOUT
    // =====================================================

    function logout() {

        sessionStorage.removeItem(
            CURRENT_USER_KEY
        );

        window.location.replace(
            "./login.html"
        );
    }


    // =====================================================
    // FORMAT MONEY
    // =====================================================

    function formatMoney(amount) {

        const value =
            Number(amount) || 0;


        return new Intl.NumberFormat(
            "en-NG",
            {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ).format(value);
    }


    // =====================================================
    // INITIALIZE USER
    // =====================================================

    function initializeUser(user) {

        if (!user) {
            return null;
        }


        if (typeof user.balance !== "number") {
            user.balance = Number(user.balance) || 0;
        }


        if (typeof user.income !== "number") {
            user.income = Number(user.income) || 0;
        }


        if (typeof user.expense !== "number") {
            user.expense = Number(user.expense) || 0;
        }


        if (typeof user.schoolSavings !== "number") {
            user.schoolSavings =
                Number(user.schoolSavings) || 0;
        }


        if (typeof user.holidayBalance !== "number") {
            user.holidayBalance =
                Number(user.holidayBalance) || 0;
        }


        if (!Array.isArray(user.transactions)) {
            user.transactions = [];
        }


        if (!Array.isArray(user.accounts)) {
            user.accounts = [];
        }


        if (!user.accountNumber) {
            user.accountNumber =
                generateAccountNumber(
                    user.email
                );
        }


        if (!user.createdAt) {
            user.createdAt =
                new Date().toISOString();
        }


        return user;
    }


    // =====================================================
    // ACCOUNT NUMBER
    // =====================================================

    function generateAccountNumber(email) {

        const users = getUsers();

        let number = "";

        const source =
            String(email || "reenbank")
                .toLowerCase();


        for (let i = 0; i < source.length; i++) {

            number +=
                source.charCodeAt(i)
                    .toString()
                    .replace(/\D/g, "");

        }


        number =
            number
                .replace(/\D/g, "")
                .substring(0, 10);


        while (number.length < 10) {

            number +=
                Math.floor(
                    Math.random() * 10
                );

        }


        let candidate = number;


        function exists(value) {

            return users.some(function (user) {

                return (
                    user &&
                    user.accountNumber === value
                );

            });

        }


        while (exists(candidate)) {

            candidate =
                String(
                    Math.floor(
                        1000000000 +
                        Math.random() * 9000000000
                    )
                );

        }


        return candidate;
    }


    // =====================================================
    // EXPOSE API
    // =====================================================

    window.ReenAuth = {

        USERS_KEY,
        CURRENT_USER_KEY,

        getUsers,
        saveUsers,

        getSession,
        setSession,

        getCurrentUser,
        requireAuth,

        saveCurrentUser,
        updateCurrentUser,

        initializeUser,

        generateAccountNumber,

        formatMoney,

        logout
    };


    console.log(
        "REEN BANK AUTH.JS LOADED"
    );

})();