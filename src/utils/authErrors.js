// Firebase error codes → friendly messages
const messages = {
  "auth/invalid-credential": "Incorrect email or password",
  "auth/wrong-password": "Incorrect email or password",
  "auth/user-not-found": "No account found with this email",
  "auth/email-already-in-use": "An account with this email already exists",
  "auth/weak-password": "Password must be at least 6 characters",
  "auth/invalid-email": "Please enter a valid email",
  "auth/missing-password": "Password is required",
  "auth/popup-closed-by-user": "Google sign-in popup was closed",
  "auth/too-many-requests": "Too many attempts — please try again later",
  "auth/network-request-failed": "Check your internet connection",
};

export function getAuthError(error) {
  return messages[error.code] || "Something went wrong, please try again";
}
