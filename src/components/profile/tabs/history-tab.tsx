import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HistoryTab() {
  return (
    <Card className="bg-[#1C1C1C] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Historie</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-400 py-8">
          Keine bisherigen Besuche
        </div>
      </CardContent>
    </Card>
  );
}
