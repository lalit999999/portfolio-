import type { Route } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { listProjects } from "@/lib/admin/projects";
import { requireAdmin } from "@/lib/admin/guard";

import { ProjectsTable } from "./projects-table";

export default async function Page(props: PageProps<"/lalit/projects">) {
  await props.params;
  await requireAdmin();

  const projects = await listProjects();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Projects"
        description="Manage the projects shown on the public site."
        actions={
          <Button asChild>
            <Link href={"/lalit/projects/new" as Route}>
              <Plus aria-hidden /> New project
            </Link>
          </Button>
        }
      />
      <ProjectsTable initialProjects={projects} />
    </div>
  );
}
