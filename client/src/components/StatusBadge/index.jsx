import { Badge } from "components/ui/badge";
import { twMerge } from "tailwind-merge";

const STATUS_CONFIG = {
  new: {
    dotColor: "bg-info",
    badge: "bg-info/10 text-info border-info/20 hover:bg-info/10",
  },
  preparing: {
    dotColor: "bg-warning",
    badge: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10",
  },
  ready: {
    dotColor: "bg-success",
    badge:
      "bg-success/10 text-success border-success/20 hover:bg-success/10",
  },
  served: {
    dotColor: "bg-purple-500",
    badge:
      "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/10",
  },
  cancelled: {
    dotColor: "bg-destructive",
    badge:
      "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
  },
  billed: {
    dotColor: "bg-indigo-500",
    badge:
      "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10",
  },
};

const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toLowerCase();
  const config = STATUS_CONFIG[normalizedStatus];

  return (
    <Badge
      variant="outline"
      className={twMerge(
        "gap-1.5 font-medium",
        config?.badge
      )}
    >
      <span
        className={twMerge(
          "size-1.5 rounded-full shrink-0",
          config?.dotColor || "bg-muted-foreground"
        )}
      />
      {status}
    </Badge>
  );
};

export { STATUS_CONFIG };
export default StatusBadge;
