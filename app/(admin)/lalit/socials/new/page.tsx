import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SocialForm } from "../social-form";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Add social link" />
      <SocialForm />
    </div>
  );
}
