// Maps raw Firebase Auth error codes to human-friendly messages.
// The most common "account create nahi ho raha" causes are surfaced with
// actionable fixes (provider not enabled, domain not authorized, bad API key).
export function friendlyAuthError(raw: string): string {
  const msg = raw || "";

  // --- Configuration problems (why signup/login silently fails) ---
  if (msg.includes("auth/operation-not-allowed")) {
    return "This sign-in method is not enabled in Firebase. Go to Firebase Console → Authentication → Sign-in method and enable it (Email/Password, Google or Microsoft).";
  }
  if (msg.includes("auth/unauthorized-domain")) {
    return "This domain is not authorized in Firebase. Go to Firebase Console → Authentication → Settings → Authorized domains and add this site's domain (e.g. localhost or your deployed URL).";
  }
  if (msg.includes("auth/configuration-not-found")) {
    return "Firebase Authentication is not set up for this project yet. Open Firebase Console → Authentication → Get started, then enable a sign-in provider.";
  }
  if (msg.includes("auth/invalid-api-key") || msg.includes("auth/api-key-not-valid")) {
    return "Firebase API key is missing or invalid. Check NEXT_PUBLIC_FIREBASE_API_KEY in your .env.local file.";
  }
  if (msg.includes("auth/network-request-failed")) {
    return "Network error — check your internet connection and try again.";
  }

  // --- Email / password ---
  if (
    msg.includes("auth/invalid-credential") ||
    msg.includes("auth/wrong-password") ||
    msg.includes("auth/user-not-found")
  ) {
    return "Email or password is incorrect.";
  }
  if (msg.includes("auth/email-already-in-use")) {
    return "An account with that email already exists. Try signing in instead.";
  }
  if (msg.includes("auth/invalid-email")) {
    return "That email address doesn't look right.";
  }
  if (msg.includes("auth/weak-password")) {
    return "Password is too weak — use at least 6 characters.";
  }
  if (msg.includes("auth/too-many-requests")) {
    return "Too many attempts — wait a bit before trying again.";
  }
  if (msg.includes("auth/requires-recent-login")) {
    return "For security, sign in again before changing your password.";
  }

  // --- Social (Google / Microsoft) popups ---
  if (msg.includes("auth/popup-closed-by-user") || msg.includes("auth/cancelled-popup-request")) {
    return "Sign-in window was closed before finishing. Try again.";
  }
  if (msg.includes("auth/popup-blocked")) {
    return "Your browser blocked the sign-in popup. Allow popups for this site, or try again — we'll redirect instead.";
  }
  if (msg.includes("auth/account-exists-with-different-credential")) {
    return "An account already exists with this email using a different sign-in method. Sign in with the original method first.";
  }

  return "Something went wrong — please try again.";
}
