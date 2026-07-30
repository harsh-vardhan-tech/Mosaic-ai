import { cn } from "@/lib/utils";

// The brand signature: a 2x2 grid of unevenly-weighted tesserae (tiles) in
// the four category colors, converging into the gold "keystone" piece —
// literally the mosaic the product is named for, built from the same tokens
// every category tile and badge uses elsewhere in the app.
export function MosaicMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="0" y="0" width="13" height="13" rx="2.5" className="fill-tile-teal" />
        <rect x="15" y="0" width="13" height="8" rx="2.5" className="fill-tile-coral" />
        <rect x="15" y="10" width="13" height="18" rx="2.5" className="fill-tile-violet" />
        <rect x="0" y="15" width="13" height="13" rx="2.5" className="fill-gold" />
      </svg>
      <span className="font-display text-lg font-medium tracking-tight">
        Mosaic <span className="gradient-text font-semibold">AI</span>
      </span>
    </div>
  );
}
