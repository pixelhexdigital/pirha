import { Clock, CheckCircle, UtensilsCrossed } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "components/EmptyState";
import StatusBadge from "components/StatusBadge";
import { twMerge } from "tailwind-merge";

function KitchenOrderSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <Skeleton className="h-4 w-24 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-10 w-full mt-4 rounded-md" />
      </CardContent>
    </Card>
  );
}

export function KitchenOrdersView({ orders, onStatusChange, isLoading }) {
  const getTimeDifference = (orderTime) => {
    const diff = new Date().getTime() - new Date(orderTime).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const hoursAndMinutes = minutes % 60;
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0)
      return `${hours}h ${hoursAndMinutes}m ago`;
    if (minutes > 0) return `${minutes} min ago`;
    return "Just now";
  };

  const getUrgencyStyle = (orderTime) => {
    const diff = new Date().getTime() - new Date(orderTime).getTime();
    const minutes = Math.floor(diff / 60000);

    // Aging orders get a full-border + faint background tint (never a
    // side-stripe). The pulsing time label carries the rest of the signal.
    if (minutes > 15) return "border-destructive/40 bg-destructive/[0.04]";
    if (minutes > 5) return "border-warning/40 bg-warning/[0.04]";
    return "";
  };

  const getTimeColor = (orderTime) => {
    const diff = new Date().getTime() - new Date(orderTime).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes > 15) return "text-destructive animate-pulse";
    if (minutes > 5) return "text-warning";
    return "text-muted-foreground";
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <KitchenOrderSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        title="No orders in kitchen"
        description="New orders will appear here automatically"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders?.map((order) => (
        <Card
          key={order._id}
          className={twMerge(
            "flex flex-col hover:shadow-md transition-shadow duration-200",
            getUrgencyStyle(order?.createdAt)
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium capitalize">
                Table {order?.table} - #{order._id?.slice(-4)}
              </CardTitle>
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {order?.items?.length} items
              </Badge>
            </div>
            <StatusBadge status={order?.status} />
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div
              className={twMerge(
                "flex items-center mb-4 text-sm",
                getTimeColor(order?.createdAt)
              )}
            >
              <Clock className="w-4 h-4 mr-1.5" />
              {getTimeDifference(order?.createdAt)}
            </div>
            <ul className="space-y-2">
              {order?.items.map((item, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">
                    {item?.quantity}x {item?.title}
                  </span>
                  {item?.notes && (
                    <p className="ml-5 text-muted-foreground">{item.notes}</p>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-4 space-x-2">
              {order?.status?.toLowerCase() === "new" && (
                <Button
                  size="lg"
                  onClick={() => onStatusChange(order?._id, "Ready")}
                  className="w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Ready
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
