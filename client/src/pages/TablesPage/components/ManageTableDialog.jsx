import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";

export function ManageTableDialog({ children, table, onTableUpdate }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(table.status);
  const [capacity, setCapacity] = useState(table.capacity.toString());

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  const handleCapacityChange = (event) => {
    setCapacity(event.target.value);
  };

  const handleSave = () => {
    const updatedTable = {
      ...table,
      status,
      capacity: Number.parseInt(capacity),
    };
    onTableUpdate(updatedTable);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Table {table.title.toUpperCase()}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Occupied">Occupied</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="capacity" className="text-right">
              Capacity
            </Label>
            <Input
              id="capacity"
              value={capacity}
              onChange={handleCapacityChange}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
