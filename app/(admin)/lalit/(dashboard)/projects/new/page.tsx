import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProjectForm } from "@/components/admin/project-form";
import { getNextProjectOrder, getProjectCategories } from "@/lib/admin/projects";
import { requireAdmin } from "@/lib/admin/guard";

import { createProject } from "../actions";

export default async function Page(props: PageProps<"/lalit/projects/new">) {
  await props.params;
  await requireAdmin();

  const [order, categoryOptions] = await Promise.all([
    getNextProjectOrder(),
    getProjectCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="New project"
        description="Add a project to the portfolio."
      />
      <ProjectForm
        mode="create"
        categoryOptions={categoryOptions}
        defaultValues={{
          title: "",
          slug: "",
          summary: "",
          description: "",
          tech: [],
          category: "",
          imageUrl: "",
          githubUrl: "",
          liveUrl: "",
          featured: false,
          order,
          isVisible: true,
        }}
        action={createProject}
      />
    </div>
  );
}
