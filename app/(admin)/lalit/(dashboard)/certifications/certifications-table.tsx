"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import { GripVertical, Plus, ArrowUpDown, Award } from "lucide-react";
import { toast } from "sonner";

import type { SerializedCertification } from "@/types/models";
import { certColorMap } from "@/lib/icons";
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

import {
  deleteCertification,
  toggleCertificationVisibility,
} from "./actions";

async function reorderCertifications(ids: string[]) {
  const res = await fetch("/api/admin/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collection: "certifications", ids }),
  });
  if (!res.ok) throw new Error("Reorder request failed.");
  return res.json();
}

function isExpired(cert: SerializedCertification) {
  return !!cert.expiryDate && new Date(cert.expiryDate) < new Date();
}

export function CertificationsTable({
  initialCertifications,
}: {
  initialCertifications: SerializedCertification[];
}) {
  const router = useRouter();
  const [reorderMode, setReorderMode] = useState(false);

  function refresh() {
    router.refresh();
  }

  async function handleReordered(ids: string[]) {
    try {
      await reorderCertifications(ids);
      toast.success("Order updated.");
      refresh();
    } catch {
      toast.error("Couldn't save the new order.");
    }
  }

  async function handleToggleVisibility(id: string) {
    const state = await toggleCertificationVisibility(id);
    if (state.status === "error") toast.error(state.message);
    else refresh();
  }

  async function handleDelete(id: string) {
    const state = await deleteCertification(id);
    if (state.status === "error") toast.error(state.message);
    else {
      toast.success("Certification deleted.");
      refresh();
    }
  }

  const columns: ColumnDef<SerializedCertification>[] = [
    {
      id: "title",
      header: "Title",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.title}</span>
          <span className="text-xs text-muted-foreground">{row.issuer}</span>
        </div>
      ),
      sortValue: (row) => row.title,
    },
    {
      id: "color",
      header: "Color",
      cell: (row) => {
        const swatch = certColorMap[row.color];
        return (
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`size-3 rounded-full border ${swatch.bg} ${swatch.border}`}
              aria-hidden
            />
            <span className="text-xs text-muted-foreground">{row.color}</span>
          </span>
        );
      },
      hideBelow: "sm",
    },
    {
      id: "issued",
      header: "Issued",
      cell: (row) => new Date(row.issueDate).toLocaleDateString(),
      hideBelow: "md",
    },
    {
      id: "expiry",
      header: "Expiry",
      cell: (row) =>
        row.expiryDate ? (
          <span className="flex items-center gap-2">
            {new Date(row.expiryDate).toLocaleDateString()}
            {isExpired(row) && <Badge variant="destructive">Expired</Badge>}
          </span>
        ) : (
          <span className="text-muted-foreground">No expiry</span>
        ),
      hideBelow: "lg",
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
      id: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end">
          <RowActions
            editHref={`/lalit/certifications/${row._id}` as Route}
            onDelete={() => handleDelete(row._id)}
            deleteConfirmTitle={`Delete "${row.title}"?`}
            deleteConfirmDescription="This permanently deletes the certification."
          />
        </div>
      ),
    },
  ];

  if (initialCertifications.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Award aria-hidden />
          </EmptyMedia>
          <EmptyTitle>No certifications yet</EmptyTitle>
          <EmptyDescription>
            Add your first certification to see it here.
          </EmptyDescription>
        </EmptyHeader>
        <Button asChild>
          <Link href={"/lalit/certifications/new" as Route}>
            <Plus aria-hidden /> New certification
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
          items={initialCertifications}
          getId={(row) => row._id}
          collection="certifications"
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
          rows={initialCertifications}
          columns={columns}
          getRowId={(row) => row._id}
          searchValue={(row) => `${row.title} ${row.issuer}`}
          searchPlaceholder="Search certifications…"
        />
      )}
    </div>
  );
}
