import { UserRound } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { getAdminProfile } from "@/lib/admin/profile";
import { ProfileForm } from "./profile-form";
import { ResumeManager } from "./resume-manager";

export default async function Page() {
  const profile = await getAdminProfile();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Profile"
        description="The single source of truth for the site's hero, bio, and resume."
      />

      {profile ? (
        <>
          <ProfileForm profile={profile} />
          <ResumeManager resumeUrl={profile.resumeUrl} />
        </>
      ) : (
        <>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserRound aria-hidden />
              </EmptyMedia>
              <EmptyTitle>No profile yet</EmptyTitle>
              <EmptyDescription>
                Create the profile document to start editing your site&apos;s hero and bio.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
          <ProfileForm profile={null} />
        </>
      )}
    </div>
  );
}
