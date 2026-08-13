"use client";

import type * as React from "react";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

const HIDE_BELOW_CLASS: Record<NonNullable<ColumnDef<unknown>["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  searchValue,
  searchPlaceholder = "Search...",
  pageSize = 25,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
  toolbar,
  isLoading = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(
    null
  );
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!searchValue || !search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((row) => searchValue(row).toLowerCase().includes(q));
  }, [rows, search, searchValue]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const column = columns.find((c) => c.id === sort.id);
    if (!column?.sortValue) return filtered;
    const { sortValue } = column;
    const sign = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = sortValue(a);
      const bv = sortValue(b);
      if (av < bv) return -1 * sign;
      if (av > bv) return 1 * sign;
      return 0;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  function toggleSort(columnId: string) {
    setPage(1);
    setSort((prev) => {
      if (prev?.id !== columnId) return { id: columnId, dir: "asc" };
      if (prev.dir === "asc") return { id: columnId, dir: "desc" };
      return null;
    });
  }

  const showToolbar = Boolean(searchValue) || Boolean(toolbar);

  return (
    <div className="flex flex-col gap-4">
      {showToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {searchValue ? (
            <div className="relative w-full max-w-xs">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                className="pl-8"
              />
            </div>
          ) : (
            <div />
          )}
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="sticky top-0 bg-card">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
                    column.headerClassName
                  )}
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.id)}
                      className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                    >
                      {column.header}
                      {sort?.id === column.id ? (
                        sort.dir === "asc" ? (
                          <ArrowUp aria-hidden className="size-3.5" />
                        ) : (
                          <ArrowDown aria-hidden className="size-3.5" />
                        )
                      ) : (
                        <ArrowUpDown
                          aria-hidden
                          className="size-3.5 text-muted-foreground/50"
                        />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <Empty className="border-0 py-10">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Search aria-hidden />
                      </EmptyMedia>
                      <EmptyTitle>{emptyTitle}</EmptyTitle>
                      {emptyDescription && (
                        <EmptyDescription>{emptyDescription}</EmptyDescription>
                      )}
                    </EmptyHeader>
                    {emptyAction && <EmptyContent>{emptyAction}</EmptyContent>}
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
                        column.className
                      )}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
              />
            </PaginationItem>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(p);
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={currentPage === pageCount}
                className={
                  currentPage === pageCount ? "pointer-events-none opacity-50" : ""
                }
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(pageCount, p + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
