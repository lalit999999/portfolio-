import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BlogSourceForm } from "../blog-source-form";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Add blog source" />
      <BlogSourceForm isLastActive={false} />
    </div>
  );
}
