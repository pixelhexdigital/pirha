import { Users, Utensils, QrCode, Trash2, MoreVertical } from "lucide-react";

import { Card, CardContent } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "components/ui/tooltip";

const statusConfig = {
  Free: {
    badge: "bg-success/10 text-success border-success/20 hover:bg-success/10",
    border: "border-t-4 border-t-success",
  },
  Occupied: {
    badge:
      "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
    border: "border-t-4 border-t-destructive",
  },
};

export function TableCard({
  table,
  onClick,
  onQuickAction,
  onDelete,
  onQrCodeDownload,
}) {
  const config = statusConfig[table.status] || statusConfig.Free;

  return (
    <TooltipProvider delayDuration={0}>
      <Card
        className={`hover:shadow-md transition-all duration-200 ${config.border}`}
      >
        <CardContent className="p-4 flex flex-col items-center justify-center text-center relative">
          <div className="absolute top-2 right-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="size-8 p-0">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onClick}>Details</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onQrCodeDownload({ selectedTables: table._id });
                  }}
                >
                  <QrCode className="size-4 mr-2" />
                  Download QR
                </DropdownMenuItem>
                {table.status !== "Free" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAction(table._id, "Free");
                    }}
                  >
                    Mark Free
                  </DropdownMenuItem>
                )}
                {table.status !== "Occupied" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAction(table._id, "Occupied");
                    }}
                  >
                    Mark Occupied
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(table._id);
                  }}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="text-2xl font-bold mb-2 mt-2">{table.title}</h3>
          <Badge variant="outline" className={config.badge}>
            <span className="size-1.5 rounded-full bg-current mr-1.5" />
            {table.status}
          </Badge>
          <div className="flex items-center mt-3 text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-1" />
            <span>Capacity: {table.capacity}</span>
          </div>
          {table.status === "Occupied" && (
            <div className="flex items-center mt-1.5 text-sm text-muted-foreground">
              <Utensils className="w-4 h-4 mr-1" />
              <span>Occupancy: {table.currentOccupancy}</span>
            </div>
          )}
          <div className="flex mt-4 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={onClick}>
                  Details
                </Button>
              </TooltipTrigger>
              <TooltipContent>View table details</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQrCodeDownload({ selectedTables: table._id });
                  }}
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  QR
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download QR code</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
