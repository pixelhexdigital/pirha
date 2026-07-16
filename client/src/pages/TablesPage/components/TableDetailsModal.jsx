import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { ButtonSpinner } from "components/Spinner";
import { Separator } from "components/ui/separator";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { useUpdateTableByIdMutation } from "api/tableApi";
import { errorToast, successToast } from "lib/helper";

const MAX_CAPACITY = 50;

const statusStyles = {
  Free: "bg-success/10 text-success border-success/20",
  Occupied: "bg-destructive/10 text-destructive border-destructive/20",
};

export function TableDetailsModal({ isOpen, onClose, table, onTableUpdate }) {
  const [occupancy, setOccupancy] = useState(0);
  const [capacity, setCapacity] = useState(1);
  const [updateTableById, { isLoading }] = useUpdateTableByIdMutation();

  // Sync when the modal is reused for a different table.
  useEffect(() => {
    setOccupancy(table?.currentOccupancy || 0);
    setCapacity(table?.capacity || 1);
  }, [table]);

  if (!table) return null;

  const handleUpdateTable = async () => {
    const safeCapacity = Math.max(1, Math.min(capacity, MAX_CAPACITY));
    const safeOccupancy = Math.max(0, Math.min(occupancy, safeCapacity));
    try {
      await updateTableById({
        tableId: table._id,
        capacity: safeCapacity,
        currentOccupancy: safeOccupancy,
      }).unwrap();
      onTableUpdate({
        ...table,
        capacity: safeCapacity,
        currentOccupancy: safeOccupancy,
      });
      successToast({ message: "Table updated" });
      onClose();
    } catch (error) {
      errorToast({ error, message: "Failed to update table" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Table {table.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="outline" className={statusStyles[table.status]}>
              {table.status}
            </Badge>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="capacity"
                className="block mb-2 text-sm font-medium"
              >
                Seats
              </Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={MAX_CAPACITY}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </div>
            <div>
              <Label
                htmlFor="occupancy"
                className="block mb-2 text-sm font-medium"
              >
                Occupancy
              </Label>
              <Input
                id="occupancy"
                type="number"
                min={0}
                max={capacity}
                value={occupancy}
                onChange={(e) => setOccupancy(Number(e.target.value))}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Guests currently seated (0–{capacity}).
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpdateTable} disabled={isLoading}>
            {isLoading ? <ButtonSpinner /> : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
