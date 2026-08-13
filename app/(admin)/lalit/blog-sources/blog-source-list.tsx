"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Newspaper, Plus, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { DataTable, type ColumnDef } from "@/components/admin/data-table";
import { RowActions } from "@/components/admin/row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import type { SerializedBlogSource } from "@/types/models";
import { deleteBlogSource, syncBlogSourceNow } from "./actions";

export function BlogSourceList({ sources }: { sources: SerializedBlogSource[] }) {
  const router = useRouter();
  const [isSyncing, startSync] = useTransition();

  if (sources.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Newspaper aria-hidden />
          </EmptyMedia>
          <EmptyTitle>No blog sources yet</EmptyTitle>
          <EmptyDescription>
            Connect a Hashnode, dev.to, or Medium account to populate /blogs.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <a href="/lalit/blog-sources/new">Add blog source</a>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  async function handleDelete(id: string) {
    const state = await deleteBlogSource(id);
    if (state.status === "success") {
      toast.success("Blog source deleted.");
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }

  function handleSync(id: string) {
    startSync(async () => {
      const state = await syncBlogSourceNow(id);
      if (state.status === "success") {
        toast.success(state.message ?? "Synced.");
        router.refresh();
      } else if (state.status === "error") {
        toast.error(state.message);
      }
    });
  }

  const columns: ColumnDef<SerializedBlogSource>[] = [
    {
      id: "name",
      header: "Name",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-card-foreground">{row.name}</span>
          {!row.isActive && <Badge variant="secondary">Inactive</Badge>}
          {!row.isVisible && <Badge variant="secondary">Hidden</Badge>}
        </div>
      ),
      sortValue: (row) => row.name,
    },
    {
      id: "platform",
      header: "Platform",
      cell: (row) => <span className="capitalize">{row.platform}</span>,
      sortValue: (row) => row.platform,
    },
    { id: "username", header: "Username", cell: (row) => row.username },
    {
      id: "lastSynced",
      header: "Last synced",
      cell: (row) =>
        row.lastSyncedAt
          ? formatDistanceToNow(new Date(row.lastSyncedAt), { addSuffix: true })
          : "Never",
      hideBelow: "md",
    },
    {
      id: "actions",
      header: "",
      className: "w-0",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sync now"
            disabled={isSyncing}
            onClick={() => handleSync(row._id)}
          >
            <RefreshCw aria-hidden className={isSyncing ? "animate-spin" : ""} />
          </Button>
          <RowActions
            editHref={`/lalit/blog-sources/${row._id}` as Route}
            onDelete={() => handleDelete(row._id)}
            deleteConfirmTitle={`Delete "${row.name}"?`}
            deleteConfirmDescription="This also removes any synced posts from this source."
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={sources}
      columns={columns}
      getRowId={(row) => row._id}
      searchValue={(row) => `${row.name} ${row.username}`}
      searchPlaceholder="Search blog sources…"
      toolbar={
        <Button asChild>
          <a href="/lalit/blog-sources/new">
            <Plus aria-hidden />
            Add source
          </a>
        </Button>
      }
    />
  );
}
