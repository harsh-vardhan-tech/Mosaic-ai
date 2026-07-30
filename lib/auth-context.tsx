"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  type User,
  type Auth,
  type AuthProvider as FirebaseAuthProvider,
} from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "./firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  updateDisplayName: (name: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Every auth action funnels through this so callers get one clear,
// actionable message when the Firebase keys haven't been added yet,
// instead of a cryptic runtime crash.
function requireAuth(): Auth {
  if (!firebaseAuth) {
    throw new Error(
      "auth/configuration-not-found: Firebase is not configured. Add your NEXT_PUBLIC_FIREBASE_* keys to .env.local (see .env.local.example)."
    );
  }
  return firebaseAuth;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // updateProfile() mutates firebaseAuth.currentUser in place, so its object
  // reference never changes — this counter forces a re-render so consumers
  // re-read the (now-updated) displayName off that same object.
  const [, forceRerender] = useState(0);

  useEffect(() => {
    // No Firebase keys yet — don't spin forever on the loading screen.
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    // If a social sign-in fell back to a full-page redirect, this resolves
    // the pending credential once the user lands back on the app.
    getRedirectResult(firebaseAuth).catch((err) => {
      console.log("[v0] Redirect sign-in result error:", err?.message);
    });

    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(requireAuth(), email, password);
  };

  // Popup first (keeps SPA state), fall back to a full-page redirect when the
  // browser blocks the popup (common inside iframes / strict browsers).
  const socialSignIn = async (provider: FirebaseAuthProvider) => {
    const auth = requireAuth();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code.includes("auth/popup-blocked") || code.includes("auth/operation-not-supported-in-this-environment")) {
        await signInWithRedirect(auth, provider);
        return;
      }
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await socialSignIn(provider);
  };

  const signInWithMicrosoft = async () => {
    const provider = new OAuthProvider("microsoft.com");
    // "common" tenant = personal + work/school Microsoft accounts.
    provider.setCustomParameters({ prompt: "select_account", tenant: "common" });
    await socialSignIn(provider);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(requireAuth(), email, password);
    if (name.trim()) {
      await updateProfile(credential.user, { displayName: name.trim() });
    }
  };

  const signOut = async () => {
    await firebaseSignOut(requireAuth());
  };

  // Firebase caches the ID token and silently refreshes it — always pull
  // through this instead of stashing a token in state, so callers never
  // send an expired one.
  const getToken = async () => {
    if (!firebaseAuth?.currentUser) return null;
    return firebaseAuth.currentUser.getIdToken();
  };

  const updateDisplayName = async (name: string) => {
    const auth = requireAuth();
    if (!auth.currentUser) throw new Error("Not signed in");
    await updateProfile(auth.currentUser, { displayName: name.trim() });
    forceRerender((n) => n + 1);
  };

  // Firebase requires a recent sign-in before sensitive changes — re-auth
  // with the current password first so users never hit the confusing
  // "auth/requires-recent-login" dead end.
  const changePassword = async (currentPassword: string, newPassword: string) => {
    const auth = requireAuth();
    const current = auth.currentUser;
    if (!current || !current.email) throw new Error("Not signed in");
    const credential = EmailAuthProvider.credential(current.email, currentPassword);
    await reauthenticateWithCredential(current, credential);
    await updatePassword(current, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: isFirebaseConfigured,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithMicrosoft,
        signOut,
        getToken,
        updateDisplayName,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
