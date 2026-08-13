"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";

import { FileUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { setActiveResume } from "./actions";

interface ResumeVersion {
  url: string;
  uploadedAt: string;
}

/**
 * Cloudinary Admin API listing isn't available yet (no upload route, no
 * Cloudinary env vars wired up on this branch) — see docs/PHASE4-C.md for
 * the fallback this takes: version history lives only in component state,
 * seeded from the current Profile.resumeUrl, and resets on reload.
 */
export function ResumeManager({ resumeUrl }: { resumeUrl?: string }) {
  const [isPending, startTransition] = useTransition();
  const [versions, setVersions] = useState<ResumeVersion[]>(
    resumeUrl ? [{ url: resumeUrl, uploadedAt: new Date().toISOString() }] : []
  );
  const [activeUrl, setActiveUrl] = useState(resumeUrl ?? "");

  function handleUpload(url: string) {
    setVersions((prev) => [{ url, uploadedAt: new Date().toISOString() }, ...prev]);
  }

  function makeActive(url: string) {
    startTransition(async () => {
      const state = await setActiveResume(url);
      if (state.status === "success") {
        setActiveUrl(url);
        toast.success("Active resume updated.");
      } else if (state.status === "error") {
        toast.error(state.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <h2 className="text-sm font-medium text-card-foreground">Resume manager</h2>
        <FieldDescription>
          Upload a new version, then mark it active. Older versions stay listed for this
          session only — see the note in docs/PHASE4-C.md.
        </FieldDescription>
      </div>

      <Field>
        <FieldLabel>Upload new version</FieldLabel>
        <FileUploader
          folder="portfolio/resume"
          accept="application/pdf"
          onChange={handleUpload}
          label="Upload resume PDF"
        />
      </Field>

      {versions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {versions.map((version) => {
            const isActive = version.url === activeUrl;
            return (
              <li
                key={version.url}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FileText aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-card-foreground">{version.url}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(version.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                  {isActive && <Badge>Active</Badge>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="ghost" size="icon" asChild aria-label="Download">
                    <a href={version.url} target="_blank" rel="noreferrer">
                      <Download className="size-4" />
                    </a>
                  </Button>
                  {!isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => makeActive(version.url)}
                    >
                      Make active
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
