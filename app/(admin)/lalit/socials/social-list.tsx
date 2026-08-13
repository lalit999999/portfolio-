"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SortableList } from "@/components/admin/sortable-list";
import { RowActions } from "@/components/admin/row-actions";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import type { SerializedSocial } from "@/types/models";
import { deleteSocial, reorderSocials } from "./actions";
import { SocialIconPreview } from "./social-icon-preview";

export function SocialList({ socials }: { socials: SerializedSocial[] }) {
  const router = useRouter();

  if (socials.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Share2 aria-hidden />
          </EmptyMedia>
          <EmptyTitle>No social links yet</EmptyTitle>
          <EmptyDescription>
            Add the profiles you want linked from the site footer.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <a href="/lalit/socials/new">Add social link</a>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  async function handleReordered(ids: string[]) {
    const state = await reorderSocials(ids);
    if (state.status === "success") {
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }

  async function handleDelete(id: string) {
    const state = await deleteSocial(id);
    if (state.status === "success") {
      toast.success("Social link deleted.");
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }

  return (
    <SortableList
      items={socials}
      getId={(s) => s._id}
      collection="socials"
      onReordered={handleReordered}
      renderItem={(social) => (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
          <div className="flex min-w-0 items-center gap-3">
            <SocialIconPreview iconName={social.iconName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-card-foreground">
                {social.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{social.url}</p>
            </div>
            {!social.isVisible && <Badge variant="secondary">Hidden</Badge>}
          </div>
          <RowActions
            editHref={`/lalit/socials/${social._id}` as Route}
            onDelete={() => handleDelete(social._id)}
            deleteConfirmTitle={`Delete "${social.name}"?`}
          />
        </div>
      )}
    />
  );
}
