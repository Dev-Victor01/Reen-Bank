REEN BANK STORAGE FIX

Canonical user data:
  localStorage.reenUsers

Active session:
  sessionStorage.currentUser

sessionStorage.currentUser contains only:
  id
  email
  accountNumber

localStorage.currentUser is no longer used. storage.js performs a one-time migration of old localStorage.currentUser data when possible.

All authenticated pages load:
  ./js/storage.js
before their page-specific JavaScript.

Canonical page filenames in this package:
  index.html
  login.html
  register.html
  otp.html
  overview.html
  account.html
  transaction.html
  profile.html

The package also normalizes account/transaction navigation and removes the duplicated full-user session writes.
