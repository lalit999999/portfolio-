import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { getAdminSocials } from "@/lib/admin/socials";
import { SocialList } from "./social-list";

export default async function Page() {
  const socials = await getAdminSocials();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Socials"
        description="Shown in the site footer. Drag to reorder."
        actions={
          <Button asChild>
            <a href="/lalit/socials/new">
              <Plus aria-hidden />
              Add social link
            </a>
          </Button>
        }
      />
      <SocialList socials={socials} />
    </div>
  );
}
