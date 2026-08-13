import { COLLECTION_REGISTRY } from "@/lib/admin/collections";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatCard } from "@/components/admin/stat-card";
import type { AdminCollection, AdminStatCard } from "@/types/admin";

const DASHBOARD_COLLECTIONS: AdminCollection[] = [
  "projects",
  "skills",
  "certifications",
  "educations",
  "socials",
  "blogsources",
];

export default async function Page() {
  const counts = await Promise.all(
    DASHBOARD_COLLECTIONS.map((key) =>
      COLLECTION_REGISTRY[key].model.countDocuments()
    )
  );

  const stats: AdminStatCard[] = DASHBOARD_COLLECTIONS.map((key, i) => ({
    key,
    label: COLLECTION_REGISTRY[key].label,
    value: counts[i],
  }));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Dashboard"
        description="An overview of the site's content."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.key}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            href={stat.href}
          />
        ))}
      </div>
    </div>
  );
}
