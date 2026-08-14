import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminSocial } from "@/lib/admin/socials";
import { SocialForm } from "../social-form";

export default async function Page(props: PageProps<"/lalit/socials/[id]">) {
  const { id } = await props.params;
  const social = await getAdminSocial(id);

  if (!social) notFound();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title={`Edit ${social.name}`} />
      <SocialForm social={social} />
    </div>
  );
}
