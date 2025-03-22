import { Users, Utensils, QrCode } from "lucide-react";

import { Card, CardContent } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";

const statusStyles = {
  Free: "bg-green-100 text-green-800",
  Occupied: "bg-red-100 text-red-800",
};

export function TableCard({ table, onClick, onQuickAction, onGenerateQR }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
        <h3 className="text-2xl font-bold mb-2">{table.title}</h3>
        <Badge className={statusStyles[table.status]}>{table.status}</Badge>
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4 mr-1" />
          <span>Capacity: {table.capacity}</span>
        </div>
        {table.status === "Occupied" && (
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <Utensils className="w-4 h-4 mr-1" />
            <span>Occupancy: {table.currentOccupancy}</span>
          </div>
        )}
        <div className="flex mt-4 space-x-2">
          <Button size="sm" variant="outline" onClick={onClick}>
            Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onGenerateQR(table._id);
            }}
          >
            <QrCode className="w-4 h-4 mr-1" />
            QR
          </Button>
        </div>
        <div className="flex mt-2 space-x-2">
          {table.status !== "Free" && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction(table._id, "Free");
              }}
            >
              Mark Free
            </Button>
          )}
          {table.status !== "Occupied" && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction(table._id, "Occupied");
              }}
            >
              Mark Occupied
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
