import {
  FolderKanban,
  Sparkles,
  BadgeCheck,
  Building2,
  Trophy,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

export type CategoryStyle = {
  icon: LucideIcon;
  // Tailwind classes — bg is always /10-/15 opacity so text stays legible in
  // both themes; ring gives the mosaic tile its category-colored edge.
  text: string;
  bg: string;
  ring: string;
};

// Academics deliberately gets the neutral/border treatment instead of a tile
// color — it's the foundation everything else builds on, not a category
// competing for attention with Projects/Skills/etc. Achievements gets gold,
// matching the "achievement emphasis" role gold already plays elsewhere.
export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Projects: { icon: FolderKanban, text: "text-tile-teal", bg: "bg-tile-teal/10", ring: "ring-tile-teal/30" },
  Skills: { icon: Sparkles, text: "text-tile-violet", bg: "bg-tile-violet/10", ring: "ring-tile-violet/30" },
  Certifications: { icon: BadgeCheck, text: "text-tile-amber", bg: "bg-tile-amber/10", ring: "ring-tile-amber/30" },
  Internships: { icon: Building2, text: "text-tile-coral", bg: "bg-tile-coral/10", ring: "ring-tile-coral/30" },
  Achievements: { icon: Trophy, text: "text-gold", bg: "bg-gold/10", ring: "ring-gold/30" },
  Academics: { icon: GraduationCap, text: "text-foreground", bg: "bg-surface-raised", ring: "ring-border" },
};

// The canonical six, in the same order as backend/config.py CATEGORIES.
// The exact strings matter — the extraction prompt returns one of these on
// every item, so anything comparing against them must use them verbatim.
export const CATEGORIES = [
  "Projects",
  "Skills",
  "Certifications",
  "Internships",
  "Achievements",
  "Academics",
] as const;

export const DEFAULT_CATEGORY_STYLE: CategoryStyle = {
  icon: FolderKanban,
  text: "text-muted",
  bg: "bg-surface-raised",
  ring: "ring-border",
};

export function categoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? DEFAULT_CATEGORY_STYLE;
}
