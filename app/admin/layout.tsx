import { redirect } from "next/navigation";

import { requireUser, isAdmin } from "@/lib/auth/session";

// Defense in depth: middleware already guards /admin/:path*, but a guard
// here costs nothing if the matcher is ever edited wrong.
export default async function AdminLayout(props: LayoutProps<"/admin">) {
  const user = await requireUser();
  if (!isAdmin(user)) {
    redirect("/");
  }

  return props.children;
}
