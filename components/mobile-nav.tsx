"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MosaicMark } from "@/components/mosaic-mark";
import { NAV_ITEMS } from "@/components/sidebar";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="rounded-lg transition-all hover:bg-surface hover:text-gold md:hidden"
        >
          <Menu size={20} />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm md:hidden" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-surface-raised/95 p-4 shadow-2xl backdrop-blur-xl md:hidden">
          <div className="mb-6 flex items-center justify-between px-2 pt-2">
            <MosaicMark />
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                className="rounded-lg hover:bg-surface"
              >
                <X size={18} />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>

          <nav className="flex flex-1 flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "nav-active-glow bg-gold/10 text-gold"
                      : "text-muted hover:bg-surface hover:text-foreground"
                  )}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-gold"
                      aria-hidden="true"
                    />
                  )}
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 rounded-xl border border-border/40 bg-surface/40 px-3 py-3 text-xs text-muted">
            <p className="font-semibold text-foreground">Mosaic AI</p>
            <p className="mt-0.5 text-muted/70">Your living digital identity</p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
