"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Clock,
  Search,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  Compass,
  type LucideIcon,
} from "lucide-react";
import { MosaicMark } from "@/components/mosaic-mark";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  implemented: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid, implemented: true },
  { label: "Timeline", href: "/dashboard/timeline", icon: Clock, implemented: true },
  { label: "Search", href: "/dashboard/search", icon: Search, implemented: true },
  { label: "Chat", href: "/dashboard/chat", icon: MessageSquare, implemented: true },
  { label: "Generate", href: "/dashboard/generate", icon: FileText, implemented: true },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, implemented: true },
  { label: "Career", href: "/dashboard/career", icon: Compass, implemented: true },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, implemented: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="dark-glass hidden w-60 shrink-0 flex-col border-r border-border/40 p-4 md:flex">
      {/* Logo */}
      <div className="px-2 pb-6 pt-2">
        <MosaicMark />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          if (!item.implemented) {
            return (
              <div
                key={item.href}
                title="Coming soon"
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted/40"
              >
                <Icon size={17} />
                <span className="flex-1">{item.label}</span>
                <span className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted/50">
                  soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "nav-active-glow bg-gold/10 text-gold"
                  : "text-muted hover:bg-surface-raised/70 hover:text-foreground hover:shadow-[0_2px_12px_hsl(var(--ink)/0.25)] hover:backdrop-blur-sm"
              )}
            >
              {/* Active indicator bar */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-gold"
                  aria-hidden="true"
                />
              )}
              <Icon
                size={17}
                className={cn(
                  "transition-transform duration-200 group-hover:scale-110",
                  active && "drop-shadow-[0_0_4px_hsl(38_80%_60%/0.6)]"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom brand hint */}
      <div className="mt-4 rounded-xl border border-gold/20 bg-gold/8 px-3 py-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="glow-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
          </span>
          <p className="font-semibold text-gold">Mosaic AI</p>
        </div>
        <p className="mt-1 text-muted/70">Your living digital identity</p>
      </div>
    </aside>
  );
}
