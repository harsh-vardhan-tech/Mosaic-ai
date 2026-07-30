"use client";

import useSWRImmutable from "swr/immutable";
import { TriangleAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

/**
 * Lightweight probe against Google's Identity Toolkit to confirm the API key
 * is actually VALID, not just present. An invalid key otherwise fails deep
 * inside Firebase with a page-crashing unhandled error, so the user never
 * sees a message. Google responds 400 + API_KEY_INVALID for bad keys; any
 * auth-level error (like MISSING_EMAIL) means the key itself is fine.
 */
async function probeApiKey(key: string): Promise<"valid" | "invalid"> {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(key)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }
    );
    const data = await res.json().catch(() => null);
    const reason: string = data?.error?.details?.[0]?.reason ?? data?.error?.message ?? "";
    return reason.includes("API_KEY_INVALID") || reason.includes("API key not valid")
      ? "invalid"
      : "valid";
  } catch {
    // Network hiccup — don't scare the user with a false alarm.
    return "valid";
  }
}

/**
 * Shown on login/signup when the NEXT_PUBLIC_FIREBASE_* env vars are missing
 * OR the API key is invalid, so instead of a cryptic "auth/invalid-api-key"
 * crash the user gets clear setup steps. Renders nothing once Firebase is
 * correctly configured.
 */
export function FirebaseSetupNotice() {
  const { configured } = useAuth();
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  const { data: keyStatus } = useSWRImmutable(
    configured && apiKey ? ["firebase-key-probe", apiKey] : null,
    ([, key]) => probeApiKey(key)
  );

  if (configured && keyStatus !== "invalid") return null;

  const invalidKey = configured && keyStatus === "invalid";

  return (
    <div
      role="alert"
      className="mb-6 rounded-md border border-gold/40 bg-gold/10 px-4 py-3 text-sm"
    >
      <div className="flex items-center gap-2 font-medium text-gold">
        <TriangleAlert size={16} aria-hidden="true" />
        {invalidKey ? "Firebase API key is invalid" : "Firebase setup needed"}
      </div>
      {invalidKey ? (
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
          <li>
            Your <code className="rounded bg-surface px-1">NEXT_PUBLIC_FIREBASE_API_KEY</code> was
            rejected by Google — sign-in and sign-up cannot work until it&apos;s fixed
          </li>
          <li>
            Open Firebase Console → Project settings → General → Your apps → Web app, and copy the
            exact <code className="rounded bg-surface px-1">apiKey</code> value (starts with{" "}
            <code className="rounded bg-surface px-1">AIza</code>)
          </li>
          <li>Update the env var (no quotes, no extra spaces) and restart the dev server</li>
        </ol>
      ) : (
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
          <li>
            Copy <code className="rounded bg-surface px-1">.env.local.example</code> to{" "}
            <code className="rounded bg-surface px-1">.env.local</code>
          </li>
          <li>
            Fill in your <code className="rounded bg-surface px-1">NEXT_PUBLIC_FIREBASE_*</code> keys
            from Firebase Console → Project settings → Your apps
          </li>
          <li>Enable Email/Password (and Google/Microsoft if you want) in Authentication → Sign-in method</li>
          <li>Restart the dev server</li>
        </ol>
      )}
    </div>
  );
}
