"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LoaderCircle,
  Sparkles,
  FolderOpen,
  BadgeCheck,
  Trophy,
  Building2,
  GraduationCap,
  TrendingUp,
  LayoutGrid,
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import { UploadDropzone } from "@/components/upload-dropzone";
import { MosaicGrid } from "@/components/mosaic-grid";
import { ItemDetailModal } from "@/components/item-detail-modal";
import { categoryStyle, CATEGORIES } from "@/lib/categories";
import { api, ApiError, type Item } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const ALL = "All";

// Keyed by the exact category strings the backend returns (see lib/categories).
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Certifications: BadgeCheck,
  Projects: FolderOpen,
  Achievements: Trophy,
  Internships: Building2,
  Skills: Sparkles,
  Academics: GraduationCap,
};

function StatCard({
  label,
  value,
  color,
  bg,
  border,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
}) {
  return (
    <div
      className={cn(
        "card-hover glass-card glass-shimmer flex flex-col gap-3 rounded-2xl border p-5",
        border
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", bg)}>
          <Icon size={16} className={color} />
        </div>
        <TrendingUp size={13} className="text-muted/40" />
      </div>
      <div>
        <p className={cn("font-display text-2xl font-semibold", color)}>{value}</p>
        <p className="mt-0.5 text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listItems()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : "Couldn't load your Mosaic");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const byCategory: Record<string, number> = {};
    for (const item of items)
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    return byCategory;
  }, [items]);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(items.map((i) => i.category))).sort()],
    [items]
  );

  const visibleItems = useMemo(
    () =>
      activeCategory === ALL
        ? items
        : items.filter((i) => i.category === activeCategory),
    [items, activeCategory]
  );

  const handleUploaded = (item: Item) => setItems((prev) => [item, ...prev]);

  const handleDelete = async (id: string) => {
    await api.deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedItem((prev) => (prev?.id === id ? null : prev));
  };

  const firstName = user?.displayName?.split(" ")[0] || null;

  // Stat cards are derived from the categories the user actually has, ordered
  // by the canonical list so the row stays stable as items are added. Showing
  // every possible category would mean permanent zeros for unused ones.
  const statCats = useMemo(
    () =>
      CATEGORIES.filter((key) => (counts[key] ?? 0) > 0).map((key) => {
        const style = categoryStyle(key);
        return {
          key,
          label: key,
          color: style.text,
          bg: style.bg,
          border: style.ring.replace("ring-", "border-"),
          icon: CATEGORY_ICONS[key] ?? LayoutGrid,
        };
      }),
    [counts]
  );

  return (
    <>
      <Topbar title="Your Mosaic" />

      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Welcome banner */}
        <div className="glass-card glass-shimmer rounded-2xl border border-gold/20 p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-medium text-foreground">
                {firstName ? `Welcome back, ${firstName}` : "Your Mosaic"}
              </h2>
              <p className="text-sm text-muted">
                {items.length === 0
                  ? "Drop your first certificate, project, or internship below to get started."
                  : `${items.length} item${items.length !== 1 ? "s" : ""} indexed — your living digital identity is growing.`}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold ring-1 ring-gold/25 self-start sm:self-auto">
              <Sparkles size={11} className="fill-gold" />
              AI-powered
            </span>
          </div>
        </div>

        {/* Upload zone */}
        <UploadDropzone onUploaded={handleUploaded} />

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <LoaderCircle className="h-8 w-8 animate-spin text-gold" />
                <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-gold/20" />
              </div>
              <p className="text-xs text-muted">Loading your Mosaic…</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-tile-coral/30 bg-tile-coral/8 px-4 py-3 text-sm text-tile-coral ring-1 ring-inset ring-tile-coral/20">
            {error}
          </div>
        ) : (
          <>
            {/* Stats cards — only show when there are items */}
            {statCats.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {statCats.map((s) => (
                  <StatCard
                    key={s.key}
                    label={s.label}
                    value={counts[s.key] ?? 0}
                    color={s.color}
                    bg={s.bg}
                    border={s.border}
                    icon={s.icon}
                  />
                ))}
              </div>
            )}

            {/* Category filter pills */}
            {items.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => {
                  const active = cat === activeCategory;
                  const style = cat !== ALL ? categoryStyle(cat) : null;
                  const count = cat === ALL ? items.length : (counts[cat] ?? 0);
                  const CatIcon = cat !== ALL ? (CATEGORY_ICONS[cat] ?? LayoutGrid) : LayoutGrid;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-gold text-gold-foreground shadow-[0_0_18px_hsl(var(--gold)/0.45),0_2px_8px_hsl(var(--ink)/0.3)] scale-[1.03]"
                          : cn(
                              "ring-1 ring-inset hover:brightness-105 hover:scale-[1.02] hover:shadow-md",
                              style?.bg ?? "bg-surface-raised/70",
                              style?.text ?? "text-foreground",
                              style?.ring ?? "ring-border/60"
                            )
                      )}
                    >
                      <CatIcon size={13} className={active ? "text-gold-foreground" : ""} />
                      {cat}
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                          active
                            ? "bg-gold-foreground/15 text-gold-foreground"
                            : "bg-surface text-muted"
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
                <span className="ml-auto flex items-center gap-1.5 text-xs text-muted">
                  <Sparkles size={12} className="text-gold" />
                  {items.length} items indexed
                </span>
              </div>
            )}

            <MosaicGrid
              items={visibleItems}
              onDelete={handleDelete}
              onOpen={setSelectedItem}
              emptyMessage={
                items.length === 0
                  ? "Nothing here yet — drop your first certificate or project above to start building your Mosaic."
                  : `No items in ${activeCategory} yet.`
              }
            />
          </>
        )}
      </main>

      <ItemDetailModal
        item={selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />
    </>
  );
}
