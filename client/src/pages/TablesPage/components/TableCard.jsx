import { Card, CardContent } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { Users } from "lucide-react";

const statusStyles = {
  Free: "bg-green-100 text-green-800",
  Occupied: "bg-red-100 text-red-800",
  Reserved: "bg-yellow-100 text-yellow-800",
};

export function TableCard({ table, onClick }) {
  return (
    <Card
      className="transition-shadow cursor-pointer hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center p-4 text-center">
        <h3 className="mb-2 text-2xl font-bold">{table.title.toUpperCase()}</h3>
        <Badge className={statusStyles[table.status]}>{table.status}</Badge>
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4 mr-1" />
          <span>Capacity: {table.capacity}</span>
        </div>
      </CardContent>
    </Card>
  );
}
