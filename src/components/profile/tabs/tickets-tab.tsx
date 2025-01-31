import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TicketsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktuelle Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center text-gray-500 py-8">
            Noch keine Tickets gebucht
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
