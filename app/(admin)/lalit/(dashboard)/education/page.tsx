import type { Route } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { listEducation } from "@/lib/admin/education";
import { requireAdmin } from "@/lib/admin/guard";

import { EducationTable } from "./education-table";

export default async function Page(props: PageProps<"/lalit/education">) {
  await props.params;
  await requireAdmin();

  const education = await listEducation();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Education"
        description="Manage education entries shown on the public site."
        actions={
          <Button asChild>
            <Link href={"/lalit/education/new" as Route}>
              <Plus aria-hidden /> New entry
            </Link>
          </Button>
        }
      />
      <EducationTable initialEducation={education} />
    </div>
  );
}
