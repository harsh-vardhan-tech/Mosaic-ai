import { LayoutGrid } from "lucide-react";
import { ItemCard } from "@/components/item-card";
import type { Item } from "@/lib/api";

export function MosaicGrid({
  items,
  onDelete,
  onOpen,
  emptyMessage,
}: {
  items: Item[];
  onDelete: (id: string) => Promise<void>;
  onOpen: (item: Item) => void;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-raised">
          <LayoutGrid className="h-7 w-7 text-muted" />
        </div>
        <p className="max-w-xs text-sm text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="fade-up"
          style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}
        >
          <ItemCard item={item} onDelete={onDelete} onOpen={onOpen} />
        </div>
      ))}
    </div>
  );
}
