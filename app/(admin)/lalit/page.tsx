import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatCard } from "@/components/admin/stat-card";
import { getAdminStats } from "@/lib/admin/stats";
import type { AdminStatCard } from "@/types/admin";
import {
  MessagesPerWeekChart,
  SkillsByCategoryChart,
  PlaygroundActivityChart,
  ProjectsByCategoryChart,
} from "./stats-charts";
import { RecentActivity } from "./recent-activity";
import { TopProjects } from "./top-projects";

export default async function Page(props: PageProps<"/lalit">) {
  await props.params;
  const stats = await getAdminStats();
  const { counts } = stats;

  const statCards: AdminStatCard[] = [
    {
      key: "projects",
      label: "Projects",
      value: counts.projectsTotal,
      hint: `${counts.projectsFeatured} featured · ${counts.projectsHidden} hidden`,
      href: "/lalit/projects",
    },
    { key: "skills", label: "Skills", value: counts.skills, href: "/lalit/skills" },
    {
      key: "certifications",
      label: "Certifications",
      value: counts.certificationsTotal,
      hint: `${counts.certificationsExpired} expired`,
      href: "/lalit/certifications",
    },
    {
      key: "education",
      label: "Education",
      value: counts.education,
      href: "/lalit/education",
    },
    { key: "socials", label: "Socials", value: counts.socials, href: "/lalit/socials" },
    {
      key: "blogPosts",
      label: "Blog posts",
      value: counts.blogPosts,
      href: "/lalit/blog-sources",
    },
    {
      key: "unreadMessages",
      label: "Unread messages",
      value: counts.unreadMessages,
      href: "/lalit/inbox",
    },
    {
      key: "playgroundMessages",
      label: "Playground messages",
      value: counts.playgroundMessages,
      href: "/lalit/playground",
    },
    {
      key: "playgroundMembers",
      label: "Playground members",
      value: counts.playgroundMembers,
      href: "/lalit/playground",
    },
    {
      key: "bannedUsers",
      label: "Banned users",
      value: counts.bannedUsers,
      href: "/lalit/playground",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Dashboard"
        description="Everything you need to know about the site, at a glance."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => (
          <StatCard key={card.key} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MessagesPerWeekChart data={stats.charts.messagesPerWeek} />
        <SkillsByCategoryChart data={stats.charts.skillsByCategory} />
        <PlaygroundActivityChart data={stats.charts.playgroundActivityDaily} />
        <ProjectsByCategoryChart data={stats.charts.projectsByCategory} />
      </div>

      <RecentActivity
        messages={stats.recentMessages}
        playgroundMessages={stats.recentPlaygroundMessages}
      />

      <TopProjects projects={stats.topProjects} />
    </div>
  );
}
