// STUB — Phase 4 Session A owns this file. Do not edit it from another session.
import { Hammer } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default async function Page(props: PageProps<"/lalit/certifications">) {
  await props.params;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Certifications" />
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
