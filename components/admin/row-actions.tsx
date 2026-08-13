"use client";

// STUB — Phase 4 Session A owns this file. Do not edit it from another session.
import type { Route } from "next";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export interface RowActionsProps {
  editHref?: Route;
  onDelete?: () => void | Promise<void>;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: string;
  extra?: { label: string; onClick: () => void }[];
}

export function RowActions({
  editHref,
  onDelete,
  deleteConfirmTitle = "Delete this item?",
  deleteConfirmDescription = "This action cannot be undone.",
  extra,
}: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Row actions">
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {editHref && (
          <DropdownMenuItem asChild>
            <Link href={editHref}>
              <Pencil aria-hidden />
              Edit
            </Link>
          </DropdownMenuItem>
        )}
        {extra?.map((item) => (
          <DropdownMenuItem key={item.label} onClick={item.onClick}>
            {item.label}
          </DropdownMenuItem>
        ))}
        {onDelete && (
          <ConfirmDialog
            trigger={
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 aria-hidden />
                Delete
              </DropdownMenuItem>
            }
            title={deleteConfirmTitle}
            description={deleteConfirmDescription}
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={onDelete}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
