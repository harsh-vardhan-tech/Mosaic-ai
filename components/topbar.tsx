"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { cn } from "@/lib/utils";

export function Topbar({ title }: { title: string }) {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-surface-raised/60 px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <h1 className="font-display text-xl font-medium">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          className="rounded-lg transition-all hover:bg-surface hover:text-gold"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && theme === "dark" ? (
            <Sun size={17} className="text-muted" />
          ) : (
            <Moon size={17} className="text-muted" />
          )}
        </Button>

        {user && (
          <div className="ml-1 flex items-center gap-2 border-l border-border/60 pl-3">
            {/* Avatar */}
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-gold ring-1 ring-gold/25"
              )}
              aria-label={user.displayName || user.email || "User"}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt={initials} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <span className="hidden max-w-[120px] truncate text-sm text-muted sm:inline">
              {user.displayName || user.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              className="rounded-lg transition-all hover:bg-tile-coral/10 hover:text-tile-coral"
              onClick={handleSignOut}
            >
              <LogOut size={16} />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
