import { Clock, CheckCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { twMerge } from "tailwind-merge";

const statusStyles = {
  new: "bg-info/10 text-info border-info/20",
  preparing: "bg-warning/10 text-warning border-warning/20",
  ready: "bg-success/10 text-success border-success/20",
};

export function KitchenOrdersView({ orders, onStatusChange }) {
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

    if (minutes > 15) return "border-l-4 border-l-destructive";
    if (minutes > 5) return "border-l-4 border-l-warning";
    return "border-l-4 border-l-success";
  };

  const getTimeColor = (orderTime) => {
    const diff = new Date().getTime() - new Date(orderTime).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes > 15) return "text-destructive animate-pulse";
    if (minutes > 5) return "text-warning";
    return "text-muted-foreground";
  };

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
            <Badge
              variant="outline"
              className={twMerge(
                "capitalize",
                statusStyles[order?.status?.toLowerCase()]
              )}
            >
              {order?.status}
            </Badge>
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
