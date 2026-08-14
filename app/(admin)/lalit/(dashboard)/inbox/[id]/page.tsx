import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminMessage } from "@/lib/admin/messages";
import { MessageDetail } from "../message-detail";

export default async function Page(props: PageProps<"/lalit/inbox/[id]">) {
  const { id } = await props.params;
  const message = await getAdminMessage(id);

  if (!message) notFound();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Message" />
      <MessageDetail message={message} />
    </div>
  );
}
