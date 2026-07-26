import { useState } from "react";
import { Clock, CheckCircle, UtensilsCrossed } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "components/EmptyState";
import StatusBadge from "components/StatusBadge";
import { ButtonSpinner } from "components/Spinner";
import {
  getElapsedLabel,
  getUrgencyTint,
  getUrgencyTextColor,
} from "lib/orderTiming";
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

export function KitchenOrdersView({
  orders,
  onStatusChange,
  isLoading,
  isUpdating,
}) {
  // Track the ticket whose update is in flight so only its button spins,
  // while every other "Mark as Ready" simply disables to block double-fires.
  const [pendingId, setPendingId] = useState(null);

  const handleMarkReady = async (orderId) => {
    setPendingId(orderId);
    try {
      await onStatusChange(orderId, "Ready");
    } finally {
      setPendingId(null);
    }
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
            getUrgencyTint(order?.createdAt)
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
                getUrgencyTextColor(order?.createdAt)
              )}
            >
              <Clock className="w-4 h-4 mr-1.5" />
              {getElapsedLabel(order?.createdAt)}
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
                  onClick={() => handleMarkReady(order?._id)}
                  disabled={isUpdating}
                  aria-label={`Mark order for table ${order?.table} as ready`}
                  className="w-full"
                >
                  {pendingId === order?._id ? (
                    <ButtonSpinner />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Ready
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
