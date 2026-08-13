"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import { GripVertical, Plus, FolderKanban, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

import type { SerializedProject } from "@/types/models";
import { DataTable, type ColumnDef } from "@/components/admin/data-table";
import { SortableList } from "@/components/admin/sortable-list";
import { RowActions } from "@/components/admin/row-actions";
import { ProjectDeleteDialog } from "@/components/admin/project-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

import {
  deleteProject,
  duplicateProject,
  toggleProjectFeatured,
  toggleProjectVisibility,
} from "./actions";

type FeaturedFilter = "all" | "featured" | "hidden";

async function reorderProjects(ids: string[]) {
  const res = await fetch("/api/admin/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collection: "projects", ids }),
  });
  if (!res.ok) throw new Error("Reorder request failed.");
  return res.json();
}

export function ProjectsTable({
  initialProjects,
}: {
  initialProjects: SerializedProject[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<FeaturedFilter>("all");
  const [reorderMode, setReorderMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SerializedProject | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (filter === "featured") return initialProjects.filter((p) => p.featured);
    if (filter === "hidden") return initialProjects.filter((p) => !p.isVisible);
    return initialProjects;
  }, [initialProjects, filter]);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleReordered(ids: string[]) {
    try {
      await reorderProjects(ids);
      toast.success("Order updated.");
      refresh();
    } catch {
      toast.error("Couldn't save the new order.");
    }
  }

  async function handleToggleVisibility(id: string) {
    const state = await toggleProjectVisibility(id);
    if (state.status === "error") toast.error(state.message);
    else refresh();
  }

  async function handleToggleFeatured(id: string) {
    const state = await toggleProjectFeatured(id);
    if (state.status === "error") toast.error(state.message);
    else refresh();
  }

  async function handleDuplicate(id: string) {
    const state = await duplicateProject(id);
    if (state.status === "error") toast.error(state.message);
    else {
      toast.success("Project duplicated.");
      refresh();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const state = await deleteProject(deleteTarget._id);
    if (state.status === "error") toast.error(state.message);
    else {
      toast.success("Project deleted.");
      setDeleteTarget(null);
      refresh();
    }
  }

  const columns: ColumnDef<SerializedProject>[] = [
    {
      id: "title",
      header: "Title",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.title}</span>
          <span className="text-xs text-muted-foreground">/{row.slug}</span>
        </div>
      ),
      sortValue: (row) => row.title,
    },
    {
      id: "category",
      header: "Category",
      cell: (row) => row.category || <span className="text-muted-foreground">—</span>,
      hideBelow: "md",
    },
    {
      id: "featured",
      header: "Featured",
      cell: (row) => (
        <Switch
          checked={row.featured}
          onCheckedChange={() => handleToggleFeatured(row._id)}
          aria-label={`Toggle featured for ${row.title}`}
        />
      ),
      hideBelow: "sm",
    },
    {
      id: "visible",
      header: "Visible",
      cell: (row) => (
        <Switch
          checked={row.isVisible}
          onCheckedChange={() => handleToggleVisibility(row._id)}
          aria-label={`Toggle visibility for ${row.title}`}
        />
      ),
    },
    {
      id: "views",
      header: "Views",
      cell: (row) => row.viewCount.toLocaleString(),
      sortValue: (row) => row.viewCount,
      hideBelow: "lg",
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end">
          <RowActions
            editHref={`/lalit/projects/${row._id}` as Route}
            extra={[
              { label: "Duplicate", onClick: () => handleDuplicate(row._id) },
              { label: "Delete", onClick: () => setDeleteTarget(row) },
            ]}
          />
        </div>
      ),
    },
  ];

  if (initialProjects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderKanban aria-hidden />
          </EmptyMedia>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>
            Create your first project to see it here.
          </EmptyDescription>
        </EmptyHeader>
        <Button asChild>
          <Link href={"/lalit/projects/new" as Route}>
            <Plus aria-hidden /> New project
          </Link>
        </Button>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "featured", "hidden"] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={filter === value ? "default" : "outline"}
              onClick={() => setFilter(value)}
            >
              {value === "all" ? "All" : value === "featured" ? "Featured" : "Hidden"}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          variant={reorderMode ? "default" : "outline"}
          onClick={() => setReorderMode((v) => !v)}
        >
          <ArrowUpDown aria-hidden /> {reorderMode ? "Done reordering" : "Reorder"}
        </Button>
      </div>

      {reorderMode ? (
        <SortableList
          items={filtered}
          getId={(row) => row._id}
          collection="projects"
          onReordered={handleReordered}
          renderItem={(row) => (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
              <GripVertical className="size-4 text-muted-foreground" aria-hidden />
              <span className="flex-1 font-medium">{row.title}</span>
              <Badge variant="secondary">order {row.order}</Badge>
            </div>
          )}
        />
      ) : (
        <DataTable
          rows={filtered}
          columns={columns}
          getRowId={(row) => row._id}
          searchValue={(row) => `${row.title} ${row.slug} ${row.category ?? ""}`}
          searchPlaceholder="Search projects…"
          emptyTitle="No matches"
          emptyDescription="No projects match this filter."
        />
      )}

      <ProjectDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        projectTitle={deleteTarget?.title ?? ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}
