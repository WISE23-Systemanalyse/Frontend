import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FriendsTab } from "./tabs/friends-tab";
import { HistoryTab } from "./tabs/history-tab";
import { TicketsTab } from "./tabs/tickets-tab";

export default function ProfileTabs() {
  return (
    <Tabs defaultValue="friends" className="space-y-4">
      <TabsList className="bg-[#1C1C1C] border-gray-800">
        <TabsTrigger 
          value="friends"
          className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400"
        >
          Freunde
        </TabsTrigger>
        <TabsTrigger 
          value="history"
          className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400"
        >
          Historie
        </TabsTrigger>
        <TabsTrigger 
          value="settings"
          className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400"
        >
          Einstellungen
        </TabsTrigger>
        <TabsTrigger
          value="tickets"
          className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400"
        >
          Tickets
        </TabsTrigger>
      </TabsList>
      <TabsContent value="friends">
        <FriendsTab />
      </TabsContent>
      <TabsContent value="history">
        <HistoryTab />
      </TabsContent>
      <TabsContent value="tickets">
        <TicketsTab />
      </TabsContent>
    </Tabs>
  );
}
