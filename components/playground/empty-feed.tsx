import { MessageCircle } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { PlaygroundViewer } from "@/types/playground";

export function EmptyFeed({ viewer }: { viewer: PlaygroundViewer | null }) {
  return (
    <Empty className="border border-dashed border-border/70 bg-card/50 p-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MessageCircle aria-hidden />
        </EmptyMedia>
        <EmptyTitle>Nothing here yet</EmptyTitle>
        <EmptyDescription>
          {viewer
            ? "Be the first to leave a message below."
            : "Sign in with GitHub to be the first to say something."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
