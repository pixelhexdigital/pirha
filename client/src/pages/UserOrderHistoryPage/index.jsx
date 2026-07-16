import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  UtensilsCrossed,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { numberToCurrency } from "lib/helper";
import { useGetCustomerOrdersQuery } from "api/orderApi";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "components/StatusBadge";
import EmptyState from "components/EmptyState";

const UserOrderHistoryPage = () => {
  const navigate = useNavigate();
  const { tableId, restaurantId } = useParams();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetCustomerOrdersQuery({
    page,
    limit: 20,
  });

  const orders = data?.orders || [];
  const hasNextPage = data?.hasNextPage || false;

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="container flex items-center h-16 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-xl font-semibold">Order History</h1>
        </div>
      </div>

      <main className="container max-w-md mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-xl bg-card shadow-sm p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-5 w-16 ml-auto" />
                    <Skeleton className="h-3 w-12 ml-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isError || orders.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="No orders yet"
            description="Your order history will appear here"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Accordion type="single" collapsible key={order._id}>
                <AccordionItem
                  value={order._id}
                  className="border rounded-xl bg-card shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex flex-1 justify-between items-center">
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            Order #{order._id.slice(-6)}
                          </p>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>{formatDate(order.createdAt)}</span>
                          <Clock className="ml-3 mr-1 h-3 w-3" />
                          <span>{formatTime(order.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {numberToCurrency(order.totalAmount, "INR", 0)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.items?.length}{" "}
                          {order.items?.length === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <Separator className="mb-3" />
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div
                          key={item._id || idx}
                          className="flex justify-between text-sm"
                        >
                          <div>
                            <span>{item.title || item.name}</span>
                            <span className="text-muted-foreground">
                              {" "}
                              x {item.quantity}
                            </span>
                          </div>
                          <p>
                            {numberToCurrency(
                              (item.price || 0) * item.quantity,
                              "INR",
                              0
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between font-medium">
                      <p>Total</p>
                      <p>{numberToCurrency(order.totalAmount, "INR", 0)}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() =>
                        navigate(
                          `/bill/${tableId}/${restaurantId}?orderId=${order._id}`
                        )
                      }
                    >
                      View Bill Details
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}

            {hasNextPage && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setPage((p) => p + 1)}
              >
                Load More
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserOrderHistoryPage;
