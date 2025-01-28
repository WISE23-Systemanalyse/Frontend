import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FriendsTab() {
  return (
    <Card className="bg-[#1C1C1C] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Freunde</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center text-gray-400 py-8">
            Füge deine ersten Kinofreunde hinzu
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
