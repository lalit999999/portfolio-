import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProjectForm } from "@/components/admin/project-form";
import { getProject, getProjectCategories } from "@/lib/admin/projects";
import { requireAdmin } from "@/lib/admin/guard";

import { updateProject } from "../actions";

export default async function Page(props: PageProps<"/lalit/projects/[id]">) {
  const { id } = await props.params;
  await requireAdmin();

  const [project, categoryOptions] = await Promise.all([
    getProject(id),
    getProjectCategories(),
  ]);

  if (!project) notFound();

  const boundUpdate = updateProject.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Edit project"
        description={project.title}
      />
      <ProjectForm
        mode="edit"
        projectId={project._id}
        categoryOptions={categoryOptions}
        viewCount={project.viewCount}
        defaultValues={{
          title: project.title,
          slug: project.slug,
          summary: project.summary,
          description: project.description,
          tech: project.tech,
          category: project.category ?? "",
          imageUrl: project.imageUrl ?? "",
          githubUrl: project.githubUrl ?? "",
          liveUrl: project.liveUrl ?? "",
          featured: project.featured,
          startDate: project.startDate,
          order: project.order,
          isVisible: project.isVisible,
        }}
        action={boundUpdate}
      />
    </div>
  );
}
