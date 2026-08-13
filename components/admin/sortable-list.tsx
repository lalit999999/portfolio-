"use client";

import type * as React from "react";
import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { AdminCollection, ReorderResponse } from "@/types/admin";

const ITEM_TYPE = "admin-sortable-item";

interface DragItem {
  index: number;
}

export interface SortableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  collection: AdminCollection;
  renderItem: (item: T, isDragging: boolean) => React.ReactNode;
  onReordered?: (ids: string[]) => void;
  disabled?: boolean;
}

interface RowProps<T> {
  item: T;
  index: number;
  renderItem: (item: T, isDragging: boolean) => React.ReactNode;
  moveRow: (from: number, to: number) => void;
  onDrop: () => void;
  move: (index: number, direction: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
}

function SortableRow<T>({
  item,
  index,
  renderItem,
  moveRow,
  onDrop,
  move,
  isFirst,
  isLast,
  disabled,
}: RowProps<T>) {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: (): DragItem => ({ index }),
    canDrag: !disabled,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    end: onDrop,
  });

  const [, drop] = useDrop<DragItem>({
    accept: ITEM_TYPE,
    hover(dragged) {
      if (dragged.index === index) return;
      moveRow(dragged.index, index);
      dragged.index = index;
    },
  });

  return (
    <div
      ref={(node) => {
        drop(node);
      }}
      className={cn(
        "flex items-center gap-2 rounded-xl border border-border bg-card p-2",
        isDragging && "opacity-40"
      )}
    >
      <button
        ref={(node) => {
          drag(node);
        }}
        type="button"
        disabled={disabled}
        aria-label="Drag to reorder"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GripVertical aria-hidden className="size-4" />
      </button>

      <div className="min-w-0 flex-1">{renderItem(item, isDragging)}</div>

      <div className="flex flex-col">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          disabled={disabled || isFirst}
          aria-label="Move up"
          onClick={() => move(index, -1)}
        >
          <ChevronUp aria-hidden className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          disabled={disabled || isLast}
          aria-label="Move down"
          onClick={() => move(index, 1)}
        >
          <ChevronDown aria-hidden className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function SortableList<T>({
  items,
  getId,
  collection,
  renderItem,
  onReordered,
  disabled = false,
}: SortableListProps<T>) {
  const itemsKey = items.map(getId).join(",");
  const [localItems, setLocalItems] = useState(items);
  // Re-sync from props (e.g. a fresh fetch) without an Effect: adjusting
  // state during render, gated on a stored "previous key", is React's own
  // documented pattern — see the identical use in navbar-client.tsx.
  const [syncedKey, setSyncedKey] = useState(itemsKey);
  if (itemsKey !== syncedKey) {
    setSyncedKey(itemsKey);
    setLocalItems(items);
  }

  function moveRow(from: number, to: number) {
    setLocalItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function move(index: number, direction: -1 | 1) {
    const to = index + direction;
    if (to < 0 || to >= localItems.length) return;
    moveRow(index, to);
    void persist(
      (() => {
        const next = [...localItems];
        const [moved] = next.splice(index, 1);
        next.splice(to, 0, moved);
        return next;
      })()
    );
  }

  async function persist(nextOrder: T[]) {
    const ids = nextOrder.map(getId);
    try {
      const res = await fetch("/api/admin/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection, ids }),
      });
      const data: ReorderResponse = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error?.message ?? "Reorder failed");
      }
      onReordered?.(ids);
    } catch {
      toast.error("Couldn't save the new order — reverted.");
      setLocalItems(items);
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col gap-2">
        {localItems.map((item, index) => (
          <SortableRow
            key={getId(item)}
            item={item}
            index={index}
            renderItem={renderItem}
            moveRow={moveRow}
            onDrop={() => void persist(localItems)}
            move={move}
            isFirst={index === 0}
            isLast={index === localItems.length - 1}
            disabled={disabled}
          />
        ))}
      </div>
    </DndProvider>
  );
}
