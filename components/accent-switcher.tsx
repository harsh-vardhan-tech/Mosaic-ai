"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";

type Accent = "azure" | "gold" | "teal" | "coral" | "violet";

const ACCENTS: { value: Accent; label: string; swatch: string; cssVar?: string }[] = [
  { value: "azure",  label: "Azure",  swatch: "hsl(210 100% 63%)" },
  { value: "gold",   label: "Gold",   swatch: "hsl(36 100% 62%)" },
  { value: "teal",   label: "Teal",   swatch: "hsl(188 92% 60%)" },
  { value: "coral",  label: "Coral",  swatch: "hsl(8 92% 68%)" },
  { value: "violet", label: "Violet", swatch: "hsl(236 92% 74%)" },
];

const STORAGE_KEY = "mosaic-accent";

export function AccentSwitcher({ className }: { className?: string }) {
  const [accent, setAccent] = useState<Accent>("azure");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Accent | null) ?? "azure";
    setAccent(stored);
    applyAccent(stored);
    setMounted(true);
  }, []);

  // Close on outside mousedown (capture phase so it beats synthetic React clicks)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const root = (e.target as Node)?.getRootNode?.() as Document | ShadowRoot;
      const container = (root ?? document).querySelector?.('[data-accent-switcher]');
      if (container && container.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
  }, [open]);

  function applyAccent(next: Accent) {
    const root = document.documentElement;
    // Reset all overrides first
    root.removeAttribute("data-accent");
    root.style.removeProperty("--gold");
    root.style.removeProperty("--gold-foreground");
    root.style.removeProperty("--glow-gold");

    // Set data-accent on ALL themes so CSS selectors fire for orb/aurora overrides
    root.dataset.accent = next;

    if (next === "azure") {
      // azure is default — CSS vars are already set in :root, just clear overrides
      root.removeAttribute("data-accent"); // azure has no CSS overrides needed
    } else if (next === "gold") {
      // gold vars come from [data-accent="gold"] in CSS — no inline override needed
    } else if (next === "teal") {
      root.style.setProperty("--gold", "188 92% 60%");
      root.style.setProperty("--gold-foreground", "224 48% 4%");
      root.style.setProperty("--glow-gold", "188 92% 60%");
    } else if (next === "coral") {
      root.style.setProperty("--gold", "8 92% 68%");
      root.style.setProperty("--gold-foreground", "224 48% 4%");
      root.style.setProperty("--glow-gold", "8 92% 68%");
    } else if (next === "violet") {
      root.style.setProperty("--gold", "260 92% 74%");
      root.style.setProperty("--gold-foreground", "224 48% 4%");
      root.style.setProperty("--glow-gold", "260 92% 74%");
    }
  }

  const choose = (next: Accent) => {
    setAccent(next);
    applyAccent(next);
    localStorage.setItem(STORAGE_KEY, next);
    setOpen(false);
  };

  const current = ACCENTS.find((a) => a.value === accent) ?? ACCENTS[0];

  return (
    <div
      data-accent-switcher
      className={cn("relative", className)}
    >
      {/* Trigger button */}
      <button
        type="button"
        aria-label="Change accent color"
        title="Change accent color"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-surface-raised/60 px-2.5 py-1.5 text-xs font-medium text-muted backdrop-blur-sm transition-all hover:border-border hover:text-foreground",
          open && "border-border text-foreground",
        )}
      >
        <span
          className="h-3 w-3 rounded-full ring-1 ring-white/20 transition-all duration-300"
          style={{ background: mounted ? current.swatch : "hsl(210 100% 63%)" }}
        />
        <Palette size={11} />
      </button>

      {/* Dropdown palette */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 flex items-center gap-1.5 rounded-full border border-border/60 bg-surface-raised/95 px-3 py-2 shadow-xl shadow-ink/30 backdrop-blur-2xl">
          {ACCENTS.map(({ value, label, swatch }) => {
            const active = mounted && accent === value;
            return (
              <button
                key={value}
                type="button"
                aria-label={label}
                title={label}
                onClick={() => choose(value)}
                className={cn(
                  "relative flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 hover:scale-110",
                  active ? "ring-2 ring-offset-1 ring-offset-surface-raised scale-110" : "opacity-60 hover:opacity-100",
                )}
                style={active ? ({ "--tw-ring-color": swatch } as React.CSSProperties) : undefined}
              >
                <span className="h-4 w-4 rounded-full" style={{ background: swatch }} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
