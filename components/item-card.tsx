"use client";

import { useState } from "react";
import { Trash2, LoaderCircle, ExternalLink, AlertTriangle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categoryStyle } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { Item } from "@/lib/api";

const MAX_VISIBLE_SKILLS = 3;

// Map category to a glow class
const CATEGORY_GLOW: Record<string, string> = {
  Projects: "glow-card-teal",
  Skills: "glow-card-violet",
  Certifications: "glow-card-gold",
  Internships: "glow-card-coral",
  Achievements: "glow-card-gold",
  Academics: "",
};

export function ItemCard({
  item,
  onDelete,
  onOpen,
}: {
  item: Item;
  onDelete: (id: string) => Promise<void>;
  onOpen: (item: Item) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const style = categoryStyle(item.category);
  const Icon = style.icon;
  const extraSkills = item.skills.length - MAX_VISIBLE_SKILLS;
  const glowClass = CATEGORY_GLOW[item.category] ?? "";

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(true);
  };

  const handleDeleteConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    setConfirmDelete(false);
    try {
      await onDelete(item.id);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen(item)}
      className={cn(
        "animated-border card-hover group relative flex cursor-pointer flex-col gap-0 rounded-2xl border bg-surface-raised/70 backdrop-blur-sm ring-1 ring-inset transition-all duration-300",
        style.ring,
        glowClass
      )}
    >
      {/* Inline delete confirmation overlay */}
      {confirmDelete && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface-raised/95 px-5 py-4 text-center backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-tile-coral/12 ring-1 ring-inset ring-tile-coral/30">
            <AlertTriangle size={18} className="text-tile-coral" />
          </div>
          <div>
            <p className="font-display text-sm font-medium">Remove this item?</p>
            <p className="mt-0.5 text-xs text-muted">This can&apos;t be undone.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteCancel}
              className="rounded-xl border border-border/60 bg-surface/80 px-3.5 py-1.5 text-xs font-medium text-muted transition-all hover:border-border hover:text-foreground"
            >
              Keep it
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="rounded-xl bg-tile-coral/15 px-3.5 py-1.5 text-xs font-medium text-tile-coral ring-1 ring-inset ring-tile-coral/30 transition-all hover:bg-tile-coral/25"
            >
              Yes, remove
            </button>
          </div>
        </div>
      )}

      {/* Subtle category glow on hover — injected via inline style for dynamic color */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--${
            item.category === "Projects"
              ? "tile-teal"
              : item.category === "Skills"
              ? "tile-violet"
              : item.category === "Internships"
              ? "tile-coral"
              : "gold"
          }) / 0.06), transparent)`,
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 p-4 pb-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
            style.bg
          )}
        >
          <Icon className={style.text} size={18} />
        </div>
        <button
          onClick={handleDeleteClick}
          disabled={deleting}
          aria-label="Remove item"
          className="rounded-lg p-1.5 text-muted opacity-0 transition-all hover:bg-tile-coral/10 hover:text-tile-coral group-hover:opacity-100 disabled:opacity-50"
        >
          {deleting ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
        <div>
          <span className={cn("text-[11px] font-semibold uppercase tracking-wider", style.text)}>
            {item.category}
          </span>
          <h3 className="font-display text-base leading-snug">{item.title}</h3>
          {(item.organization || item.date) && (
            <p className="mt-0.5 text-xs text-muted">
              {[item.organization, item.date].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{item.description}</p>

        {item.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {item.skills.slice(0, MAX_VISIBLE_SKILLS).map((skill) => (
              <Badge key={skill} className="text-[11px]">
                {skill}
              </Badge>
            ))}
            {extraSkills > 0 && (
              <Badge variant="outline" className="text-[11px]">
                +{extraSkills}
              </Badge>
            )}
          </div>
        )}

        {item.file_url && (
          <a
            href={item.file_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-gold transition-opacity hover:opacity-70"
          >
            View file
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}
