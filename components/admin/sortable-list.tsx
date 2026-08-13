"use client";

// STUB — Phase 4 Session A owns this file. Do not edit it from another session.
import type { AdminCollection } from "@/types/admin";

export interface SortableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  collection: AdminCollection;
  renderItem: (item: T, isDragging: boolean) => React.ReactNode;
  onReordered?: (ids: string[]) => void;
  disabled?: boolean;
}

export function SortableList<T>({ items, getId, renderItem }: SortableListProps<T>) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={getId(item)}>{renderItem(item, false)}</li>
      ))}
    </ul>
  );
}
