import { useState } from "react";
import { Users, Utensils } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Separator } from "components/ui/separator";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";

const statusStyles = {
  Free: "bg-green-100 text-green-800",
  Occupied: "bg-red-100 text-red-800",
};

export function TableDetailsModal({ isOpen, onClose, table, onTableUpdate }) {
  const [occupancy, setOccupancy] = useState(table?.currentOccupancy || 0);

  if (!table) return null;

  const handleUpdateTable = () => {
    const updatedTable = {
      ...table,
      currentOccupancy: occupancy,
    };
    onTableUpdate(updatedTable);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Table {table.title} Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Status:</span>
            <Badge className={statusStyles[table.status]}>{table.status}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Capacity:</span>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{table.capacity} people</span>
            </div>
          </div>
          <Separator />
          <div>
            <Label htmlFor="occupancy">Current Occupancy</Label>
            <Input
              id="occupancy"
              type="number"
              value={occupancy}
              onChange={(e) => setOccupancy(Number(e.target.value))}
              min={0}
              max={table.capacity}
            />
          </div>
          {table.status === "Occupied" && (
            <div>
              <span className="font-semibold flex items-center mb-2">
                <Utensils className="w-4 h-4 mr-2" />
                Current Order:
              </span>
              <ul className="list-disc list-inside ml-6">
                <li>Butter Chicken</li>
                <li>Naan</li>
                <li>Mango Lassi</li>
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdateTable}>Update Table</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
