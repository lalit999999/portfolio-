"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import { GripVertical, Plus, ArrowUpDown, GraduationCap } from "lucide-react";
import { toast } from "sonner";

import type { SerializedEducation } from "@/types/models";
import { DataTable, type ColumnDef } from "@/components/admin/data-table";
import { SortableList } from "@/components/admin/sortable-list";
import { RowActions } from "@/components/admin/row-actions";
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

import { deleteEducation, toggleEducationVisibility } from "./actions";

async function reorderEducation(ids: string[]) {
  const res = await fetch("/api/admin/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collection: "educations", ids }),
  });
  if (!res.ok) throw new Error("Reorder request failed.");
  return res.json();
}

function formatRange(entry: SerializedEducation) {
  const start = new Date(entry.startDate).getFullYear();
  const end = entry.endDate ? new Date(entry.endDate).getFullYear() : "Present";
  return `${start} – ${end}`;
}

export function EducationTable({
  initialEducation,
}: {
  initialEducation: SerializedEducation[];
}) {
  const router = useRouter();
  const [reorderMode, setReorderMode] = useState(false);

  function refresh() {
    router.refresh();
  }

  async function handleReordered(ids: string[]) {
    try {
      await reorderEducation(ids);
      toast.success("Order updated.");
      refresh();
    } catch {
      toast.error("Couldn't save the new order.");
    }
  }

  async function handleToggleVisibility(id: string) {
    const state = await toggleEducationVisibility(id);
    if (state.status === "error") toast.error(state.message);
    else refresh();
  }

  async function handleDelete(id: string) {
    const state = await deleteEducation(id);
    if (state.status === "error") toast.error(state.message);
    else {
      toast.success("Entry deleted.");
      refresh();
    }
  }

  const columns: ColumnDef<SerializedEducation>[] = [
    {
      id: "institution",
      header: "Institution",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.institution}</span>
          <span className="text-xs text-muted-foreground">
            {row.degree} · {row.field}
          </span>
        </div>
      ),
      sortValue: (row) => row.institution,
    },
    {
      id: "range",
      header: "Duration",
      cell: (row) => formatRange(row),
      hideBelow: "sm",
    },
    {
      id: "grade",
      header: "Grade",
      cell: (row) => row.grade || <span className="text-muted-foreground">—</span>,
      hideBelow: "md",
    },
    {
      id: "visible",
      header: "Visible",
      cell: (row) => (
        <Switch
          checked={row.isVisible}
          onCheckedChange={() => handleToggleVisibility(row._id)}
          aria-label={`Toggle visibility for ${row.institution}`}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end">
          <RowActions
            editHref={`/lalit/education/${row._id}` as Route}
            onDelete={() => handleDelete(row._id)}
            deleteConfirmTitle={`Delete "${row.institution}"?`}
            deleteConfirmDescription="This permanently deletes the education entry."
          />
        </div>
      ),
    },
  ];

  if (initialEducation.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <GraduationCap aria-hidden />
          </EmptyMedia>
          <EmptyTitle>No education entries yet</EmptyTitle>
          <EmptyDescription>Add your first entry to see it here.</EmptyDescription>
        </EmptyHeader>
        <Button asChild>
          <Link href={"/lalit/education/new" as Route}>
            <Plus aria-hidden /> New entry
          </Link>
        </Button>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
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
          items={initialEducation}
          getId={(row) => row._id}
          collection="educations"
          onReordered={handleReordered}
          renderItem={(row) => (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
              <GripVertical className="size-4 text-muted-foreground" aria-hidden />
              <span className="flex-1 font-medium">{row.institution}</span>
              <Badge variant="secondary">order {row.order}</Badge>
            </div>
          )}
        />
      ) : (
        <DataTable
          rows={initialEducation}
          columns={columns}
          getRowId={(row) => row._id}
          searchValue={(row) => `${row.institution} ${row.degree} ${row.field}`}
          searchPlaceholder="Search education…"
        />
      )}
    </div>
  );
}
