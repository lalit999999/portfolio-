// Placeholder — per-collection admin UI is outside Session A's scope
// (auth, shell, shared primitives). Real content lands with this collection's
// admin page in a later session.
import { Hammer } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default async function Page(props: PageProps<"/lalit/certifications/new">) {
  await props.params;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="New certification" />
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Hammer aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Coming in Phase 4</EmptyTitle>
          <EmptyDescription>This section is not built yet.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
