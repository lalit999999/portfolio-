import type { Route } from "next";
import Link from "next/link";
import { Compass, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60svh] max-w-3xl items-center px-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Compass aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The page you&apos;re looking for doesn&apos;t exist or may have
            been moved.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/">
                <Home aria-hidden />
                Back home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={"/projects" as Route}>View projects</Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
