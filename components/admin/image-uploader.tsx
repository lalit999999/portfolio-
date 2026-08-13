"use client";

// STUB — Phase 4 Session A owns this file. Do not edit it from another session.
import { ImageIcon, Paperclip } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder: string;
  aspect?: "square" | "video" | "auto";
  maxSizeMb?: number;
  disabled?: boolean;
}

export function ImageUploader({
  value,
  aspect = "auto",
  disabled,
}: ImageUploaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground",
        aspect === "square" && "aspect-square",
        aspect === "video" && "aspect-video",
        disabled && "opacity-50"
      )}
    >
      <ImageIcon aria-hidden className="size-6" />
      {value ? "Image set" : "Cloudinary upload — coming in Phase 4"}
    </div>
  );
}

export interface FileUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder: string;
  accept?: string;
  maxSizeMb?: number;
  label?: string;
}

export function FileUploader({ value, label, disabled }: FileUploaderProps & { disabled?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground",
        disabled && "opacity-50"
      )}
    >
      <Paperclip aria-hidden className="size-4" />
      {value ? (label ?? "File set") : (label ?? "File upload — coming in Phase 4")}
    </div>
  );
}
