import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsTab() {
  return (
    <Card className="bg-[#1C1C1C] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Einstellungen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-gray-400">
          Einstellungen werden hier angezeigt
        </div>
      </CardContent>
    </Card>
  );
}