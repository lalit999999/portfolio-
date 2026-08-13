// FROZEN — Phase 4 Step 0. All three sessions read this. Nobody edits it during Phase 4.
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  FolderKanban,
  GraduationCap,
  Inbox,
  MessagesSquare,
  Newspaper,
  Share2,
  Sparkles,
  UserRound,
} from "lucide-react";

export interface AdminNavItem {
  href: Route;
  label: string;
  icon: LucideIcon;
  group: "Content" | "Site" | "Community";
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/lalit/projects" as Route, label: "Projects", icon: FolderKanban, group: "Content" },
  { href: "/lalit/skills" as Route, label: "Skills", icon: Sparkles, group: "Content" },
  { href: "/lalit/certifications" as Route, label: "Certifications", icon: Award, group: "Content" },
  { href: "/lalit/education" as Route, label: "Education", icon: GraduationCap, group: "Content" },

  { href: "/lalit/profile" as Route, label: "Profile", icon: UserRound, group: "Site" },
  { href: "/lalit/socials" as Route, label: "Socials", icon: Share2, group: "Site" },
  { href: "/lalit/blog-sources" as Route, label: "Blog sources", icon: Newspaper, group: "Site" },

  { href: "/lalit/inbox" as Route, label: "Inbox", icon: Inbox, group: "Community" },
  { href: "/lalit/playground" as Route, label: "Playground", icon: MessagesSquare, group: "Community" },
];
