import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Separator } from "components/ui/separator";
import { Users, Clock, Utensils, DollarSign, AlertCircle } from "lucide-react";
import { ManageTableDialog } from "./ManageTableDialog";

const statusStyles = {
  Free: "bg-green-100 text-green-800",
  Occupied: "bg-red-100 text-red-800",
  Reserved: "bg-yellow-100 text-yellow-800",
};

export function TableDetailsModal({ isOpen, onClose, table, onTableUpdate }) {
  if (!table) return null;

  // Mock data for demonstration purposes
  const currentOrder = {
    items: ["Butter Chicken", "Naan", "Mango Lassi"],
    total: 450,
    startTime: new Date(Date.now() - 45 * 60000), // 45 minutes ago
  };

  const reservationInfo = {
    name: "John Doe",
    time: new Date(Date.now() + 2 * 60 * 60000), // 2 hours from now
    partySize: 4,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Table {table.title.toUpperCase()} Details</DialogTitle>
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
          {table.status === "Occupied" && (
            <>
              <div>
                <span className="flex items-center mb-2 font-semibold">
                  <Utensils className="w-4 h-4 mr-2" />
                  Current Order:
                </span>
                <ul className="ml-6 list-disc list-inside">
                  {currentOrder.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Order Total:</span>
                <span>₹{currentOrder.total}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span className="mr-2 font-semibold">Seated for:</span>
                {Math.floor(
                  (Date.now() - currentOrder.startTime.getTime()) / 60000
                )}{" "}
                minutes
              </div>
            </>
          )}
          {table.status === "Reserved" && (
            <>
              <div>
                <span className="flex items-center mb-2 font-semibold">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Upcoming Reservation:
                </span>
                <p>Name: {reservationInfo.name}</p>
                <p>Time: {reservationInfo.time.toLocaleTimeString()}</p>
                <p>Party Size: {reservationInfo.partySize}</p>
              </div>
            </>
          )}
          {table.status === "Free" && (
            <div className="flex items-center text-green-600">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>Available for seating</span>
            </div>
          )}
        </div>
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <ManageTableDialog table={table} onTableUpdate={onTableUpdate}>
            <Button>Manage Table</Button>
          </ManageTableDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
