import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getAdmin } from "@/lib/admin/guard";
import {
  getAdminPlaygroundMembers,
  getAdminPlaygroundMessages,
  type PlaygroundMessageFilter,
} from "@/lib/admin/playground";
import { PlaygroundMessages } from "./playground-messages";
import { PlaygroundMembers } from "./playground-members";

const VALID_FILTERS: PlaygroundMessageFilter[] = ["all", "pinned", "hidden"];

export default async function Page(props: PageProps<"/lalit/playground">) {
  const searchParams = await props.searchParams;
  const rawFilter = Array.isArray(searchParams.filter)
    ? searchParams.filter[0]
    : searchParams.filter;
  const filter: PlaygroundMessageFilter = VALID_FILTERS.includes(
    rawFilter as PlaygroundMessageFilter
  )
    ? (rawFilter as PlaygroundMessageFilter)
    : "all";
  const rawTab = Array.isArray(searchParams.tab) ? searchParams.tab[0] : searchParams.tab;
  const search = (Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q) ?? "";

  const viewer = await getAdmin();
  const [messages, members] = await Promise.all([
    getAdminPlaygroundMessages({ filter, search }),
    getAdminPlaygroundMembers(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Playground"
        description="Moderate live chat: pin, hide, delete messages, and manage members."
      />
      <Tabs defaultValue={rawTab === "members" ? "members" : "messages"}>
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        <TabsContent value="messages" className="mt-4">
          <PlaygroundMessages messages={messages} filter={filter} search={search} />
        </TabsContent>
        <TabsContent value="members" className="mt-4">
          <PlaygroundMembers members={members} viewerId={viewer?.id ?? ""} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
