"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImageIcon, Paperclip, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { UploadSignature } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

async function requestSignature(
  folder: string,
  resourceType: "image" | "raw"
): Promise<UploadSignature> {
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, resourceType }),
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    throw new Error("Could not get an upload signature");
  }
  return res.json();
}

function uploadWithProgress(
  file: File,
  signature: UploadSignature,
  onProgress: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", signature.apiKey);
    form.append("timestamp", String(signature.timestamp));
    form.append("signature", signature.signature);
    form.append("folder", signature.folder);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/${signature.resourceType}/upload`
    );
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url as string);
      } else {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(form);
  });
}

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
  onChange,
  folder,
  aspect = "auto",
  maxSizeMb = 5,
  disabled,
}: ImageUploaderProps) {
  const [progress, setProgress] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file || disabled) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That file isn't an image.");
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Images must be under ${maxSizeMb}MB.`);
      return;
    }

    setProgress(0);
    try {
      const signature = await requestSignature(folder, "image");
      const url = await uploadWithProgress(file, signature, setProgress);
      onChange(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed. Try again.");
    } finally {
      setProgress(null);
    }
  }

  const isUploading = progress !== null;

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 text-center text-sm text-muted-foreground transition-colors",
        aspect === "square" && "aspect-square",
        aspect === "video" && "aspect-video",
        aspect === "auto" && "min-h-40",
        dragActive && "border-primary bg-primary/5",
        disabled && "pointer-events-none opacity-50"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        void handleFile(e.dataTransfer.files[0]);
      }}
    >
      {value && !isUploading ? (
        <>
          <Image
            src={value}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/70 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => onChange("")}
            >
              <X aria-hidden />
              Remove
            </Button>
          </div>
        </>
      ) : isUploading ? (
        <div className="flex w-full max-w-40 flex-col items-center gap-2 p-4">
          <Upload aria-hidden className="size-5" />
          <Progress value={progress ?? 0} />
          <span className="text-xs">{progress}%</span>
        </div>
      ) : (
        <button
          type="button"
          className="flex flex-col items-center gap-2 p-6"
          onClick={() => inputRef.current?.click()}
        >
          <ImageIcon aria-hidden className="size-6" />
          <span>Drag an image here, or click to browse</span>
          <span className="text-xs">Up to {maxSizeMb}MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
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

export function FileUploader({
  value,
  onChange,
  folder,
  accept,
  maxSizeMb = 10,
  label = "Upload a file",
}: FileUploaderProps) {
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Files must be under ${maxSizeMb}MB.`);
      return;
    }

    setProgress(0);
    try {
      const signature = await requestSignature(folder, "raw");
      const url = await uploadWithProgress(file, signature, setProgress);
      onChange(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed. Try again.");
    } finally {
      setProgress(null);
    }
  }

  const isUploading = progress !== null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm">
      <Paperclip aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        {isUploading ? (
          <Progress value={progress ?? 0} />
        ) : value ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="truncate text-primary underline-offset-4 hover:underline"
          >
            {value.split("/").pop()}
          </a>
        ) : (
          <span className="text-muted-foreground">{label}</span>
        )}
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {value ? "Replace" : "Browse"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
