import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CertificationForm } from "../certification-form";
import { getCertification } from "@/lib/admin/certifications";
import { requireAdmin } from "@/lib/admin/guard";

import { updateCertification } from "../actions";

export default async function Page(
  props: PageProps<"/lalit/certifications/[id]">
) {
  const { id } = await props.params;
  await requireAdmin();

  const certification = await getCertification(id);
  if (!certification) notFound();

  const boundUpdate = updateCertification.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Edit certification" description={certification.title} />
      <CertificationForm
        mode="edit"
        defaultValues={{
          title: certification.title,
          issuer: certification.issuer,
          issueDate: certification.issueDate,
          expiryDate: certification.expiryDate,
          credentialId: certification.credentialId ?? "",
          credentialUrl: certification.credentialUrl ?? "",
          imageUrl: certification.imageUrl ?? "",
          skills: certification.skills,
          color: certification.color,
          order: certification.order,
          isVisible: certification.isVisible,
        }}
        action={boundUpdate}
      />
    </div>
  );
}
