"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function PlaygroundError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60svh] max-w-3xl items-center px-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangle aria-hidden />
          </EmptyMedia>
          <EmptyTitle>The playground hiccuped</EmptyTitle>
          <EmptyDescription>
            Couldn&apos;t reach the feed just now — this is usually a brief
            database blip. Try again in a moment.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => reset()}>
            <RefreshCw aria-hidden />
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
