"use client";

import { useState, type FormEvent } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { LoaderCircle, Check, Sun, Moon, Monitor, LogOut } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { friendlyAuthError } from "@/lib/auth-errors";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function SettingsCard({
  title,
  description,
  children,
  danger,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-lg rounded-2xl border bg-surface-raised/70 p-6 backdrop-blur-sm",
        danger ? "border-tile-coral/30" : "border-border/60"
      )}
    >
      <div className="mb-5">
        <h2 className="font-display text-lg font-medium">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateDisplayName, changePassword, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [name, setName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const hasPasswordProvider =
    user?.providerData.some((p) => p.providerId === "password") ?? false;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateDisplayName(name);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Couldn't save your name — try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSaved(false);
    if (newPassword.length < 6) {
      setPwError("New password needs at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords don't match.");
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSaved(false), 2000);
    } catch (err) {
      setPwError(
        err instanceof Error
          ? friendlyAuthError(err.message)
          : "Couldn't change password — try again."
      );
    } finally {
      setPwSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <>
      <Topbar title="Settings" />
      <main className="flex flex-1 flex-col gap-5 p-4 md:p-6">
        <SettingsCard title="Profile" description="How your name appears across Mosaic.">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-surface/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-surface/50 transition-all focus:border-gold/50"
              />
            </div>
            {error && (
              <p className="text-sm text-tile-coral">{error}</p>
            )}
            <Button
              type="submit"
              disabled={saving}
              className="btn-glow w-fit gap-2 rounded-xl bg-gold text-gold-foreground hover:bg-gold"
            >
              {saving && <LoaderCircle className="animate-spin" size={15} />}
              {saved && <Check size={15} />}
              {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
            </Button>
          </form>
        </SettingsCard>

        {hasPasswordProvider && (
          <SettingsCard title="Password" description="Change the password you use to sign in.">
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-surface/50 transition-all focus:border-gold/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="bg-surface/50 transition-all focus:border-gold/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-surface/50 transition-all focus:border-gold/50"
                />
              </div>
              {pwError && (
                <p
                  role="alert"
                  className="rounded-xl bg-tile-coral/10 px-3 py-2.5 text-sm text-tile-coral ring-1 ring-inset ring-tile-coral/20"
                >
                  {pwError}
                </p>
              )}
              <Button
                type="submit"
                disabled={pwSaving}
                className="btn-glow w-fit gap-2 rounded-xl bg-gold text-gold-foreground hover:bg-gold"
              >
                {pwSaving && <LoaderCircle className="animate-spin" size={15} />}
                {pwSaved && <Check size={15} />}
                {pwSaving ? "Updating…" : pwSaved ? "Updated!" : "Update password"}
              </Button>
            </form>
          </SettingsCard>
        )}

        <SettingsCard title="Appearance" description="Choose how Mosaic looks on this device.">
          <div className="flex gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-2 rounded-xl border px-3 py-3.5 text-sm font-medium transition-all duration-200",
                  theme === value
                    ? "border-gold bg-gold/10 text-gold shadow-[0_0_12px_hsl(var(--gold)/0.3)]"
                    : "border-border/60 text-muted hover:border-border hover:bg-surface"
                )}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard
          title="Account"
          description="Sign out of Mosaic on this device."
          danger
        >
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="rounded-xl gap-2"
          >
            <LogOut size={16} />
            Sign out
          </Button>
        </SettingsCard>
      </main>
    </>
  );
}
