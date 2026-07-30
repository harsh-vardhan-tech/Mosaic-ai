"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Clock } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { categoryStyle } from "@/lib/categories";
import { api, ApiError, type Item } from "@/lib/api";
import { cn } from "@/lib/utils";

function yearOf(item: Item): string {
  const d = item.date || "";
  return /^\d{4}/.test(d) ? d.slice(0, 4) : "Undated";
}

export default function TimelinePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getTimeline()
      .then((data) => !cancelled && setItems(data))
      .catch(
        (err) =>
          !cancelled &&
          setError(err instanceof ApiError ? err.message : "Couldn't load timeline")
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => {
    const byYear = new Map<string, Item[]>();
    for (const item of items) {
      const y = yearOf(item);
      if (!byYear.has(y)) byYear.set(y, []);
      byYear.get(y)!.push(item);
    }
    return Array.from(byYear.entries()).sort(([a], [b]) => {
      if (a === "Undated") return 1;
      if (b === "Undated") return -1;
      return b.localeCompare(a);
    });
  }, [items]);

  return (
    <>
      <Topbar title="Timeline" />
      <main className="flex flex-1 flex-col p-4 md:p-6">
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <LoaderCircle className="h-8 w-8 animate-spin text-gold" />
                <div className="absolute inset-0 animate-ping rounded-full bg-gold/20" />
              </div>
              <p className="text-xs text-muted">Loading your timeline…</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-tile-coral/30 bg-tile-coral/8 px-4 py-3 text-sm text-tile-coral ring-1 ring-inset ring-tile-coral/20">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-raised">
              <Clock className="h-7 w-7 text-muted" />
            </div>
            <p className="text-sm text-muted">
              Upload a few dated items to see your growth over time.
            </p>
          </div>
        ) : (
          <div className="relative flex flex-col gap-12 pl-8">
            {/* Timeline stem */}
            <div
              className="absolute bottom-0 left-[11px] top-2 w-px"
              style={{
                background:
                  "linear-gradient(to bottom, hsl(var(--gold)/0.6), hsl(var(--border)/0.3) 80%, transparent)",
              }}
              aria-hidden="true"
            />

            {groups.map(([year, yearItems], gi) => (
              <div
                key={year}
                className="relative fade-up"
                style={{ animationDelay: `${gi * 0.08}s` }}
              >
                {/* Year marker dot */}
                <div
                  className="absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold shadow-[0_0_12px_hsl(var(--gold)/0.5)] ring-4 ring-surface"
                  aria-hidden="true"
                >
                  <div className="h-2 w-2 rounded-full bg-gold-foreground" />
                </div>

                <h2 className="mb-4 font-display text-2xl font-medium">{year}</h2>

                <div className="flex flex-col gap-3">
                  {yearItems.map((item, ii) => {
                    const style = categoryStyle(item.category);
                    const Icon = style.icon;
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "animated-border card-hover flex gap-3 rounded-2xl border bg-surface-raised/70 p-4 backdrop-blur-sm ring-1 ring-inset fade-up",
                          style.ring
                        )}
                        style={{ animationDelay: `${gi * 0.08 + ii * 0.04}s` }}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                            style.bg
                          )}
                        >
                          <Icon className={style.text} size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <h3 className="font-display text-base leading-snug">{item.title}</h3>
                            <span className="shrink-0 font-mono text-xs text-muted">
                              {item.date}
                            </span>
                          </div>
                          <p className="text-xs text-muted">
                            {[item.category, item.organization]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-muted">
                            {item.description}
                          </p>
                          {item.skills.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {item.skills.slice(0, 4).map((skill) => (
                                <Badge key={skill} className="text-[11px]">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
