import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EducationForm } from "../education-form";
import { getNextEducationOrder } from "@/lib/admin/education";
import { requireAdmin } from "@/lib/admin/guard";

import { createEducation } from "../actions";

export default async function Page(props: PageProps<"/lalit/education/new">) {
  await props.params;
  await requireAdmin();

  const order = await getNextEducationOrder();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="New education entry"
        description="Add an education entry to the portfolio."
      />
      <EducationForm
        mode="create"
        defaultValues={{
          institution: "",
          degree: "",
          field: "",
          startDate: new Date(),
          endDate: undefined,
          grade: "",
          description: "",
          order,
          isVisible: true,
        }}
        action={createEducation}
      />
    </div>
  );
}
