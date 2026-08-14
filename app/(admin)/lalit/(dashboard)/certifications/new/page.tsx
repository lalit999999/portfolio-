import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CertificationForm } from "../certification-form";
import { getNextCertificationOrder } from "@/lib/admin/certifications";
import { requireAdmin } from "@/lib/admin/guard";

import { createCertification } from "../actions";

export default async function Page(
  props: PageProps<"/lalit/certifications/new">
) {
  await props.params;
  await requireAdmin();

  const order = await getNextCertificationOrder();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="New certification"
        description="Add a certification to the portfolio."
      />
      <CertificationForm
        mode="create"
        defaultValues={{
          title: "",
          issuer: "",
          issueDate: new Date(),
          expiryDate: undefined,
          credentialId: "",
          credentialUrl: "",
          imageUrl: "",
          skills: [],
          color: "info",
          order,
          isVisible: true,
        }}
        action={createCertification}
      />
    </div>
  );
}
