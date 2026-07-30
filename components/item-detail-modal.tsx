"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  LoaderCircle,
  Share2,
  ExternalLink,
  Calendar,
  Building2,
  FileText,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RelationshipGraph } from "@/components/relationship-graph";
import { categoryStyle } from "@/lib/categories";
import { api, ApiError, type Item } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ItemDetailModal({
  item,
  onOpenChange,
}: {
  item: Item | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [related, setRelated] = useState<(Item & { shared_skills: string[] })[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;
    setRelated(null);
    setError(null);
    setLoading(true);
    api
      .getRelationships(item.id)
      .then(setRelated)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Couldn't load related items")
      )
      .finally(() => setLoading(false));
  }, [item]);

  if (!item) return null;
  const style = categoryStyle(item.category);
  const Icon = style.icon;

  return (
    <Dialog.Root open={!!item} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Blurred overlay */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/55 backdrop-blur-md" />

        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[min(94vw,640px)]",
            "-translate-x-1/2 -translate-y-1/2 overflow-y-auto",
            "rounded-2xl shadow-2xl",
            "glass-card glass-shimmer animated-border",
            "border border-border/50",
            "focus:outline-none"
          )}
          style={{
            boxShadow:
              "0 4px 48px hsl(var(--ink) / 0.6), 0 0 0 1px hsl(var(--border) / 0.3), inset 0 1px 0 hsl(var(--foreground) / 0.05)",
          }}
        >
          {/* Category glow overlay */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-30"
            style={{
              background: `radial-gradient(ellipse 70% 40% at 50% 0%, hsl(var(--${
                item.category === "Projects"
                  ? "tile-teal"
                  : item.category === "Skills"
                  ? "tile-violet"
                  : item.category === "Internships"
                  ? "tile-coral"
                  : item.category === "Achievements"
                  ? "gold"
                  : item.category === "Certifications"
                  ? "tile-amber"
                  : "muted"
              }) / 0.18), transparent 70%)`,
            }}
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border/40 px-6 py-5">
              <div className="flex items-center gap-3.5">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset transition-all",
                    style.bg,
                    style.ring
                  )}
                >
                  <Icon className={style.text} size={22} />
                </div>
                <div>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      style.text
                    )}
                  >
                    {item.category}
                  </span>
                  <Dialog.Title className="font-display text-xl font-medium leading-tight text-foreground">
                    {item.title}
                  </Dialog.Title>
                </div>
              </div>

              <Dialog.Close
                aria-label="Close"
                className="mt-0.5 rounded-xl p-2 text-muted transition-all hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/50"
              >
                <X size={17} />
              </Dialog.Close>
            </div>

            {/* Meta row */}
            {(item.organization || item.date || item.original_filename) && (
              <div className="flex flex-wrap items-center gap-3 border-b border-border/30 px-6 py-3">
                {item.organization && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <Building2 size={12} className="text-muted/70" />
                    {item.organization}
                  </span>
                )}
                {item.date && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <Calendar size={12} className="text-muted/70" />
                    {item.date}
                  </span>
                )}
                {item.original_filename && (
                  <span className="inline-flex items-center gap-1.5 truncate text-xs text-muted">
                    <FileText size={12} className="shrink-0 text-muted/70" />
                    {item.original_filename}
                  </span>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex flex-col gap-5 px-6 py-5">
              {/* Description */}
              <Dialog.Description className="text-sm leading-relaxed text-foreground/90">
                {item.description}
              </Dialog.Description>

              {/* Skills */}
              {item.skills.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    <Sparkles size={11} className="text-gold" />
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.skills.map((skill) => (
                      <Badge key={skill} className="text-[11px]">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* View file */}
              {item.file_url && (
                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/8 px-3.5 py-2 text-sm font-medium text-gold transition-all hover:border-gold/50 hover:bg-gold/14"
                >
                  <ExternalLink size={14} />
                  View original file
                </a>
              )}

              {/* Connections section */}
              <div className="rounded-2xl border border-border/50 bg-surface/40 p-4">
                <h3 className="mb-3 flex items-center gap-2 font-display text-base font-medium">
                  <Share2 size={15} className="text-muted" />
                  Connections
                </h3>

                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <LoaderCircle className="h-5 w-5 animate-spin text-gold" />
                      <p className="text-xs text-muted">Finding related items…</p>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="rounded-xl border border-tile-coral/25 bg-tile-coral/8 px-3 py-2.5 text-sm text-tile-coral">
                    {error}
                  </p>
                )}

                {!loading && related && related.length === 0 && (
                  <p className="text-sm leading-relaxed text-muted">
                    No connections yet — upload more items and Mosaic will start weaving them together.
                  </p>
                )}

                {!loading && related && related.length > 0 && (
                  <RelationshipGraph center={item} related={related} />
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
