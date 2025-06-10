import { Clock, CheckCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusStyles = {
  new: "bg-blue-100 text-blue-800 capitalize",
  preparing: "bg-yellow-100 text-yellow-800 capitalize",
  ready: "bg-green-100 text-green-800 capitalize",
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
      return `${hours} hour${hours > 1 ? "s" : ""} ${hoursAndMinutes} minute${hoursAndMinutes > 1 ? "s" : ""}
     ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders?.map((order) => (
        <Card
          key={order._id}
          className="flex flex-col hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-in-out delay-75 border-primary/5 hover:border-primary/20 shadow-sm"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 flex-wrap gap-2 mb-2">
            <CardTitle className="text-sm font-medium capitalize">
              Table {order?.table} - Order #{order._id?.slice(-4)}
            </CardTitle>
            <Badge
              variant="secondary"
              className={statusStyles[order?.status?.toLowerCase()]}
            >
              {order?.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
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
              {/* {order?.status?.toLowerCase() === "new" && (
                <Button
                  size="sm"
                  onClick={() => onStatusChange(order?._id, "Preparing")}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Start Preparing
                </Button>
              )} */}
              {order?.status?.toLowerCase() === "new" && (
                <Button
                  size="sm"
                  onClick={() => onStatusChange(order?._id, "Ready")}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark as Ready
                </Button>
              )}
              {/* <Button size="sm" variant="outline">
                <AlertCircle className="w-4 h-4 mr-1" />
                Issue
              </Button> */}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
