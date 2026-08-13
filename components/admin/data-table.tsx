"use client";

// STUB — Phase 4 Session A owns this file. Do not edit it from another session.
import type * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ColumnDef<T> {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  headerClassName?: string;
  hideBelow?: "sm" | "md" | "lg";
}

export interface DataTableProps<T> {
  rows: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  searchValue?: (row: T) => string;
  searchPlaceholder?: string;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  toolbar?: React.ReactNode;
  isLoading?: boolean;
}

export function DataTable<T>({ rows, getRowId }: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Row</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={getRowId(row)}>
            <TableCell>{getRowId(row)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
