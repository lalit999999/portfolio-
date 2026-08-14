import type { Route } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { listCertifications } from "@/lib/admin/certifications";
import { requireAdmin } from "@/lib/admin/guard";

import { CertificationsTable } from "./certifications-table";

export default async function Page(props: PageProps<"/lalit/certifications">) {
  await props.params;
  await requireAdmin();

  const certifications = await listCertifications();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Certifications"
        description="Manage certifications shown on the public site."
        actions={
          <Button asChild>
            <Link href={"/lalit/certifications/new" as Route}>
              <Plus aria-hidden /> New certification
            </Link>
          </Button>
        }
      />
      <CertificationsTable initialCertifications={certifications} />
    </div>
  );
}
