import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminBlogSources } from "@/lib/admin/blogSources";
import { BlogSourceList } from "./blog-source-list";

export default async function Page() {
  const sources = await getAdminBlogSources();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Blog sources"
        description="Publications synced into the /blogs page."
      />
      <BlogSourceList sources={sources} />
    </div>
  );
}
