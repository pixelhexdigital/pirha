import { Users, Utensils, QrCode, Trash2, MoreVertical, Eye } from "lucide-react";
import { twMerge } from "tailwind-merge";

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

const statusConfig = {
  Free: {
    badge: "bg-success/10 text-success border-success/20 hover:bg-success/10",
    tint: "bg-success/[0.04]",
  },
  Occupied: {
    badge:
      "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
    tint: "bg-destructive/[0.04]",
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
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={twMerge(
        "cursor-pointer transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        config.tint
      )}
    >
      <CardContent className="relative flex flex-col items-center justify-center p-4 text-center">
        <div className="absolute top-2 right-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Table ${table.title} actions`}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClick}>
                <Eye className="mr-2 size-4" />
                Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onQrCodeDownload({ selectedTables: table._id });
                }}
              >
                <QrCode className="mr-2 size-4" />
                Download QR
              </DropdownMenuItem>
              {table.status !== "Free" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAction(table._id, "Free");
                  }}
                >
                  Mark free
                </DropdownMenuItem>
              )}
              {table.status !== "Occupied" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAction(table._id, "Occupied");
                  }}
                >
                  Mark occupied
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(table._id);
                }}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="mt-2 mb-2 text-2xl font-bold">{table.title}</h3>
        <Badge variant="outline" className={config.badge}>
          <span className="mr-1.5 rounded-full size-1.5 bg-current" />
          {table.status}
        </Badge>
        <div className="flex items-center mt-3 text-sm text-muted-foreground">
          <Users className="w-4 h-4 mr-1" />
          <span>Seats {table.capacity}</span>
        </div>
        {table.status === "Occupied" && (
          <div className="flex items-center mt-1.5 text-sm text-muted-foreground">
            <Utensils className="w-4 h-4 mr-1" />
            <span>
              {table.currentOccupancy}/{table.capacity} seated
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
