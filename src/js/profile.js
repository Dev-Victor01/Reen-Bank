/* =========================================================
   REEN BANK — PROFILE PAGE JAVASCRIPT
   ---------------------------------------------------------
   Works with:
   - profile.html
   - overview.html
   - account.html
   - transaction.html
   - reenUsers -> localStorage
   - currentUser -> sessionStorage/localStorage

   FEATURES
   ---------------------------------------------------------
   ✓ Second name displayed across pages
   ✓ Full registered name preserved in Edit Profile
   ✓ Same user across all pages
   ✓ Same account number across all pages
   ✓ Same profile image across all pages
   ✓ Edit name
   ✓ Edit phone number
   ✓ Edit gender
   ✓ Change email with OTP verification
   ✓ Profile image upload
   ✓ Reset password
   ✓ Balance show/hide
   ✓ Latest 5 transactions
   ✓ Notifications
   ✓ Notification red dot
   ✓ Mark notifications as read
   ✓ Logout modal
   ✓ Mobile sidebar
   ✓ No alert()
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. STORAGE
    ===================================================== */

    const USERS_KEY = ReenStorage.USERS_KEY;

    const EMAIL_OTP_KEY = "reenProfileEmailOTP";
    const EMAIL_OTP_EXPIRY_KEY = "reenProfileEmailOTPExpiry";
    const PENDING_EMAIL_KEY = "reenProfilePendingEmail";


    /* =====================================================
       2. DOM HELPER
    ===================================================== */

    const $ = (id) => document.getElementById(id);


    /* =====================================================
       3. LOAD USERS
    ===================================================== */

    let currentUser = ReenStorage.loadCurrentUser();

    if (!currentUser) {
        return;
    }

    let users = ReenStorage.getUsers();

    /* =====================================================
       6. FIND CANONICAL USER
    ===================================================== */

    let userIndex = users.findIndex(
        user => user && currentUser.id && String(user.id) === String(currentUser.id)
    );

    if (userIndex === -1) {
        userIndex = users.findIndex(
            user => String(user?.email || "").trim().toLowerCase() ===
                String(currentUser.email || "").trim().toLowerCase()
        );
    }

    /* =====================================================
       7. NORMALIZE USER
    ===================================================== */

    if (!currentUser.name) {
        currentUser.name = "User";
    }

    if (!currentUser.email) {
        currentUser.email = "";
    }

    if (!currentUser.accountNumber) {
        currentUser.accountNumber = "";
    }

    if (!currentUser.phone) {
        currentUser.phone = "";
    }

    if (!currentUser.gender) {
        currentUser.gender = "";
    }

    if (!Array.isArray(currentUser.transactions)) {
        currentUser.transactions = [];
    }

    if (!Array.isArray(currentUser.accounts)) {
        currentUser.accounts = [];
    }

    if (!Array.isArray(currentUser.notifications)) {
        currentUser.notifications = [];
    }


    /* =====================================================
       8. SAVE USER
    ===================================================== */

    function saveUser() {
        const saved = ReenStorage.saveCurrentUser(currentUser);
        if (saved) {
            users = ReenStorage.getUsers();
            userIndex = users.findIndex(
                user => user?.id && currentUser.id && String(user.id) === String(currentUser.id)
            );
        }
        return saved;
    }


    /*  DISPLAY NAME */

    function getDisplayName() {

        const fullName = String(
            currentUser?.name || "User"
        )
            .trim()
            .replace(/\s+/g, " ");

        if (!fullName) {
            return "User";
        }

        const nameParts = fullName.split(" ");

        return nameParts.length === 1
            ? nameParts[0]
            : nameParts[1];
    }

    /* =====================================================
       10. INITIALS
    ===================================================== */

    function getInitials(name) {

        if (!name) {
            return "U";
        }

        const parts =
            String(name)
                .trim()
                .split(/\s+/)
                .filter(Boolean);

        if (parts.length === 1) {
            return parts[0]
                .charAt(0)
                .toUpperCase();
        }

        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();
    }


    /* =====================================================
       11. CURRENCY
    ===================================================== */

    function formatCurrency(amount) {

        return new Intl.NumberFormat(
            "en-NG",
            {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ).format(Number(amount) || 0);
    }


    /* =====================================================
       12. ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       13. USER INFORMATION
    ===================================================== */

    function renderUserInformation() {

        /*
         * Page username uses the second name.
         * The full registered name remains stored in
         * currentUser.name and is used by Edit Profile.
         */

        const name = currentUser?.username || "User";

        const email =
            currentUser.email ||
            "Not available";

        const phone =
            currentUser.phone ||
            currentUser.phoneNumber ||
            "Not added";

        const gender =
            currentUser.gender ||
            "Not added";

        const accountNumber =
            currentUser.accountNumber ||
            "0000000000";

        const initials =
            getInitials(name);


        /* -----------------------------------------------
           HEADER
        ------------------------------------------------ */

        if ($("headerUserName")) {
            $("headerUserName").textContent =
                name;
        }

        if ($("headerAccountNumber")) {
            $("headerAccountNumber").textContent =
                accountNumber;
        }

        if ($("mobileHeaderUserName")) {
            $("mobileHeaderUserName").textContent =
                name;
        }

        if ($("mobileHeaderAccountNumber")) {
            $("mobileHeaderAccountNumber").textContent =
                accountNumber;
        }


        /* -----------------------------------------------
           PROFILE DETAILS
        ------------------------------------------------ */

        if ($("profileName")) {
            $("profileName").textContent =
                name;
        }

        if ($("profileEmail")) {
            $("profileEmail").textContent =
                email;
        }

        if ($("profilePhone")) {
            $("profilePhone").textContent =
                phone;
        }

        if ($("profileGender")) {
            $("profileGender").textContent =
                gender;
        }


        /* -----------------------------------------------
           INITIALS
        ------------------------------------------------ */

        if ($("profileInitials")) {
            $("profileInitials").textContent =
                initials;
        }

        if ($("headerProfileInitials")) {
            $("headerProfileInitials").textContent =
                initials;
        }

        if ($("profileImagePreviewInitials")) {
            $("profileImagePreviewInitials")
                .textContent = initials;
        }


        /* -----------------------------------------------
           IMAGES
        ------------------------------------------------ */

        if (
            currentUser.profileImage &&
            typeof currentUser.profileImage === "string"
        ) {

            if ($("headerProfileImage")) {
                $("headerProfileImage").src =
                    currentUser.profileImage;

                $("headerProfileImage")
                    .classList.remove("hidden");
            }

            if ($("profileImage")) {
                $("profileImage").src =
                    currentUser.profileImage;

                $("profileImage")
                    .classList.remove("hidden");
            }

            if ($("profileImagePreview")) {
                $("profileImagePreview").src =
                    currentUser.profileImage;

                $("profileImagePreview")
                    .classList.remove("hidden");
            }

            if ($("headerProfileInitials")) {
                $("headerProfileInitials")
                    .classList.add("hidden");
            }

            if ($("profileInitials")) {
                $("profileInitials")
                    .classList.add("hidden");
            }

        } else {

            if ($("headerProfileImage")) {
                $("headerProfileImage")
                    .classList.add("hidden");
            }

            if ($("profileImage")) {
                $("profileImage")
                    .classList.add("hidden");
            }

            if ($("profileImagePreview")) {
                $("profileImagePreview")
                    .classList.add("hidden");
            }

            if ($("headerProfileInitials")) {
                $("headerProfileInitials")
                    .classList.remove("hidden");
            }

            if ($("profileInitials")) {
                $("profileInitials")
                    .classList.remove("hidden");
            }
        }


        /* -----------------------------------------------
           EDIT FORM
        ------------------------------------------------ */

        if ($("editProfileName")) {
            $("editProfileName").value =
                currentUser.name || "";
        }

        if ($("editPhoneNumber")) {
            $("editPhoneNumber").value =
                currentUser.phone ||
                currentUser.phoneNumber ||
                "";
        }

        if ($("editGender")) {
            $("editGender").value =
                currentUser.gender || "";
        }

        if ($("editEmail")) {
            $("editEmail").value =
                currentUser.email || "";
        }
    }


    /* =====================================================
       14. BALANCE
    ===================================================== */

    let balanceVisible = true;

    function renderBalance() {

        const balance =
            Number(currentUser.balance) || 0;

        if ($("profileMainAccountBalance")) {

            $("profileMainAccountBalance")
                .textContent = balanceVisible
                    ? formatCurrency(balance)
                    : "₦••••••";
        }
    }


    function toggleBalance() {

        balanceVisible =
            !balanceVisible;

        renderBalance();

        const icon =
            $("profileBalanceEye");

        if (icon) {

            icon.classList.toggle(
                "fa-eye",
                balanceVisible
            );

            icon.classList.toggle(
                "fa-eye-slash",
                !balanceVisible
            );
        }
    }


    if ($("profileBalanceToggle")) {

        $("profileBalanceToggle")
            .addEventListener(
                "click",
                toggleBalance
            );
    }


    /* =====================================================
       15. TRANSACTION NORMALIZATION
    ===================================================== */

    function normalizeTransaction(
        transaction,
        accountName = "Main Account"
    ) {

        if (!transaction) {
            return null;
        }

        const amount =
            Math.abs(
                Number(
                    transaction.amount ??
                    transaction.value ??
                    0
                )
            );

        if (!amount) {
            return null;
        }

        let type =
            String(
                transaction.type ??
                transaction.transactionType ??
                transaction.direction ??
                transaction.category ??
                ""
            )
                .toLowerCase()
                .trim();

        const title =
            transaction.title ||
            transaction.name ||
            transaction.description ||
            "Transaction";

        const description =
            transaction.description ||
            transaction.title ||
            "";

        const paymentMethod =
            transaction.paymentMethod ||
            transaction.method ||
            "Direct";

        const status =
            transaction.status ||
            "completed";

        const date =
            transaction.createdAt ||
            transaction.date ||
            transaction.timestamp ||
            new Date().toISOString();


        if (
            type.includes("income") ||
            type.includes("deposit") ||
            type.includes("credit") ||
            type.includes("fund")
        ) {
            type = "income";
        } else if (
            type.includes("expense") ||
            type.includes("withdraw") ||
            type.includes("debit")
        ) {
            type = "expense";
        } else {
            type =
                Number(transaction.amount) < 0
                    ? "expense"
                    : "income";
        }


        return {

            id:
                transaction.id ||
                `${accountName}-${title}-${date}-${amount}`,

            title,

            description,

            amount,

            type,

            status,

            paymentMethod,

            account:
                transaction.account ||
                transaction.accountName ||
                accountName,

            bank:
                transaction.bank ||
                "",

            date
        };
    }


    /* =====================================================
       16. GET ALL PROFILE TRANSACTIONS
    ===================================================== */

    function getAllTransactions() {

        const transactions = [];

        if (
            Array.isArray(
                currentUser.transactions
            )
        ) {

            currentUser.transactions.forEach(
                (transaction) => {

                    const normalized =
                        normalizeTransaction(
                            transaction,
                            "Main Account"
                        );

                    if (normalized) {
                        transactions.push(
                            normalized
                        );
                    }
                }
            );
        }


        if (
            Array.isArray(
                currentUser.accounts
            )
        ) {

            currentUser.accounts.forEach(
                (account) => {

                    if (
                        !Array.isArray(
                            account.transactions
                        )
                    ) {
                        return;
                    }

                    const accountName =
                        account.name ||
                        "Custom Account";

                    account.transactions.forEach(
                        (transaction) => {

                            const normalized =
                                normalizeTransaction(
                                    transaction,
                                    accountName
                                );

                            if (normalized) {
                                transactions.push(
                                    normalized
                                );
                            }
                        }
                    );
                }
            );
        }


        /*
         * Remove duplicates.
         */

        const unique =
            new Map();

        transactions.forEach(
            (transaction) => {

                const key =
                    transaction.id ||
                    `${transaction.title}-${transaction.amount}-${transaction.date}`;

                if (!unique.has(key)) {
                    unique.set(
                        key,
                        transaction
                    );
                }
            }
        );


        return Array.from(
            unique.values()
        )
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );
    }


    /* =====================================================
       17. FORMAT DATE
    ===================================================== */

    function formatDate(date) {

        const parsed =
            new Date(date);

        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {
            return "Date unavailable";
        }

        return parsed.toLocaleDateString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    /* =====================================================
       18. RENDER LATEST 5 TRANSACTIONS
    ===================================================== */

    function renderTransactions() {

        const list =
            $("profileTransactionsList");

        const empty =
            $("profileTransactionsEmpty");

        if (!list) {
            return;
        }

        const transactions =
            getAllTransactions()
                .slice(0, 5);


        list.innerHTML = "";


        if (!transactions.length) {

            if (empty) {
                empty.classList.remove(
                    "hidden"
                );
            }

            return;
        }


        if (empty) {
            empty.classList.add(
                "hidden"
            );
        }


        transactions.forEach(
            (transaction) => {

                const isIncome =
                    transaction.type ===
                    "income";

                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "flex items-center justify-between gap-4 py-4 border-b border-gray-100";


                row.innerHTML = `

                    <div class="flex items-center gap-3 min-w-0">

                        <div class="
                            w-10 h-10
                            rounded-full
                            flex items-center justify-center
                            shrink-0
                            ${
                                isIncome
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-500"
                            }
                        ">

                            <i class="
                                fa-solid
                                ${
                                    isIncome
                                        ? "fa-plus"
                                        : "fa-minus"
                                }
                            "></i>

                        </div>


                        <div class="min-w-0">

                            <p class="
                                text-sm
                                font-semibold
                                text-gray-900
                                truncate
                            ">
                                ${escapeHTML(
                                    transaction.title
                                )}
                            </p>

                            <p class="
                                text-xs
                                text-gray-500
                                truncate
                            ">
                                ${escapeHTML(
                                    transaction.account
                                )}
                            </p>

                        </div>

                    </div>


                    <div class="text-right shrink-0">

                        <p class="
                            text-sm
                            font-semibold
                            ${
                                isIncome
                                    ? "text-green-600"
                                    : "text-red-500"
                            }
                        ">
                            ${
                                isIncome
                                    ? "+"
                                    : "-"
                            }${formatCurrency(
                                transaction.amount
                            )}
                        </p>

                        <p class="
                            text-xs
                            text-gray-400
                            mt-1
                        ">
                            ${formatDate(
                                transaction.date
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


                list.appendChild(row);
            }
        );
    }


    /* =====================================================
       19. TRANSACTION DETAILS
    ===================================================== */

    function showTransactionDetails(
        transaction
    ) {

        const modal =
            $("transactionDetailsModal");

        const content =
            $("transactionDetailsContent");

        if (!modal || !content) {
            return;
        }


        const isIncome =
            transaction.type ===
            "income";


        content.innerHTML = `

            <div class="space-y-5">

                <div class="flex items-center gap-4">

                    <div class="
                        w-12 h-12
                        rounded-full
                        flex items-center justify-center
                        ${
                            isIncome
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-500"
                        }
                    ">

                        <i class="
                            fa-solid
                            ${
                                isIncome
                                    ? "fa-plus"
                                    : "fa-minus"
                            }
                        "></i>

                    </div>

                    <div>

                        <p class="
                            text-lg
                            font-semibold
                            text-gray-900
                        ">
                            ${escapeHTML(
                                transaction.title
                            )}
                        </p>

                        <p class="
                            text-sm
                            text-gray-500
                        ">
                            ${escapeHTML(
                                transaction.account
                            )}
                        </p>

                    </div>

                </div>


                <div class="
                    text-2xl
                    font-bold
                    ${
                        isIncome
                            ? "text-green-600"
                            : "text-red-500"
                    }
                ">
                    ${
                        isIncome
                            ? "+"
                            : "-"
                    }${formatCurrency(
                        transaction.amount
                    )}
                </div>


                <div class="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-4
                ">

                    <div>

                        <p class="
                            text-xs
                            text-gray-400
                        ">
                            Payment Method
                        </p>

                        <p class="
                            text-sm
                            font-medium
                            text-gray-900
                            mt-1
                        ">
                            ${escapeHTML(
                                transaction.paymentMethod
                            )}
                        </p>

                    </div>


                    <div>

                        <p class="
                            text-xs
                            text-gray-400
                        ">
                            Date
                        </p>

                        <p class="
                            text-sm
                            font-medium
                            text-gray-900
                            mt-1
                        ">
                            ${formatDate(
                                transaction.date
                            )}
                        </p>

                    </div>


                    <div>

                        <p class="
                            text-xs
                            text-gray-400
                        ">
                            Status
                        </p>

                        <p class="
                            text-sm
                            font-medium
                            text-gray-900
                            mt-1
                        ">
                            ${escapeHTML(
                                transaction.status
                            )}
                        </p>

                    </div>


                    ${
                        transaction.description
                            ? `
                                <div>

                                    <p class="
                                        text-xs
                                        text-gray-400
                                    ">
                                        Description
                                    </p>

                                    <p class="
                                        text-sm
                                        font-medium
                                        text-gray-900
                                        mt-1
                                    ">
                                        ${escapeHTML(
                                            transaction.description
                                        )}
                                    </p>

                                </div>
                            `
                            : ""
                    }

                </div>

            </div>

        `;


        openModal(modal);
    }


    /* =====================================================
       20. MODAL HELPERS
    ===================================================== */

    function openModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "hidden"
        );

        modal.classList.add(
            "flex"
        );

        /* Every profile modal is a fixed viewport overlay.
           Re-adding flex guarantees items-center/justify-center
           are active every time the modal is opened. */
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";

        document.body.classList.add(
            "overflow-hidden"
        );
    }


    function closeModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.add(
            "hidden"
        );

        modal.classList.remove(
            "flex"
        );
        modal.style.display = "";
        modal.style.alignItems = "";
        modal.style.justifyContent = "";

        document.body.classList.remove(
            "overflow-hidden"
        );
    }


    function closeAllModals() {

        [
            "editProfileModal",
            "profileImageModal",
            "emailVerificationModal",
            "resetPasswordModal",
            "profileSuccessModal",
            "logoutModal",
            "transactionDetailsModal"
        ].forEach(
            (id) => {

                closeModal(
                    $(id)
                );
            }
        );
    }


    /* =====================================================
       21. EDIT PROFILE
    ===================================================== */

    function populateEditProfileForm() {

        if ($("editProfileName")) {
            $("editProfileName").value =
                currentUser.name || "";
        }

        if ($("editPhoneNumber")) {
            $("editPhoneNumber").value =
                currentUser.phone ||
                currentUser.phoneNumber ||
                "";
        }

        if ($("editGender")) {
            $("editGender").value =
                currentUser.gender || "";
        }

        if ($("editEmail")) {
            $("editEmail").value =
                currentUser.email || "";
        }

        if ($("editProfileError")) {
            $("editProfileError").textContent = "";
            $("editProfileError").classList.add("hidden");
        }
    }

    /*
     * Use event delegation so the button still works even if the
     * surrounding page markup is changed or another component rerenders.
     */
    document.addEventListener("click", (event) => {

        const button = event.target.closest("#editProfileButton");

        if (!button) {
            return;
        }

        event.preventDefault();
        populateEditProfileForm();
        openModal($("editProfileModal"));
    });


    /* =====================================================
       22. SAVE PROFILE
    ===================================================== */

    if ($("editProfileForm")) {

        $("editProfileForm").addEventListener("submit", (event) => {

            event.preventDefault();

            const name = $("editProfileName")?.value.trim() || "";
            const phone = $("editPhoneNumber")?.value.trim() || "";
            const gender = $("editGender")?.value.trim() || "";
            const email = $("editEmail")?.value.trim().toLowerCase() || "";
            const errorBox = $("editProfileError");

            const showError = (message) => {
                if (errorBox) {
                    errorBox.textContent = message;
                    errorBox.classList.remove("hidden");
                }
            };

            if (!name) {
                showError("Please enter your full name.");
                return;
            }

            const normalizedName = ReenStorage.normalizeUsername(name);
            const normalizedUsername = ReenStorage.normalizeUsername(
                currentUser.username || ""
            );

            if (normalizedUsername && normalizedName === normalizedUsername) {
                showError("Your profile name must be different from your username.");
                return;
            }

            if (
                email &&
                email !== String(currentUser.email || "").trim().toLowerCase()
            ) {
                const emailExists = users.some((user, index) =>
                    index !== userIndex &&
                    String(user?.email || "").trim().toLowerCase() === email
                );

                if (emailExists) {
                    showError("This email is already registered.");
                    return;
                }

                currentUser.name = name;
                currentUser.phone = phone;
                currentUser.gender = gender;

                if (!currentUser.username) {
                    currentUser.username = ReenStorage.getCurrentUsername();
                }

                saveUser();
                sendEmailVerification(email);
                closeModal($("editProfileModal"));
                return;
            }

            currentUser.name = name;
            currentUser.phone = phone;
            currentUser.gender = gender;

            if (!currentUser.username) {
                currentUser.username = ReenStorage.getCurrentUsername();
            }

            const saved = saveUser();

            if (!saved) {
                showError("Could not save your profile changes.");
                return;
            }

            renderUserInformation();
            closeModal($("editProfileModal"));

            showSuccess(
                "Profile Updated",
                "Your profile information has been updated successfully."
            );
        });
    }


    /* =====================================================
       23. EMAIL OTP
    ===================================================== */

    function generateOTP() {

        return String(
            Math.floor(
                100000 +
                Math.random() * 900000
            )
        );
    }


    function sendEmailVerification(
        newEmail
    ) {

        const otp =
            generateOTP();

        const expiry =
            Date.now() +
            10 * 60 * 1000;


        sessionStorage.setItem(
            EMAIL_OTP_KEY,
            otp
        );

        sessionStorage.setItem(
            EMAIL_OTP_EXPIRY_KEY,
            String(expiry)
        );

        sessionStorage.setItem(
            PENDING_EMAIL_KEY,
            newEmail
        );


        if ($("verificationEmailText")) {
            $("verificationEmailText")
                .textContent =
                newEmail;
        }

        if ($("emailOtpInput")) {
            $("emailOtpInput").value = "";
        }

        if ($("emailOtpError")) {
            $("emailOtpError")
                .textContent = "";
        }


        /*
         * Demo frontend verification.
         * Replace this with a real backend/email
         * service when the project is connected
         * to a server.
         */

        console.log(
            "REEN BANK EMAIL VERIFICATION OTP:",
            otp
        );


        openModal(
            $("emailVerificationModal")
        );
    }


    if ($("verifyEmailButton")) {

        $("verifyEmailButton")
            .addEventListener(
                "click",
                () => {

                    const entered =
                        $("emailOtpInput")
                            ?.value
                            .trim() || "";

                    const savedOTP =
                        sessionStorage.getItem(
                            EMAIL_OTP_KEY
                        );

                    const expiry =
                        Number(
                            sessionStorage.getItem(
                                EMAIL_OTP_EXPIRY_KEY
                            )
                        );

                    const pendingEmail =
                        sessionStorage.getItem(
                            PENDING_EMAIL_KEY
                        );


                    if (!entered) {

                        if ($("emailOtpError")) {
                            $("emailOtpError")
                                .textContent =
                                "Enter the verification code.";
                        }

                        return;
                    }


                    if (
                        !savedOTP ||
                        Date.now() > expiry
                    ) {

                        if ($("emailOtpError")) {
                            $("emailOtpError")
                                .textContent =
                                "This verification code has expired.";
                        }

                        return;
                    }


                    if (
                        entered !==
                        savedOTP
                    ) {

                        if ($("emailOtpError")) {
                            $("emailOtpError")
                                .textContent =
                                "Invalid verification code.";
                        }

                        return;
                    }


                    if (pendingEmail) {

                        currentUser.email =
                            pendingEmail;
                    }


                    sessionStorage.removeItem(
                        EMAIL_OTP_KEY
                    );

                    sessionStorage.removeItem(
                        EMAIL_OTP_EXPIRY_KEY
                    );

                    sessionStorage.removeItem(
                        PENDING_EMAIL_KEY
                    );


                    saveUser();

                    renderUserInformation();


                    closeModal(
                        $("emailVerificationModal")
                    );


                    showSuccess(
                        "Email Updated",
                        "Your email address has been verified and updated successfully."
                    );
                }
            );
    }


    /* =====================================================
       24. RESEND EMAIL OTP
    ===================================================== */

    if ($("resendEmailOtp")) {

        $("resendEmailOtp")
            .addEventListener(
                "click",
                () => {

                    const email =
                        sessionStorage.getItem(
                            PENDING_EMAIL_KEY
                        );

                    if (!email) {
                        return;
                    }

                    sendEmailVerification(
                        email
                    );
                }
            );
    }


    /* =====================================================
       25. PROFILE IMAGE
    ===================================================== */

    if ($("editProfileImageButton")) {

        $("editProfileImageButton")
            .addEventListener(
                "click",
                () => {

                    if ($("profileImageError")) {
                        $("profileImageError")
                            .textContent = "";
                    }

                    openModal(
                        $("profileImageModal")
                    );
                }
            );
    }


    if ($("profileImageInput")) {

        $("profileImageInput")
            .addEventListener(
                "change",
                (event) => {

                    const file =
                        event.target.files?.[0];

                    if (!file) {
                        return;
                    }


                    if (
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {

                        if ($("profileImageError")) {
                            $("profileImageError")
                                .textContent =
                                "Please select an image file.";
                        }

                        return;
                    }


                    if (
                        file.size >
                        3 * 1024 * 1024
                    ) {

                        if ($("profileImageError")) {
                            $("profileImageError")
                                .textContent =
                                "Image must be smaller than 3MB.";
                        }

                        return;
                    }


                    const reader =
                        new FileReader();


                    reader.onload = () => {

                        if ($("profileImagePreview")) {

                            $("profileImagePreview")
                                .src =
                                reader.result;

                            $("profileImagePreview")
                                .classList.remove(
                                    "hidden"
                                );
                        }

                        if ($("profileImagePreviewInitials")) {
                            $("profileImagePreviewInitials")
                                .classList.add(
                                    "hidden"
                                );
                        }
                    };


                    reader.readAsDataURL(file);
                }
            );
    }


    if ($("saveProfileImage")) {

        $("saveProfileImage")
            .addEventListener(
                "click",
                () => {

                    const preview =
                        $("profileImagePreview");

                    if (
                        !preview ||
                        !preview.src ||
                        preview.src ===
                        window.location.href
                    ) {
                        return;
                    }


                    currentUser.profileImage =
                        preview.src;


                    saveUser();

                    renderUserInformation();


                    closeModal(
                        $("profileImageModal")
                    );


                    showSuccess(
                        "Profile Photo Updated",
                        "Your profile photo has been updated successfully."
                    );
                }
            );
    }


    if ($("cancelProfileImage")) {

        $("cancelProfileImage")
            .addEventListener(
                "click",
                () => {

                    closeModal(
                        $("profileImageModal")
                    );
                }
            );
    }


    if ($("closeProfileImageModal")) {

        $("closeProfileImageModal")
            .addEventListener(
                "click",
                () => {

                    closeModal(
                        $("profileImageModal")
                    );
                }
            );
    }


    /* =====================================================
       26. RESET PASSWORD
    ===================================================== */

    if ($("resetPasswordButton")) {

        $("resetPasswordButton")
            .addEventListener(
                "click",
                () => {

                    if ($("resetPasswordForm")) {
                        $("resetPasswordForm")
                            .reset();
                    }

                    if ($("resetPasswordError")) {
                        $("resetPasswordError")
                            .textContent = "";
                    }

                    openModal(
                        $("resetPasswordModal")
                    );
                }
            );
    }


    if ($("resetPasswordForm")) {

        $("resetPasswordForm")
            .addEventListener(
                "submit",
                (event) => {

                    event.preventDefault();


                    const newPassword =
                        $("newPassword")
                            ?.value || "";

                    const confirmPassword =
                        $("confirmNewPassword")
                            ?.value || "";


                    const error =
                        $("resetPasswordError");


                    if (
                        newPassword.length <
                        8
                    ) {

                        if (error) {
                            error.textContent =
                                "Password must be at least 8 characters.";
                        }

                        return;
                    }


                    if (
                        newPassword !==
                        confirmPassword
                    ) {

                        if (error) {
                            error.textContent =
                                "Passwords do not match.";
                        }

                        return;
                    }


                    /*
                     * Prototype only.
                     * Production applications should
                     * never store passwords directly
                     * in localStorage.
                     */

                    currentUser.password =
                        newPassword;


                    saveUser();


                    closeModal(
                        $("resetPasswordModal")
                    );


                    showSuccess(
                        "Password Reset",
                        "Your password has been changed successfully."
                    );
                }
            );
    }


    /* =====================================================
       27. PASSWORD VISIBILITY
    ===================================================== */

    function setupPasswordToggle(
        buttonId,
        inputId
    ) {

        const button =
            $(buttonId);

        const input =
            $(inputId);

        if (!button || !input) {
            return;
        }


        button.addEventListener(
            "click",
            () => {

                const showing =
                    input.type === "text";

                input.type =
                    showing
                        ? "password"
                        : "text";


                const icon =
                    button.querySelector(
                       ("i")
                    );

                if (icon) {

                    icon.classList.toggle(
                        "fa-eye",
                        showing
                    );

                    icon.classList.toggle(
                        "fa-eye-slash",
                        !showing
                    );
                }
            }
        );
    }


    setupPasswordToggle(
        "toggleNewPassword",
        "newPassword"
    );

    setupPasswordToggle(
        "toggleConfirmPassword",
        "confirmNewPassword"
    );


    /* =====================================================
       28. SUCCESS MODAL
    ===================================================== */

    function showSuccess(
        title,
        message
    ) {

        if ($("profileSuccessTitle")) {
            $("profileSuccessTitle")
                .textContent = title;
        }

        if ($("profileSuccessMessage")) {
            $("profileSuccessMessage")
                .textContent = message;
        }

        openModal(
            $("profileSuccessModal")
        );
    }


    if ($("closeProfileSuccess")) {

        $("closeProfileSuccess")
            .addEventListener(
                "click",
                () => {

                    closeModal(
                        $("profileSuccessModal")
                    );
                }
            );
    }


    /* =====================================================
       29. NOTIFICATIONS
       -----------------------------------------------------
       Only the red notification dot is shown.
       No number is displayed on the bell.
    ===================================================== */

    function renderNotifications() {

        const notifications =
            Array.isArray(
                currentUser.notifications
            )
                ? currentUser.notifications
                : [];


        const list =
            $("notificationList");

        const dropdown =
            $("notificationDropdown");

        const dot =
            $("notificationDot");


        const unread =
            notifications.filter(
                (notification) =>
                    !notification.read
            );


        if (dot) {

            dot.textContent = "";

            if (unread.length) {
                dot.classList.remove(
                    "hidden"
                );
            } else {
                dot.classList.add(
                    "hidden"
                );
            }
        }


        if (!list) {
            return;
        }


        list.innerHTML = "";


        if (!notifications.length) {

            list.innerHTML = `
                <div class="
                    px-4
                    py-6
                    text-center
                    text-sm
                    text-gray-400
                ">
                    No notifications
                </div>
            `;

            return;
        }


        notifications
            .slice()
            .sort(
                (a, b) =>
                    new Date(
                        b.createdAt ||
                        b.date ||
                        0
                    ) -
                    new Date(
                        a.createdAt ||
                        a.date ||
                        0
                    )
            )
            .slice(0, 10)
            .forEach(
                (notification) => {

                    const item =
                        document.createElement(
                            "div"
                        );

                    item.className = `
                        px-4
                        py-3
                        border-b
                        border-gray-100
                        ${
                            notification.read
                                ? "bg-white"
                                : "bg-green-50"
                        }
                    `;


                    item.innerHTML = `

                        <div class="flex gap-3">

                            <div class="
                                w-8
                                h-8
                                rounded-full
                                bg-green-100
                                text-green-600
                                flex
                                items-center
                                justify-center
                                shrink-0
                            ">

                                <i class="
                                    fa-solid
                                    fa-bell
                                    text-xs
                                "></i>

                            </div>


                            <div class="min-w-0">

                                <p class="
                                    text-sm
                                    font-semibold
                                    text-gray-800
                                ">
                                    ${escapeHTML(
                                        notification.title ||
                                        "Notification"
                                    )}
                                </p>

                                <p class="
                                    text-xs
                                    text-gray-500
                                    mt-1
                                ">
                                    ${escapeHTML(
                                        notification.message ||
                                        notification.description ||
                                        ""
                                    )}
                                </p>

                            </div>

                        </div>

                    `;


                    list.appendChild(item);
                }
            );
    }


    /* =====================================================
       30. NOTIFICATION DROPDOWN
    ===================================================== */

    if ($("notificationButton")) {

        $("notificationButton")
            .addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();

                    const dropdown =
                        $("notificationDropdown");

                    if (!dropdown) {
                        return;
                    }

                    dropdown.classList.toggle(
                        "hidden"
                    );
                }
            );
    }


    document.addEventListener(
        "click",
        (event) => {

            const dropdown =
                $("notificationDropdown");

            const button =
                $("notificationButton");

            if (
                dropdown &&
                !dropdown.contains(event.target) &&
                button &&
                !button.contains(event.target)
            ) {

                dropdown.classList.add(
                    "hidden"
                );
            }
        }
    );


    /* =====================================================
       31. MARK ALL NOTIFICATIONS READ
    ===================================================== */

    if ($("markAllNotificationsRead")) {

        $("markAllNotificationsRead")
            .addEventListener(
                "click",
                () => {

                    if (
                        !Array.isArray(
                            currentUser.notifications
                        )
                    ) {
                        return;
                    }


                    currentUser.notifications =
                        currentUser.notifications.map(
                            (notification) => ({
                                ...notification,
                                read: true
                            })
                        );


                    saveUser();

                    renderNotifications();
                }
            );
    }


    /* =====================================================
       32. LOGOUT
    ===================================================== */

    if ($("logoutButton")) {

        $("logoutButton")
            .addEventListener(
                "click",
                () => {

                    openModal(
                        $("logoutModal")
                    );
                }
            );
    }


    if ($("cancelLogoutBtn")) {

        $("cancelLogoutBtn")
            .addEventListener(
                "click",
                () => {

                    closeModal(
                        $("logoutModal")
                    );
                }
            );
    }


    if ($("confirmLogoutBtn")) {

        $("confirmLogoutBtn")
            .addEventListener(
                "click",
                () => {

                    ReenStorage.clearCurrentUser();

                    window.location.href =
                        "./login.html";
                }
            );
    }


    /* =====================================================
       33. SIDEBAR
    ===================================================== */

    function openSidebar() {

        if ($("sidebar")) {
            $("sidebar").classList.remove(
                "-translate-x-full"
            );
        }

        if ($("sidebarOverlay")) {
            $("sidebarOverlay")
                .classList.remove(
                    "hidden"
                );
        }
    }


    function closeSidebar() {

        if ($("sidebar")) {
            $("sidebar").classList.add(
                "-translate-x-full"
            );
        }

        if ($("sidebarOverlay")) {
            $("sidebarOverlay")
                .classList.add(
                    "hidden"
                );
        }
    }


    if ($("mobileMenuButton")) {

        $("mobileMenuButton")
            .addEventListener(
                "click",
                openSidebar
            );
    }


    if ($("sidebarOverlay")) {

        $("sidebarOverlay")
            .addEventListener(
                "click",
                closeSidebar
            );
    }


    /* =====================================================
       34. NAVIGATION
    ===================================================== */

    const navigation = {

        overviewNav:
            "./overview.html",

        accountsNav:
            "./account.html",

        transactionsNav:
            "./transaction.html",

        profileNav:
            "./profile.html"
    };


    Object.entries(navigation)
        .forEach(
            ([id, url]) => {

                const element =
                    $(id);

                if (!element) {
                    return;
                }


                element.addEventListener(
                    "click",
                    () => {

                        window.location.href =
                            url;
                    }
                );
            }
        );


    /* =====================================================
       35. HEADER PROFILE BUTTON
    ===================================================== */

    if ($("headerProfileButton")) {

        $("headerProfileButton")
            .addEventListener(
                "click",
                () => {

                    window.location.href =
                        "./profile.html";
                }
            );
    }


    /* =====================================================
       36. SEARCH BUTTON
    ===================================================== */

    /* =====================================================
   SEARCH
   -----------------------------------------------------
   Searches the profile page content directly.
   It does NOT open a modal.
===================================================== */

if ($("searchButton")) {

    $("searchButton").addEventListener(
        "click",
        () => {

            const searchInput =
                $("profileSearchInput");

            if (!searchInput) {
                console.warn(
                    "profileSearchInput was not found in profile.html"
                );
                return;
            }

            searchInput.classList.remove(
                "hidden"
            );

            searchInput.focus();

            searchInput.select();
        }
    );
}


/* =====================================================
   PROFILE SEARCH INPUT
===================================================== */

if ($("profileSearchInput")) {

    $("profileSearchInput").addEventListener(
        "input",
        function () {

            const searchValue =
                this.value
                    .trim()
                    .toLowerCase();

            const searchableElements = [
                $("profileName"),
                $("profileEmail"),
                $("profilePhone"),
                $("profileGender"),
                $("profileTransactionsList")
            ];

            searchableElements.forEach(
                (element) => {

                    if (!element) {
                        return;
                    }

                    /*
                     * The main profile fields are
                     * handled together below.
                     */
                }
            );


            /* =========================================
               PROFILE INFORMATION SEARCH
            ========================================= */

            const profileFields = [
                $("profileName"),
                $("profileEmail"),
                $("profilePhone"),
                $("profileGender")
            ].filter(Boolean);


            profileFields.forEach(
                (element) => {

                    const wrapper =
                        element.closest(
                            "[data-search-item]"
                        );

                    if (!wrapper) {
                        return;
                    }

                    if (!searchValue) {

                        wrapper.classList.remove(
                            "hidden"
                        );

                        return;
                    }


                    const text =
                        element.textContent
                            .toLowerCase();


                    if (
                        text.includes(
                            searchValue
                        )
                    ) {

                        wrapper.classList.remove(
                            "hidden"
                        );

                    } else {

                        wrapper.classList.add(
                            "hidden"
                        );
                    }
                }
            );


            /* =========================================
               TRANSACTION SEARCH
            ========================================= */

            const transactionList =
                $("profileTransactionsList");

            if (
                transactionList &&
                searchValue
            ) {

                const transactionRows =
                    transactionList.children;


                let foundTransaction =
                    false;


                Array.from(
                    transactionRows
                ).forEach(
                    (row) => {

                        const text =
                            row.textContent
                                .toLowerCase();


                        if (
                            text.includes(
                                searchValue
                            )
                        ) {

                            row.classList.remove(
                                "hidden"
                            );

                            foundTransaction =
                                true;

                        } else {

                            row.classList.add(
                                "hidden"
                            );
                        }
                    }
                );


                const empty =
                    $("profileTransactionsEmpty");


                if (
                    empty &&
                    !foundTransaction
                ) {

                    empty.classList.remove(
                        "hidden"
                    );

                    empty.textContent =
                        "No matching transactions found.";

                } else if (empty) {

                    empty.classList.add(
                        "hidden"
                    );
                }

            } else if (transactionList) {

                Array.from(
                    transactionList.children
                ).forEach(
                    (row) => {

                        row.classList.remove(
                            "hidden"
                        );
                    }
                );


                const empty =
                    $("profileTransactionsEmpty");

                if (empty) {
                    empty.classList.add(
                        "hidden"
                    );
                }
            }
        }
    );
}


    /* =====================================================
       37. QUICK PHONE EDIT
    ===================================================== */

    if ($("editPhoneButton")) {

        $("editPhoneButton")
            .addEventListener(
                "click",
                () => {

                    openModal(
                        $("editProfileModal")
                    );

                    if ($("editPhoneNumber")) {
                        $("editPhoneNumber")
                            .focus();
                    }
                }
            );
    }


    /* =====================================================
       38. QUICK GENDER EDIT
    ===================================================== */

    if ($("editGenderButton")) {

        $("editGenderButton")
            .addEventListener(
                "click",
                () => {

                    openModal(
                        $("editProfileModal")
                    );

                    if ($("editGender")) {
                        $("editGender")
                            .focus();
                    }
                }
            );
    }


    /* =====================================================
       39. CLOSE BUTTONS
    ===================================================== */

    const closeButtons = {

        closeEditProfileModal:
            "editProfileModal",

        cancelEditProfile:
            "editProfileModal",

        closeEmailVerificationModal:
            "emailVerificationModal",

        closeResetPasswordModal:
            "resetPasswordModal",

        cancelResetPassword:
            "resetPasswordModal",

        closeTransactionDetails:
            "transactionDetailsModal",

        closeTransactionDetailsBottom:
            "transactionDetailsModal"
    };


    Object.entries(closeButtons)
        .forEach(
            ([buttonId, modalId]) => {

                const button =
                    $(buttonId);

                if (!button) {
                    return;
                }


                button.addEventListener(
                    "click",
                    () => {

                        closeModal(
                            $(modalId)
                        );
                    }
                );
            }
        );


    /* =====================================================
       40. CLICK OUTSIDE MODALS
    ===================================================== */

    [
        "editProfileModal",
        "profileImageModal",
        "emailVerificationModal",
        "resetPasswordModal",
        "profileSuccessModal",
        "logoutModal",
        "transactionDetailsModal"
    ].forEach(
        (modalId) => {

            const modal =
                $(modalId);

            if (!modal) {
                return;
            }


            modal.addEventListener(
                "click",
                (event) => {

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


    /* =====================================================
       41. OTP INPUT
    ===================================================== */

    if ($("emailOtpInput")) {

        $("emailOtpInput")
            .addEventListener(
                "input",
                () => {

                    $("emailOtpInput").value =
                        $("emailOtpInput")
                            .value
                            .replace(
                                /\D/g,
                                ""
                            )
                            .slice(0, 6);
                }
            );
    }


    /* =====================================================
       42. ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }


            closeAllModals();

            closeSidebar();


            if ($("notificationDropdown")) {

                $("notificationDropdown")
                    .classList.add(
                        "hidden"
                    );
            }
        }
    );


    /* =====================================================
       43. STORAGE SYNCHRONIZATION
    ===================================================== */

    window.addEventListener(
        "storage",
        (event) => {

            if (
                event.key !== USERS_KEY
            ) {
                return;
            }


            try {

                const latestUsers = ReenStorage.getUsers();


                let latestUser = null;


                if (currentUser.email) {

                    latestUser =
                        latestUsers.find(
                            (user) =>
                                user.email &&
                                String(
                                    user.email
                                ).toLowerCase() ===
                                String(
                                    currentUser.email
                                ).toLowerCase()
                        );
                }


                if (
                    !latestUser &&
                    currentUser.accountNumber
                ) {

                    latestUser =
                        latestUsers.find(
                            (user) =>
                                user.accountNumber &&
                                String(
                                    user.accountNumber
                                ) ===
                                String(
                                    currentUser.accountNumber
                                )
                        );
                }


                if (!latestUser) {
                    return;
                }


                /*
                 * Canonical user stays the source of truth.
                 * This restores the FULL registered name.
                 */

                currentUser = {
                    ...currentUser,
                    ...latestUser
                };


                users =
                    latestUsers;

                userIndex =
                    users.indexOf(
                        latestUser
                    );


                renderUserInformation();

                renderBalance();

                renderTransactions();

                renderNotifications();

            } catch (error) {

                console.error(
                    "Unable to synchronize profile:",
                    error
                );
            }
        }
    );


    /* =====================================================
       44. PAGE SHOW
       -----------------------------------------------------
       Important:
       reenUsers remains the canonical source of truth.
       This prevents an old sessionStorage name from
       replacing the complete registered name.
    ===================================================== */

    window.addEventListener(
        "pageshow",
        () => {

            try {

                const latestUsers = ReenStorage.getUsers();


                users =
                    latestUsers;


                let latestIndex =
                    users.findIndex(
                        (user) => {

                            if (
                                currentUser.email &&
                                user.email
                            ) {

                                return (
                                    String(
                                        user.email
                                    ).toLowerCase() ===
                                    String(
                                        currentUser.email
                                    ).toLowerCase()
                                );
                            }


                            if (
                                currentUser.accountNumber &&
                                user.accountNumber
                            ) {

                                return (
                                    String(
                                        user.accountNumber
                                    ) ===
                                    String(
                                        currentUser.accountNumber
                                    )
                                );
                            }


                            return false;
                        }
                    );


                if (
                    latestIndex !==
                    -1
                ) {

                    userIndex =
                        latestIndex;


                    /*
                     * CANONICAL USER LAST
                     *
                     * This is what ensures:
                     *
                     * Victor Adeoya
                     *
                     * stays:
                     *
                     * Victor Adeoya
                     *
                     * instead of becoming:
                     *
                     * Adeoya
                     */

                    currentUser = {
                        ...currentUser,
                        ...users[latestIndex]
                    };
                }


                renderUserInformation();

                renderBalance();

                renderTransactions();

                renderNotifications();


            } catch (error) {

                console.error(
                    "Unable to refresh profile:",
                    error
                );
            }
        }
    );


    /* =====================================================
       45. INITIAL RENDER
    ===================================================== */

    renderUserInformation();

    renderBalance();

    renderTransactions();

    renderNotifications();


    console.log(
        "REEN BANK PROFILE: Loaded successfully."
    );

});