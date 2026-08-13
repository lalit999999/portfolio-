import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminBlogSource, countActiveBlogSources } from "@/lib/admin/blogSources";
import { BLOG_PLATFORMS } from "@/models/BlogSource";
import { BlogSourceForm } from "../blog-source-form";

export default async function Page(props: PageProps<"/lalit/blog-sources/[id]">) {
  const { id } = await props.params;
  const source = await getAdminBlogSource(id);

  if (!source) notFound();

  const activeElsewhere = await countActiveBlogSources(id);
  const isLastActive = source.isActive && activeElsewhere === 0;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title={`Edit ${source.name}`} />
      <BlogSourceForm source={source} isLastActive={isLastActive} platforms={BLOG_PLATFORMS} />
    </div>
  );
}
