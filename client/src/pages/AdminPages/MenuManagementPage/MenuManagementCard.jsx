import { LucideEdit2, MoreVerticalIcon, Trash2, ImageIcon } from "lucide-react";

import { cn } from "lib/utils";
import { Card } from "components/ui/card";
import { Button } from "components/ui/button";
import { Switch } from "components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";

/**
 * One card for both categories and menu items. The availability Switch is the
 * primary in-service action ("86 an item"); Edit/Delete live in the overflow.
 */
const MenuManagementCard = ({
  imageUrl,
  title,
  subtitle,
  meta,
  footerLeft,
  isActive,
  isToggling = false,
  onToggleAvailability,
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Delete",
}) => {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md",
        !isActive && "opacity-70"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title || ""}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground/40">
            <ImageIcon className="size-8" />
            <span className="text-xs">No image</span>
          </div>
        )}
        <div className="absolute right-2 top-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8 bg-card"
                aria-label="More actions"
              >
                <MoreVerticalIcon className="h-4 w-4 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <LucideEdit2 className="mr-2 h-4 w-4" />
                {editLabel}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteLabel}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{title}</h3>
            {subtitle && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {meta}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0 text-sm">{footerLeft}</div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "text-sm",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {isActive ? "Available" : "Unavailable"}
            </span>
            <Switch
              checked={!!isActive}
              onCheckedChange={onToggleAvailability}
              disabled={isToggling}
              aria-label={`Mark ${title || "this"} ${
                isActive ? "unavailable" : "available"
              }`}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MenuManagementCard;
