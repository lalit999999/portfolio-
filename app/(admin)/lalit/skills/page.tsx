import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listSkillCategories, listSkills } from "@/lib/admin/skills";
import { requireAdmin } from "@/lib/admin/guard";

import { SkillsTabs } from "./skills-tabs";

export default async function Page(props: PageProps<"/lalit/skills">) {
  await props.params;
  await requireAdmin();

  const [categories, skills] = await Promise.all([
    listSkillCategories(),
    listSkills(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Skills"
        description="Categories group skills on the public skills page."
      />
      <SkillsTabs initialCategories={categories} initialSkills={skills} />
    </div>
  );
}
