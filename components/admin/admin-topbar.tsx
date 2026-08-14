"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import type { PlaygroundViewer } from "@/types/playground";

export interface AdminTopbarProps {
  user: PlaygroundViewer;
}

export function AdminTopbar({ user }: AdminTopbarProps) {
  const pathname = usePathname();
  const current = ADMIN_NAV.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4"
      )}
    >
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={"/lalit" as Route}>Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {current ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{current.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          View site
          <ExternalLink aria-hidden className="size-3.5" />
        </Link>
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
