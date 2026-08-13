import type { Route } from "next";

import { getBlogSources, getProfile } from "@/lib/data";
import { NavbarClient, type NavItem } from "@/components/site/navbar-client";
import { AuthStatus } from "@/components/auth/auth-status";

export async function Navbar() {
  const [profile, blogSources] = await Promise.all([
    getProfile(),
    getBlogSources(),
  ]);

  const showBlogs = blogSources.some((source) => source.isActive);

  const navItems: NavItem[] = [
    { label: "Projects", href: "/projects" as Route },
    { label: "Skills", href: "/skills" as Route },
    { label: "Certifications", href: "/certifications" as Route },
    { label: "Playground", href: "/playground" as Route },
    ...(showBlogs ? [{ label: "Blogs", href: "/blogs" as Route }] : []),
    { label: "Contact", href: "/contact" as Route },
  ];

  return (
    <NavbarClient
      name={profile?.name ?? "Portfolio"}
      navItems={navItems}
      authStatus={<AuthStatus />}
    />
  );
}
