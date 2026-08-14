import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminMessages, getUnreadMessageCount, type InboxFilter } from "@/lib/admin/messages";
import { InboxList } from "./inbox-list";

const VALID_FILTERS: InboxFilter[] = ["unread", "all", "archived"];

export default async function Page(props: PageProps<"/lalit/inbox">) {
  const searchParams = await props.searchParams;
  const rawFilter = Array.isArray(searchParams.filter)
    ? searchParams.filter[0]
    : searchParams.filter;
  const filter: InboxFilter = VALID_FILTERS.includes(rawFilter as InboxFilter)
    ? (rawFilter as InboxFilter)
    : "unread";

  const [messages, unreadCount] = await Promise.all([
    getAdminMessages(filter),
    getUnreadMessageCount(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Inbox"
        description="Messages submitted through the public contact form."
      />
      <InboxList messages={messages} filter={filter} unreadCount={unreadCount} />
    </div>
  );
}
