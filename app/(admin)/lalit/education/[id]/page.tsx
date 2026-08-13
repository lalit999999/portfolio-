import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EducationForm } from "../education-form";
import { getEducation } from "@/lib/admin/education";
import { requireAdmin } from "@/lib/admin/guard";

import { updateEducation } from "../actions";

export default async function Page(props: PageProps<"/lalit/education/[id]">) {
  const { id } = await props.params;
  await requireAdmin();

  const entry = await getEducation(id);
  if (!entry) notFound();

  const boundUpdate = updateEducation.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Edit education entry" description={entry.institution} />
      <EducationForm
        mode="edit"
        defaultValues={{
          institution: entry.institution,
          degree: entry.degree,
          field: entry.field,
          startDate: entry.startDate,
          endDate: entry.endDate,
          grade: entry.grade ?? "",
          description: entry.description ?? "",
          order: entry.order,
          isVisible: entry.isVisible,
        }}
        action={boundUpdate}
      />
    </div>
  );
}
