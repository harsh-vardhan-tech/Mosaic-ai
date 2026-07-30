"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MosaicMark } from "@/components/mosaic-mark";
import { SocialAuthButtons } from "@/components/social-auth-buttons";
import { FirebaseSetupNotice } from "@/components/firebase-setup-notice";
import { friendlyAuthError } from "@/lib/auth-errors";
import { LoaderCircle, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password needs at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(name, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? friendlyAuthError(err.message) : "Couldn't create your account — try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Live background */}
      <div className="live-bg" aria-hidden="true">
        <div className="orb-3" />
        <div className="orb-4" />
      </div>
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-sm fade-up">
        <FirebaseSetupNotice />

        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <MosaicMark />
            <h1 className="font-display text-2xl">Build your Mosaic</h1>
            <p className="text-sm text-muted">
              One account, every certificate and project — turned into a story you can show.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className="bg-surface/50 backdrop-blur-sm transition-all focus:border-gold/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-surface/50 backdrop-blur-sm transition-all focus:border-gold/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="bg-surface/50 backdrop-blur-sm transition-all focus:border-gold/50"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-tile-coral/10 px-3 py-2.5 text-sm text-tile-coral ring-1 ring-inset ring-tile-coral/20">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="btn-glow mt-2 w-full gap-2 bg-gold text-gold-foreground hover:bg-gold"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="animate-spin" size={16} />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <SocialAuthButtons />
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          Already have a Mosaic?{" "}
          <Link href="/login" className="font-semibold text-gold transition-opacity hover:opacity-80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
