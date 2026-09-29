/* =========================================================
   REEN BANK — PROFILE PAGE JAVASCRIPT
   =========================================================

   STORAGE
   ---------------------------------------------------------
   localStorage:
       reenUsers
       currentUser (legacy compatibility)

   sessionStorage:
       currentUser
       pendingEmailChange

   FEATURES
   ---------------------------------------------------------
   ✓ Load current user
   ✓ Profile information
   ✓ Phone number
   ✓ Gender
   ✓ Change name
   ✓ Change email
   ✓ Email verification OTP
   ✓ OTP expiration
   ✓ OTP resend
   ✓ Profile picture
   ✓ Balance
   ✓ Balance visibility
   ✓ Account number copy
   ✓ Recent transactions
   ✓ Transaction search
   ✓ Reset password
   ✓ Logout confirmation
   ✓ Notifications
   ✓ Mobile sidebar
   ✓ Modal system
   ✓ No alert()
========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =====================================================
           1. STORAGE
        ===================================================== */

        let users =
            JSON.parse(
                localStorage.getItem(
                    "reenUsers"
                )
            ) || [];


        let sessionUser = null;


        /*
            Try sessionStorage first.
        */

        try {

            sessionUser =
                JSON.parse(
                    sessionStorage.getItem(
                        "currentUser"
                    )
                );

        } catch (error) {

            sessionUser = null;

        }


        /*
            Compatibility with older version.
        */

        if (!sessionUser) {

            try {

                sessionUser =
                    JSON.parse(
                        localStorage.getItem(
                            "currentUser"
                        )
                    );

            } catch (error) {

                sessionUser = null;

            }

        }


        /*
            User is not logged in.
        */

        if (!sessionUser) {

            window.location.href =
                "./login.html";

            return;

        }



        /* =====================================================
           2. FIND COMPLETE USER
        ===================================================== */

        let currentUser = null;


        /*
            Find using email.
        */

        if (sessionUser.email) {

            currentUser =
                users.find(
                    user =>
                        String(
                            user.email || ""
                        )
                        .toLowerCase()
                        ===
                        String(
                            sessionUser.email || ""
                        )
                        .toLowerCase()
                );

        }


        /*
            Fallback using name.
        */

        if (
            !currentUser &&
            sessionUser.name
        ) {

            currentUser =
                users.find(
                    user =>
                        String(
                            user.name || ""
                        )
                        .toLowerCase()
                        ===
                        String(
                            sessionUser.name || ""
                        )
                        .toLowerCase()
                );

        }


        /*
            Final fallback.
        */

        if (!currentUser) {

            currentUser = {
                ...sessionUser
            };

        }



        /* =====================================================
           3. NORMALIZE USER
        ===================================================== */

        currentUser.name =
            currentUser.name ||
            "Reen Bank User";


        currentUser.email =
            currentUser.email ||
            "";


        currentUser.phone =
            currentUser.phone ||
            currentUser.phoneNumber ||
            "";


        currentUser.phoneNumber =
            currentUser.phoneNumber ||
            currentUser.phone ||
            "";


        currentUser.gender =
            currentUser.gender ||
            "";


        currentUser.accountNumber =
            currentUser.accountNumber ||
            "";


        currentUser.balance =
            Number(
                currentUser.balance
            ) || 0;


        currentUser.transactions =
            Array.isArray(
                currentUser.transactions
            )
                ? currentUser.transactions
                : [];


        currentUser.profileImage =
            currentUser.profileImage ||
            currentUser.profilePicture ||
            currentUser.avatar ||
            "";


        /*
            Email verification compatibility.
        */

        if (
            typeof currentUser.emailVerified
            !== "boolean"
        ) {

            currentUser.emailVerified =
                Boolean(
                    currentUser.verified
                );

        }



        /* =====================================================
           4. ELEMENTS
        ===================================================== */

        const profileName =
            document.getElementById(
                "profileName"
            );


        const profileEmail =
            document.getElementById(
                "profileEmail"
            );


        const profilePhone =
            document.getElementById(
                "profilePhone"
            );


        const profileGender =
            document.getElementById(
                "profileGender"
            );


        const profileBalance =
            document.getElementById(
                "profileBalance"
            );


        const profileImage =
            document.getElementById(
                "profileImage"
            );


        const profileInitials =
            document.getElementById(
                "profileInitials"
            );


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


        const profileTransactionList =
            document.getElementById(
                "profileTransactionList"
            );


        const transactionEmptyState =
            document.getElementById(
                "transactionEmptyState"
            );


        const transactionSearch =
            document.getElementById(
                "transactionSearch"
            );


        const searchResults =
            document.getElementById(
                "searchResults"
            );


        const balanceToggle =
            document.getElementById(
                "balanceToggle"
            );


        const balanceToggleIcon =
            document.getElementById(
                "balanceToggleIcon"
            );


        const notificationButton =
            document.getElementById(
                "notificationButton"
            );


        const notificationDot =
            document.getElementById(
                "notificationDot"
            );


        const editProfileImageButton =
            document.getElementById(
                "editProfileImageButton"
            );


        const profileImageInput =
            document.getElementById(
                "profileImageInput"
            );


        const profileImagePreview =
            document.getElementById(
                "profileImagePreview"
            );


        const profileImagePreviewInitials =
            document.getElementById(
                "profileImagePreviewInitials"
            );


        const profileImageFileName =
            document.getElementById(
                "profileImageFileName"
            );


        const resetPasswordButton =
            document.getElementById(
                "resetPasswordButton"
            );


        const resetPasswordForm =
            document.getElementById(
                "resetPasswordForm"
            );


        const passwordFormError =
            document.getElementById(
                "passwordFormError"
            );


        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        const confirmLogoutButton =
            document.getElementById(
                "confirmLogoutButton"
            );


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



        /* =====================================================
           5. EDIT PROFILE ELEMENTS
        ===================================================== */

        const editProfileButton =
            document.getElementById(
                "editProfileButton"
            );


        const editProfileForm =
            document.getElementById(
                "editProfileForm"
            );


        const editProfileName =
            document.getElementById(
                "editProfileName"
            );


        const editProfileEmail =
            document.getElementById(
                "editProfileEmail"
            );


        const editProfilePhone =
            document.getElementById(
                "editProfilePhone"
            );


        const editProfileGender =
            document.getElementById(
                "editProfileGender"
            );


        const editProfileError =
            document.getElementById(
                "editProfileError"
            );


        const emailChangeHint =
            document.getElementById(
                "emailChangeHint"
            );


        const currentEmailVerifiedBadge =
            document.getElementById(
                "currentEmailVerifiedBadge"
            );


        const emailVerifiedStatus =
            document.getElementById(
                "emailVerifiedStatus"
            );



        /* =====================================================
           6. EMAIL VERIFICATION ELEMENTS
        ===================================================== */

        const emailVerificationForm =
            document.getElementById(
                "emailVerificationForm"
            );


        const emailVerificationCode =
            document.getElementById(
                "emailVerificationCode"
            );


        const verificationEmailAddress =
            document.getElementById(
                "verificationEmailAddress"
            );


        const emailVerificationError =
            document.getElementById(
                "emailVerificationError"
            );


        const resendEmailVerificationButton =
            document.getElementById(
                "resendEmailVerificationButton"
            );



        /* =====================================================
           7. FEEDBACK ELEMENTS
        ===================================================== */

        const feedbackCloseButton =
            document.getElementById(
                "feedbackCloseButton"
            );


        const feedbackTitle =
            document.getElementById(
                "feedbackTitle"
            );


        const feedbackMessage =
            document.getElementById(
                "feedbackMessage"
            );


        const feedbackIcon =
            document.getElementById(
                "feedbackIcon"
            );


        const copiedAccountNumber =
            document.getElementById(
                "copiedAccountNumber"
            );



        /* =====================================================
           8. MODAL FUNCTIONS
        ===================================================== */

        function openModal(
            modalId
        ) {

            const modal =
                document.getElementById(
                    modalId
                );


            if (!modal) {
                return;
            }


            modal.classList.remove(
                "hidden"
            );


            modal.classList.add(
                "flex"
            );


            document.body.classList.add(
                "overflow-hidden"
            );

        }



        function closeModal(
            modalId
        ) {

            const modal =
                document.getElementById(
                    modalId
                );


            if (!modal) {
                return;
            }


            modal.classList.add(
                "hidden"
            );


            modal.classList.remove(
                "flex"
            );


            const visibleModal =
                document.querySelector(
                    '[id$="Modal"]:not(.hidden)'
                );


            if (!visibleModal) {

                document.body.classList.remove(
                    "overflow-hidden"
                );

            }

        }



        /* =====================================================
           9. FEEDBACK MODAL
        ===================================================== */

        function showFeedback(
            title,
            message,
            type = "success"
        ) {

            if (
                !feedbackTitle ||
                !feedbackMessage ||
                !feedbackIcon
            ) {
                return;
            }


            feedbackTitle.textContent =
                title;


            feedbackMessage.textContent =
                message;


            if (
                type === "error"
            ) {

                feedbackIcon.className =
                    "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0f2] text-[#ef5368]";


                feedbackIcon.innerHTML =
                    '<i class="fa-solid fa-xmark"></i>';

            } else {

                feedbackIcon.className =
                    "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e3f7f0] text-[#2db88a]";


                feedbackIcon.innerHTML =
                    '<i class="fa-solid fa-check"></i>';

            }


            openModal(
                "feedbackModal"
            );

        }


        if (
            feedbackCloseButton
        ) {

            feedbackCloseButton.addEventListener(
                "click",
                () => {

                    closeModal(
                        "feedbackModal"
                    );

                }
            );

        }



        /* =====================================================
           10. INITIALS
        ===================================================== */

        function getInitials(
            name
        ) {

            if (!name) {
                return "RB";
            }


            const parts =
                String(name)
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean);


            if (
                parts.length === 1
            ) {

                return parts[0]
                    .substring(0, 2)
                    .toUpperCase();

            }


            return (
                parts[0][0] +
                parts[
                    parts.length - 1
                ][0]
            ).toUpperCase();

        }


        /* =====================================================
           11. CURRENCY
        ===================================================== */

        function formatCurrency(
            amount
        ) {

            const number =
                Number(amount) || 0;


            return (
                "₦ " +
                number.toLocaleString(
                    "en-NG",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )
            );

        }



        /* =====================================================
           12. DATE
        ===================================================== */

        function formatTransactionDate(
            transaction
        ) {

            const rawDate =
                transaction.date ||
                transaction.createdAt ||
                transaction.timestamp ||
                transaction.time;


            if (!rawDate) {

                return "Date unavailable";

            }


            const date =
                new Date(
                    rawDate
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return String(
                    rawDate
                );

            }


            const day =
                String(
                    date.getDate()
                ).padStart(
                    2,
                    "0"
                );


            const month =
                date.toLocaleString(
                    "en-GB",
                    {
                        month: "short"
                    }
                );


            const year =
                date.getFullYear();


            const hours =
                String(
                    date.getHours()
                ).padStart(
                    2,
                    "0"
                );


            const minutes =
                String(
                    date.getMinutes()
                ).padStart(
                    2,
                    "0"
                );


            return (
                `${day}.${month}.${year} - ${hours}:${minutes}`
            );

        }



        /* =====================================================
           13. TRANSACTION TYPE
        ===================================================== */

        function isCreditTransaction(
            transaction
        ) {

            const direction =
                String(
                    transaction.direction ||
                    ""
                ).toLowerCase();


            const type =
                String(
                    transaction.type ||
                    transaction.transactionType ||
                    ""
                ).toLowerCase();


            const category =
                String(
                    transaction.category ||
                    ""
                ).toLowerCase();


            if (
                direction === "credit" ||
                direction === "income"
            ) {

                return true;

            }


            if (
                type === "income" ||
                type === "deposit" ||
                type === "credit" ||
                type === "funding"
            ) {

                return true;

            }


            if (
                category === "deposit" ||
                category === "income" ||
                category === "funding"
            ) {

                return true;

            }


            if (
                direction === "debit" ||
                direction === "expense"
            ) {

                return false;

            }


            if (
                type === "expense" ||
                type === "withdrawal" ||
                type === "debit"
            ) {

                return false;

            }


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            return amount >= 0;

        }



        /* =====================================================
           14. TRANSACTION NAME
        ===================================================== */

        function getTransactionName(
            transaction
        ) {

            return (
                transaction.description ||
                transaction.name ||
                transaction.title ||
                transaction.accountName ||
                transaction.recipient ||
                transaction.sender ||
                "Transaction"
            );

        }



        /* =====================================================
           15. TRANSACTION AMOUNT
        ===================================================== */

        function getTransactionAmount(
            transaction
        ) {

            return Math.abs(
                Number(
                    transaction.amount ||
                    transaction.value ||
                    0
                )
            );

        }



        /* =====================================================
           16. HTML ESCAPE
        ===================================================== */

        function escapeHTML(
            value
        ) {

            return String(
                value
            )
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        }



        /* =====================================================
           17. RENDER PROFILE
        ===================================================== */

        function renderProfile() {

            if (profileName) {

                profileName.textContent =
                    currentUser.name;

            }


            if (profileEmail) {

                profileEmail.textContent =
                    currentUser.email ||
                    "Not provided";

            }


            if (profilePhone) {

                profilePhone.textContent =
                    currentUser.phone ||
                    currentUser.phoneNumber ||
                    "Not provided";

            }


            if (profileGender) {

                profileGender.textContent =
                    currentUser.gender ||
                    "Not provided";

            }


            if (headerUserName) {

                headerUserName.textContent =
                    currentUser.name;

            }


            if (headerAccountNumber) {

                headerAccountNumber.textContent =
                    currentUser.accountNumber ||
                    "0000000000";

            }


            renderEmailVerificationStatus();

            renderProfileImages();

            renderBalance();

            renderTransactions(
                currentUser.transactions
            );

        }



        /* =====================================================
           18. EMAIL VERIFIED STATUS
        ===================================================== */

        function renderEmailVerificationStatus() {

            const verified =
                Boolean(
                    currentUser.emailVerified ||
                    currentUser.verified
                );


            if (
                emailVerifiedStatus
            ) {

                if (verified) {

                    emailVerifiedStatus.classList.remove(
                        "hidden"
                    );

                    emailVerifiedStatus.classList.add(
                        "flex"
                    );

                } else {

                    emailVerifiedStatus.classList.add(
                        "hidden"
                    );

                    emailVerifiedStatus.classList.remove(
                        "flex"
                    );

                }

            }


            if (
                currentEmailVerifiedBadge
            ) {

                if (verified) {

                    currentEmailVerifiedBadge.classList.remove(
                        "hidden"
                    );

                } else {

                    currentEmailVerifiedBadge.classList.add(
                        "hidden"
                    );

                }

            }

        }



        /* =====================================================
           19. PROFILE IMAGES
        ===================================================== */

        function renderProfileImages() {

            const initials =
                getInitials(
                    currentUser.name
                );


            const image =
                currentUser.profileImage;


            /*
                Main image
            */

            if (
                image &&
                profileImage
            ) {

                profileImage.src =
                    image;

                profileImage.classList.remove(
                    "hidden"
                );


                if (
                    profileInitials
                ) {

                    profileInitials.classList.add(
                        "hidden"
                    );

                }

            } else {

                if (
                    profileImage
                ) {

                    profileImage.classList.add(
                        "hidden"
                    );

                }


                if (
                    profileInitials
                ) {

                    profileInitials.textContent =
                        initials;

                    profileInitials.classList.remove(
                        "hidden"
                    );

                }

            }



            /*
                Header image
            */

            if (
                image &&
                headerProfileImage
            ) {

                headerProfileImage.src =
                    image;

                headerProfileImage.classList.remove(
                    "hidden"
                );


                if (
                    headerProfileInitials
                ) {

                    headerProfileInitials.classList.add(
                        "hidden"
                    );

                }

            } else {

                if (
                    headerProfileImage
                ) {

                    headerProfileImage.classList.add(
                        "hidden"
                    );

                }


                if (
                    headerProfileInitials
                ) {

                    headerProfileInitials.textContent =
                        initials;

                    headerProfileInitials.classList.remove(
                        "hidden"
                    );

                }

            }



            /*
                Modal preview
            */

            if (
                image &&
                profileImagePreview
            ) {

                profileImagePreview.src =
                    image;

                profileImagePreview.classList.remove(
                    "hidden"
                );


                if (
                    profileImagePreviewInitials
                ) {

                    profileImagePreviewInitials.classList.add(
                        "hidden"
                    );

                }

            } else {

                if (
                    profileImagePreview
                ) {

                    profileImagePreview.classList.add(
                        "hidden"
                    );

                }


                if (
                    profileImagePreviewInitials
                ) {

                    profileImagePreviewInitials.textContent =
                        initials;

                    profileImagePreviewInitials.classList.remove(
                        "hidden"
                    );

                }

            }

        }



        /* =====================================================
           20. BALANCE
        ===================================================== */

        let balanceVisible =
            true;


        function renderBalance() {

            if (
                !profileBalance
            ) {
                return;
            }


            if (
                balanceVisible
            ) {

                profileBalance.textContent =
                    formatCurrency(
                        currentUser.balance
                    );


                if (
                    balanceToggleIcon
                ) {

                    balanceToggleIcon.className =
                        "fa-regular fa-eye-slash text-[17px]";

                }


                if (
                    balanceToggle
                ) {

                    balanceToggle.title =
                        "Hide balance";

                }

            } else {

                profileBalance.textContent =
                    "₦ ••••••";


                if (
                    balanceToggleIcon
                ) {

                    balanceToggleIcon.className =
                        "fa-regular fa-eye text-[17px]";

                }


                if (
                    balanceToggle
                ) {

                    balanceToggle.title =
                        "Show balance";

                }

            }

        }


        if (
            balanceToggle
        ) {

            balanceToggle.addEventListener(
                "click",
                () => {

                    balanceVisible =
                        !balanceVisible;

                    renderBalance();

                }
            );

        }



        /* =====================================================
           21. TRANSACTIONS
        ===================================================== */

        function renderTransactions(
            transactions
        ) {

            if (
                !profileTransactionList
            ) {
                return;
            }


            profileTransactionList.innerHTML =
                "";


            if (
                !Array.isArray(
                    transactions
                ) ||
                transactions.length === 0
            ) {

                profileTransactionList.classList.add(
                    "hidden"
                );


                if (
                    transactionEmptyState
                ) {

                    transactionEmptyState.classList.remove(
                        "hidden"
                    );

                }

                return;

            }


            profileTransactionList.classList.remove(
                "hidden"
            );


            if (
                transactionEmptyState
            ) {

                transactionEmptyState.classList.add(
                    "hidden"
                );

            }


            const sortedTransactions =
                [...transactions]
                    .sort(
                        (
                            a,
                            b
                        ) => {

                            const dateA =
                                new Date(
                                    a.createdAt ||
                                    a.date ||
                                    a.timestamp ||
                                    0
                                ).getTime();


                            const dateB =
                                new Date(
                                    b.createdAt ||
                                    b.date ||
                                    b.timestamp ||
                                    0
                                ).getTime();


                            return (
                                dateB -
                                dateA
                            );

                        }
                    )
                    .slice(
                        0,
                        7
                    );


            sortedTransactions.forEach(
                transaction => {


                    const credit =
                        isCreditTransaction(
                            transaction
                        );


                    const amount =
                        getTransactionAmount(
                            transaction
                        );


                    const name =
                        getTransactionName(
                            transaction
                        );


                    const date =
                        formatTransactionDate(
                            transaction
                        );


                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "flex min-h-[43px] items-center justify-between gap-2 py-[7px]";


                    row.dataset.search =
                        `${name} ${date} ${amount}`
                            .toLowerCase();


                    row.innerHTML = `

                        <div
                            class="min-w-0 flex-1"
                        >

                            <p
                                class="truncate text-[11px] font-medium text-[#777]"
                                title="${escapeHTML(name)}"
                            >
                                ${escapeHTML(name)}
                            </p>

                        </div>


                        <p
                            class="w-[112px] shrink-0 text-[10px] text-[#858585]"
                        >
                            ${escapeHTML(date)}
                        </p>


                        <p
                            class="w-[78px] shrink-0 text-right text-[11px] font-medium ${
                                credit
                                    ? "text-[#1cb782]"
                                    : "text-[#f15467]"
                            }"
                        >
                            ${credit ? "+" : "-"}${formatCurrency(amount)}
                        </p>

                    `;


                    profileTransactionList.appendChild(
                        row
                    );

                }
            );

        }



        /* =====================================================
           22. SEARCH
        ===================================================== */

        if (
            transactionSearch
        ) {

            transactionSearch.addEventListener(
                "input",
                event => {

                    const query =
                        event.target.value
                            .trim()
                            .toLowerCase();


                    const rows =
                        profileTransactionList
                            ?.querySelectorAll(
                                "[data-search]"
                            );


                    if (
                        !query
                    ) {

                        rows?.forEach(
                            row =>
                                row.classList.remove(
                                    "hidden"
                                )
                        );


                        searchResults?.classList.add(
                            "hidden"
                        );


                        return;

                    }


                    let matches =
                        0;


                    rows?.forEach(
                        row => {

                            const text =
                                row.dataset.search ||
                                "";


                            if (
                                text.includes(
                                    query
                                )
                            ) {

                                row.classList.remove(
                                    "hidden"
                                );

                                matches++;

                            } else {

                                row.classList.add(
                                    "hidden"
                                );

                            }

                        }
                    );


                    if (
                        searchResults
                    ) {

                        searchResults.innerHTML = `

                            <div class="px-4 py-3">

                                <p class="text-[11px] font-semibold text-[#333]">
                                    ${matches}
                                    ${
                                        matches === 1
                                            ? "transaction"
                                            : "transactions"
                                    }
                                    found
                                </p>

                            </div>

                        `;


                        searchResults.classList.remove(
                            "hidden"
                        );

                    }

                }
            );

        }



        /* =====================================================
           23. CLOSE SEARCH
        ===================================================== */

        document.addEventListener(
            "click",
            event => {

                if (
                    searchResults &&
                    transactionSearch &&
                    !transactionSearch.contains(
                        event.target
                    ) &&
                    !searchResults.contains(
                        event.target
                    )
                ) {

                    searchResults.classList.add(
                        "hidden"
                    );

                }

            }
        );



        /* =====================================================
           24. COPY ACCOUNT NUMBER
        ===================================================== */

        if (
            headerAccountNumber
        ) {

            headerAccountNumber.addEventListener(
                "click",
                async () => {

                    const accountNumber =
                        currentUser.accountNumber;


                    if (
                        !accountNumber
                    ) {

                        showFeedback(
                            "Account Number",
                            "Your account number is not available yet.",
                            "error"
                        );

                        return;

                    }


                    try {

                        await navigator.clipboard.writeText(
                            String(
                                accountNumber
                            )
                        );

                    } catch (error) {

                        const textarea =
                            document.createElement(
                                "textarea"
                            );


                        textarea.value =
                            String(
                                accountNumber
                            );


                        document.body.appendChild(
                            textarea
                        );


                        textarea.select();


                        document.execCommand(
                            "copy"
                        );


                        textarea.remove();

                    }


                    if (
                        copiedAccountNumber
                    ) {

                        copiedAccountNumber.textContent =
                            accountNumber;

                    }


                    openModal(
                        "copyAccountModal"
                    );

                }
            );

        }



        /* =====================================================
           25. PROFILE IMAGE MODAL
        ===================================================== */

        if (
            editProfileImageButton
        ) {

            editProfileImageButton.addEventListener(
                "click",
                () => {

                    if (
                        profileImageInput
                    ) {

                        profileImageInput.value =
                            "";

                    }


                    if (
                        profileImageFileName
                    ) {

                        profileImageFileName.textContent =
                            "Choose image";

                    }


                    renderProfileImages();


                    openModal(
                        "profileImageModal"
                    );

                }
            );

        }



        /* =====================================================
           26. IMAGE PREVIEW
        ===================================================== */

        if (
            profileImageInput
        ) {

            profileImageInput.addEventListener(
                "change",
                event => {

                    const file =
                        event.target.files?.[0];


                    if (
                        !file
                    ) {
                        return;
                    }


                    if (
                        file.size >
                        5 *
                        1024 *
                        1024
                    ) {

                        profileImageInput.value =
                            "";


                        showFeedback(
                            "Image Too Large",
                            "Please choose an image smaller than 5 MB.",
                            "error"
                        );


                        return;

                    }


                    if (
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {

                        profileImageInput.value =
                            "";


                        showFeedback(
                            "Invalid Image",
                            "Please choose a JPG, PNG, or WEBP image.",
                            "error"
                        );


                        return;

                    }


                    if (
                        profileImageFileName
                    ) {

                        profileImageFileName.textContent =
                            file.name;

                    }


                    const reader =
                        new FileReader();


                    reader.onload =
                        event => {

                            if (
                                profileImagePreview
                            ) {

                                profileImagePreview.src =
                                    event.target.result;


                                profileImagePreview.classList.remove(
                                    "hidden"
                                );

                            }


                            if (
                                profileImagePreviewInitials
                            ) {

                                profileImagePreviewInitials.classList.add(
                                    "hidden"
                                );

                            }

                        };


                    reader.readAsDataURL(
                        file
                    );

                }
            );

        }



        /* =====================================================
           27. SAVE PROFILE IMAGE
        ===================================================== */

        const profileImageForm =
            document.getElementById(
                "profileImageForm"
            );


        if (
            profileImageForm
        ) {

            profileImageForm.addEventListener(
                "submit",
                event => {

                    event.preventDefault();


                    const file =
                        profileImageInput
                            ?.files?.[0];


                    if (
                        !file
                    ) {

                        showFeedback(
                            "Choose an Image",
                            "Please select a profile picture before saving.",
                            "error"
                        );


                        return;

                    }


                    const reader =
                        new FileReader();


                    reader.onload =
                        event => {

                            currentUser.profileImage =
                                event.target.result;


                            saveCurrentUser();


                            renderProfileImages();


                            closeModal(
                                "profileImageModal"
                            );


                            showFeedback(
                                "Profile Picture Updated",
                                "Your profile picture has been updated successfully."
                            );

                        };


                    reader.readAsDataURL(
                        file
                    );

                }
            );

        }



        /* =====================================================
           28. OPEN EDIT PROFILE
        ===================================================== */

        if (
            editProfileButton
        ) {

            editProfileButton.addEventListener(
                "click",
                () => {

                    if (
                        editProfileName
                    ) {

                        editProfileName.value =
                            currentUser.name ||
                            "";

                    }


                    if (
                        editProfileEmail
                    ) {

                        editProfileEmail.value =
                            currentUser.email ||
                            "";

                    }


                    if (
                        editProfilePhone
                    ) {

                        editProfilePhone.value =
                            currentUser.phone ||
                            currentUser.phoneNumber ||
                            "";

                    }


                    if (
                        editProfileGender
                    ) {

                        editProfileGender.value =
                            currentUser.gender ||
                            "";

                    }


                    editProfileError?.classList.add(
                        "hidden"
                    );


                    emailChangeHint?.classList.add(
                        "hidden"
                    );


                    openModal(
                        "editProfileModal"
                    );

                }
            );

        }



        /* =====================================================
           29. EMAIL CHANGE HINT
        ===================================================== */

        if (
            editProfileEmail
        ) {

            editProfileEmail.addEventListener(
                "input",
                () => {

                    const oldEmail =
                        String(
                            currentUser.email ||
                            ""
                        )
                            .trim()
                            .toLowerCase();


                    const newEmail =
                        String(
                            editProfileEmail.value ||
                            ""
                        )
                            .trim()
                            .toLowerCase();


                    if (
                        newEmail &&
                        newEmail !== oldEmail
                    ) {

                        emailChangeHint?.classList.remove(
                            "hidden"
                        );

                    } else {

                        emailChangeHint?.classList.add(
                            "hidden"
                        );

                    }

                }
            );

        }



        /* =====================================================
           30. SAVE PROFILE
        ===================================================== */

        if (
            editProfileForm
        ) {

            editProfileForm.addEventListener(
                "submit",
                event => {

                    event.preventDefault();


                    editProfileError?.classList.add(
                        "hidden"
                    );


                    const newName =
                        editProfileName.value
                            .trim();


                    const newEmail =
                        editProfileEmail.value
                            .trim()
                            .toLowerCase();


                    const newPhone =
                        editProfilePhone.value
                            .trim();


                    const newGender =
                        editProfileGender.value;


                    /*
                        Name
                    */

                    if (
                        !newName
                    ) {

                        showEditProfileError(
                            "Please enter your full name."
                        );

                        return;

                    }


                    /*
                        Email
                    */

                    if (
                        !newEmail
                    ) {

                        showEditProfileError(
                            "Please enter your email address."
                        );

                        return;

                    }


                    const emailPattern =
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                    if (
                        !emailPattern.test(
                            newEmail
                        )
                    ) {

                        showEditProfileError(
                            "Please enter a valid email address."
                        );

                        return;

                    }


                    /*
                        Old email
                    */

                    const oldEmail =
                        String(
                            currentUser.email ||
                            ""
                        )
                            .trim()
                            .toLowerCase();


                    const emailChanged =
                        newEmail !==
                        oldEmail;


                    /*
                        Check duplicate
                    */

                    if (
                        emailChanged
                    ) {

                        const duplicate =
                            users.some(
                                user => {

                                    const userEmail =
                                        String(
                                            user.email ||
                                            ""
                                        )
                                            .trim()
                                            .toLowerCase();


                                    return (
                                        userEmail ===
                                        newEmail
                                    );

                                }
                            );


                        if (
                            duplicate
                        ) {

                            showEditProfileError(
                                "This email address is already registered to another Reen Bank account."
                            );

                            return;

                        }

                    }


                    /*
                        Always save these.
                    */

                    currentUser.name =
                        newName;


                    currentUser.phone =
                        newPhone;


                    currentUser.phoneNumber =
                        newPhone;


                    currentUser.gender =
                        newGender;


                    /*
                        Email changed?
                    */

                    if (
                        emailChanged
                    ) {

                        /*
                            Save phone/gender/name first,
                            but don't change email.
                        */

                        saveCurrentUser();


                        startEmailVerification(
                            newEmail
                        );


                        return;

                    }


                    /*
                        No email change.
                    */

                    saveCurrentUser();


                    renderProfile();


                    closeModal(
                        "editProfileModal"
                    );


                    showFeedback(
                        "Profile Updated",
                        "Your profile information has been updated successfully."
                    );

                }
            );

        }



        /* =====================================================
           31. PROFILE ERROR
        ===================================================== */

        function showEditProfileError(
            message
        ) {

            if (
                !editProfileError
            ) {
                return;
            }


            editProfileError.textContent =
                message;


            editProfileError.classList.remove(
                "hidden"
            );

        }



        /* =====================================================
           32. EMAIL VERIFICATION STATE
        ===================================================== */

        let pendingEmailChange =
            null;


        /*
            Recover pending request.
        */

        try {

            const savedPending =
                sessionStorage.getItem(
                    "pendingEmailChange"
                );


            if (
                savedPending
            ) {

                pendingEmailChange =
                    JSON.parse(
                        savedPending
                    );

            }

        } catch (error) {

            pendingEmailChange =
                null;

        }



        /* =====================================================
           33. GENERATE OTP
        ===================================================== */

        function generateEmailOTP() {

            return String(
                Math.floor(
                    100000 +
                    Math.random() *
                    900000
                )
            );

        }



        /* =====================================================
           34. START EMAIL VERIFICATION
        ===================================================== */

        function startEmailVerification(
            newEmail
        ) {

            const code =
                generateEmailOTP();


            pendingEmailChange = {

                email:
                    newEmail,

                code:
                    code,

                expiresAt:
                    Date.now() +
                    (
                        10 *
                        60 *
                        1000
                    )

            };


            sessionStorage.setItem(
                "pendingEmailChange",
                JSON.stringify(
                    pendingEmailChange
                )
            );


            if (
                verificationEmailAddress
            ) {

                verificationEmailAddress.textContent =
                    newEmail;

            }


            if (
                emailVerificationCode
            ) {

                emailVerificationCode.value =
                    "";

            }


            emailVerificationError?.classList.add(
                "hidden"
            );


            closeModal(
                "editProfileModal"
            );


            openModal(
                "emailVerificationModal"
            );


            /*
                DEVELOPMENT ONLY.

                Replace this with your backend/email
                provider when deploying a real application.
            */

            console.log(
                "REEN BANK EMAIL VERIFICATION CODE:",
                code
            );

        }



        /* =====================================================
           35. VERIFY EMAIL
        ===================================================== */

        if (
            emailVerificationForm
        ) {

            emailVerificationForm.addEventListener(
                "submit",
                event => {

                    event.preventDefault();


                    emailVerificationError?.classList.add(
                        "hidden"
                    );


                    const enteredCode =
                        emailVerificationCode.value
                            .trim();


                    /*
                        Reload pending request if needed.
                    */

                    if (
                        !pendingEmailChange
                    ) {

                        try {

                            const savedPending =
                                sessionStorage.getItem(
                                    "pendingEmailChange"
                                );


                            if (
                                savedPending
                            ) {

                                pendingEmailChange =
                                    JSON.parse(
                                        savedPending
                                    );

                            }

                        } catch (error) {

                            pendingEmailChange =
                                null;

                        }

                    }


                    /*
                        No request
                    */

                    if (
                        !pendingEmailChange
                    ) {

                        showEmailVerificationError(
                            "Your verification session has expired. Please start the email change again."
                        );

                        return;

                    }


                    /*
                        Expired
                    */

                    if (
                        Date.now() >
                        Number(
                            pendingEmailChange.expiresAt
                        )
                    ) {

                        showEmailVerificationError(
                            "This verification code has expired. Please request a new code."
                        );

                        return;

                    }


                    /*
                        Invalid code
                    */

                    if (
                        enteredCode !==
                        String(
                            pendingEmailChange.code
                        )
                    ) {

                        showEmailVerificationError(
                            "Invalid verification code. Please check the code and try again."
                        );

                        return;

                    }


                    /*
                        VERIFIED
                    */

                    const newEmail =
                        pendingEmailChange.email;


                    /*
                        Change email ONLY after
                        successful verification.
                    */

                    currentUser.email =
                        newEmail;


                    currentUser.verified =
                        true;


                    currentUser.emailVerified =
                        true;


                    currentUser.emailVerifiedAt =
                        new Date()
                            .toISOString();


                    /*
                        Save.
                    */

                    saveCurrentUser();


                    /*
                        Clear verification.
                    */

                    pendingEmailChange =
                        null;


                    sessionStorage.removeItem(
                        "pendingEmailChange"
                    );


                    /*
                        Refresh UI.
                    */

                    renderProfile();


                    closeModal(
                        "emailVerificationModal"
                    );


                    showFeedback(
                        "Email Verified",
                        `Your email has been successfully changed to ${newEmail}.`
                    );

                }
            );

        }



        /* =====================================================
           36. EMAIL VERIFICATION ERROR
        ===================================================== */

        function showEmailVerificationError(
            message
        ) {

            if (
                !emailVerificationError
            ) {
                return;
            }


            emailVerificationError.textContent =
                message;


            emailVerificationError.classList.remove(
                "hidden"
            );

        }



        /* =====================================================
           37. RESEND OTP
        ===================================================== */

        if (
            resendEmailVerificationButton
        ) {

            resendEmailVerificationButton.addEventListener(
                "click",
                () => {

                    if (
                        !pendingEmailChange
                    ) {

                        showEmailVerificationError(
                            "There is no active email verification request."
                        );

                        return;

                    }


                    const newCode =
                        generateEmailOTP();


                    pendingEmailChange.code =
                        newCode;


                    pendingEmailChange.expiresAt =
                        Date.now() +
                        (
                            10 *
                            60 *
                            1000
                        );


                    sessionStorage.setItem(
                        "pendingEmailChange",
                        JSON.stringify(
                            pendingEmailChange
                        )
                    );


                    if (
                        emailVerificationCode
                    ) {

                        emailVerificationCode.value =
                            "";

                    }


                    emailVerificationError?.classList.add(
                        "hidden"
                    );


                    /*
                        Development only.
                    */

                    console.log(
                        "REEN BANK NEW EMAIL VERIFICATION CODE:",
                        newCode
                    );


                    showFeedback(
                        "Verification Code Resent",
                        "A new verification code has been generated."
                    );

                }
            );

        }



        /* =====================================================
           38. OTP INPUT
        ===================================================== */

        if (
            emailVerificationCode
        ) {

            emailVerificationCode.addEventListener(
                "input",
                () => {

                    emailVerificationCode.value =
                        emailVerificationCode.value
                            .replace(
                                /\D/g,
                                ""
                            )
                            .slice(
                                0,
                                6
                            );

                }
            );

        }



        /* =====================================================
           39. RESET PASSWORD
        ===================================================== */

        if (
            resetPasswordButton
        ) {

            resetPasswordButton.addEventListener(
                "click",
                () => {

                    resetPasswordForm?.reset();


                    passwordFormError?.classList.add(
                        "hidden"
                    );


                    openModal(
                        "resetPasswordModal"
                    );

                }
            );

        }



        /* =====================================================
           40. PASSWORD ERROR
        ===================================================== */

        function showPasswordError(
            message
        ) {

            if (
                !passwordFormError
            ) {
                return;
            }


            passwordFormError.textContent =
                message;


            passwordFormError.classList.remove(
                "hidden"
            );

        }



        /* =====================================================
           41. RESET PASSWORD FORM
        ===================================================== */

        if (
            resetPasswordForm
        ) {

            resetPasswordForm.addEventListener(
                "submit",
                event => {

                    event.preventDefault();


                    passwordFormError?.classList.add(
                        "hidden"
                    );


                    const currentPassword =
                        document.getElementById(
                            "currentPassword"
                        ).value;


                    const newPassword =
                        document.getElementById(
                            "newPassword"
                        ).value;


                    const confirmPassword =
                        document.getElementById(
                            "confirmPassword"
                        ).value;


                    /*
                        Current password
                    */

                    if (
                        String(
                            currentUser.password ||
                            ""
                        ) !==
                        String(
                            currentPassword
                        )
                    ) {

                        showPasswordError(
                            "Your current password is incorrect."
                        );

                        return;

                    }


                    /*
                        Minimum length
                    */

                    if (
                        newPassword.length <
                        8
                    ) {

                        showPasswordError(
                            "Your new password must contain at least 8 characters."
                        );

                        return;

                    }


                    /*
                        Confirm
                    */

                    if (
                        newPassword !==
                        confirmPassword
                    ) {

                        showPasswordError(
                            "The new passwords do not match."
                        );

                        return;

                    }


                    /*
                        Same password
                    */

                    if (
                        newPassword ===
                        currentPassword
                    ) {

                        showPasswordError(
                            "Your new password must be different from your current password."
                        );

                        return;

                    }


                    /*
                        Save
                    */

                    currentUser.password =
                        newPassword;


                    saveCurrentUser();


                    closeModal(
                        "resetPasswordModal"
                    );


                    showFeedback(
                        "Password Updated",
                        "Your password has been changed successfully."
                    );

                }
            );

        }



        /* =====================================================
           42. PASSWORD VISIBILITY
        ===================================================== */

        document
            .querySelectorAll(
                "[data-toggle-password]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const inputId =
                                button.dataset
                                    .togglePassword;


                            const input =
                                document.getElementById(
                                    inputId
                                );


                            if (
                                !input
                            ) {
                                return;
                            }


                            const icon =
                                button.querySelector(
                                    "i"
                                );


                            if (
                                input.type ===
                                "password"
                            ) {

                                input.type =
                                    "text";


                                icon.className =
                                    "fa-regular fa-eye-slash";

                            } else {

                                input.type =
                                    "password";


                                icon.className =
                                    "fa-regular fa-eye";

                            }

                        }
                    );

                }
            );



        /* =====================================================
           43. LOGOUT
        ===================================================== */

        if (
            logoutButton
        ) {

            logoutButton.addEventListener(
                "click",
                () => {

                    openModal(
                        "logoutModal"
                    );

                }
            );

        }


        if (
            confirmLogoutButton
        ) {

            confirmLogoutButton.addEventListener(
                "click",
                () => {

                    /*
                        DO NOT delete reenUsers.

                        reenUsers contains registered
                        accounts.

                        Only remove the session.
                    */

                    sessionStorage.removeItem(
                        "currentUser"
                    );


                    localStorage.removeItem(
                        "currentUser"
                    );


                    sessionStorage.removeItem(
                        "pendingEmailChange"
                    );


                    window.location.href =
                        "./login.html";

                }
            );

        }



        /* =====================================================
           44. NOTIFICATIONS
        ===================================================== */

        if (
            notificationButton
        ) {

            notificationButton.addEventListener(
                "click",
                () => {

                    if (
                        notificationDot
                    ) {

                        notificationDot.classList.add(
                            "hidden"
                        );

                    }


                    openModal(
                        "notificationModal"
                    );

                }
            );

        }



        /* =====================================================
           45. HEADER PROFILE BUTTON
        ===================================================== */

        const headerProfileButton =
            document.getElementById(
                "headerProfileButton"
            );


        if (
            headerProfileButton
        ) {

            headerProfileButton.addEventListener(
                "click",
                () => {

                    window.scrollTo(
                        {
                            top: 0,
                            behavior: "smooth"
                        }
                    );

                }
            );

        }



        /* =====================================================
           46. MOBILE SIDEBAR
        ===================================================== */

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


        if (
            mobileMenuButton
        ) {

            mobileMenuButton.addEventListener(
                "click",
                openSidebar
            );

        }


        if (
            sidebarOverlay
        ) {

            sidebarOverlay.addEventListener(
                "click",
                closeSidebar
            );

        }


        sidebar
            ?.querySelectorAll("a")
            .forEach(
                link => {

                    link.addEventListener(
                        "click",
                        closeSidebar
                    );

                }
            );



        /* =====================================================
           47. CLOSE MODALS
        ===================================================== */

        document
            .querySelectorAll(
                "[data-close-modal]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const modalId =
                                button.dataset
                                    .closeModal;


                            closeModal(
                                modalId
                            );

                        }
                    );

                }
            );



        /* =====================================================
           48. CLICK OUTSIDE MODALS
        ===================================================== */

        document
            .querySelectorAll(
                '[id$="Modal"]'
            )
            .forEach(
                modal => {

                    modal.addEventListener(
                        "click",
                        event => {

                            if (
                                event.target ===
                                modal
                            ) {

                                closeModal(
                                    modal.id
                                );

                            }

                        }
                    );

                }
            );



        /* =====================================================
           49. ESCAPE KEY
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
                        '[id$="Modal"]:not(.hidden)'
                    )
                    .forEach(
                        modal => {

                            closeModal(
                                modal.id
                            );

                        }
                    );


                if (
                    window.innerWidth <
                    1024
                ) {

                    closeSidebar();

                }

            }
        );



        /* =====================================================
           50. SAVE USER
        ===================================================== */

        function saveCurrentUser() {

            /*
                Find by the CURRENT email.

                Important:
                During email-change verification,
                currentUser.email is still the old
                verified email.

                Therefore the old record is updated
                until OTP verification succeeds.
            */

            const index =
                users.findIndex(
                    user => {

                        return (
                            String(
                                user.email ||
                                ""
                            )
                            .trim()
                            .toLowerCase()
                            ===
                            String(
                                currentUser.email ||
                                ""
                            )
                            .trim()
                            .toLowerCase()
                        );

                    }
                );


            if (
                index !== -1
            ) {

                users[index] = {
                    ...users[index],
                    ...currentUser
                };

            } else {

                users.push(
                    currentUser
                );

            }


            /*
                Save users.
            */

            localStorage.setItem(
                "reenUsers",
                JSON.stringify(
                    users
                )
            );


            /*
                Save session.

                Only safe session information is
                needed here.
            */

            const sessionData = {

                name:
                    currentUser.name,

                email:
                    currentUser.email,

                profileImage:
                    currentUser.profileImage,

                accountNumber:
                    currentUser.accountNumber,

                verified:
                    currentUser.verified,

                emailVerified:
                    currentUser.emailVerified

            };


            sessionStorage.setItem(
                "currentUser",
                JSON.stringify(
                    sessionData
                )
            );


            /*
                Legacy compatibility.
            */

            localStorage.setItem(
                "currentUser",
                JSON.stringify(
                    sessionData
                )
            );


            /*
                Notify other Reen Bank pages.
            */

            window.dispatchEvent(
                new CustomEvent(
                    "reenBankDataUpdated"
                )
            );

        }



        /* =====================================================
           51. LISTEN FOR REEN BANK UPDATES
        ===================================================== */

        window.addEventListener(
            "reenBankDataUpdated",
            () => {

                users =
                    JSON.parse(
                        localStorage.getItem(
                            "reenUsers"
                        )
                    ) || [];


                const updatedUser =
                    users.find(
                        user =>
                            String(
                                user.email ||
                                ""
                            )
                            .toLowerCase()
                            ===
                            String(
                                currentUser.email ||
                                ""
                            )
                            .toLowerCase()
                    );


                if (
                    updatedUser
                ) {

                    currentUser =
                        updatedUser;


                    currentUser.balance =
                        Number(
                            currentUser.balance
                        ) || 0;


                    currentUser.transactions =
                        Array.isArray(
                            currentUser.transactions
                        )
                            ? currentUser.transactions
                            : [];


                    renderProfile();

                }

            }
        );



        /* =====================================================
           52. STORAGE EVENT
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

                    users =
                        JSON.parse(
                            event.newValue
                        ) || [];

                } catch (error) {

                    users = [];

                }


                const updatedUser =
                    users.find(
                        user =>
                            String(
                                user.email ||
                                ""
                            )
                            .toLowerCase()
                            ===
                            String(
                                currentUser.email ||
                                ""
                            )
                            .toLowerCase()
                    );


                if (
                    updatedUser
                ) {

                    currentUser =
                        updatedUser;


                    renderProfile();

                }

            }
        );



        /* =====================================================
           53. INITIAL RENDER
        ===================================================== */

        renderProfile();

    }
);