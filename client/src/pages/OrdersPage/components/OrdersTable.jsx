import { useState, Fragment } from "react";
import {
  ChevronDown,
  MoreHorizontal,
  Receipt,
  XCircle,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

import StatusBadge from "components/StatusBadge";
import EmptyState from "components/EmptyState";
import { Skeleton } from "components/ui/skeleton";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";

const getActionItems = (status, paymentStatus) => {
  const actions = [];
  if (status === "new") actions.push({ label: "Mark as Ready", icon: Check });
  if (status === "ready")
    actions.push({ label: "Mark as Served", icon: Check });
  if (status === "served")
    actions.push({ label: "Generate Bill", icon: Receipt });
  if (status === "billed" && paymentStatus === "unpaid")
    actions.push({ label: "Record Payment", icon: Receipt });
  if (status !== "billed" && status !== "cancelled")
    actions.push({ label: "Cancel Order", icon: XCircle, danger: true });

  return actions;
};

const statusMap = {
  "Start Preparing": "preparing",
  "Mark as Ready": "Ready",
  "Mark as Served": "Served",
  "Generate Bill": "Billed",
  "Cancel Order": "Cancelled",
};

const STATUS_BORDER_COLORS = {
  new: "border-l-info",
  preparing: "border-l-warning",
  ready: "border-l-success",
  served: "border-l-purple-500",
  cancelled: "border-l-destructive",
  billed: "border-l-indigo-500",
};

export function OrdersTable({ data, onAction, isLoading }) {
  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRow = (orderId) => {
    setExpandedRows((current) =>
      current.includes(orderId)
        ? current.filter((_id) => _id !== orderId)
        : [...current, orderId]
    );
  };

  const handleAction = async (label, order) => {
    const newStatus = statusMap[label];
    if (!newStatus) {
      return;
    }

    await onAction(newStatus, order?._id);
  };

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : data?.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="Try changing the filters or check back later."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]"></TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((order) => {
                const totalAmount = order.items?.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );
                const orderStatus = order.status?.toLowerCase();
                const paymentStatus = order.paymentStatus?.toLowerCase();

                return (
                  <Fragment key={order._id}>
                    <TableRow
                      className={twMerge(
                        "hover:bg-muted/50 border-l-4",
                        STATUS_BORDER_COLORS[orderStatus] || "border-l-transparent"
                      )}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => toggleRow(order._id)}
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              expandedRows.includes(order._id)
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {order._id?.slice(-8)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {order?.table}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), "dd MMM yyyy")}{" "}
                        {format(new Date(order.createdAt), "hh:mm aa")}
                      </TableCell>
                      <TableCell>{"\u20B9"}{totalAmount?.toFixed(2)}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      {orderStatus?.toLowerCase() !== "billed" &&
                        orderStatus?.toLowerCase() !== "cancelled" && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-8 h-8 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {getActionItems(orderStatus, paymentStatus).map(
                                  ({ label, icon: Icon, danger }, idx) => (
                                    <DropdownMenuItem
                                      key={idx}
                                      className={
                                        danger ? "text-destructive" : ""
                                      }
                                      onClick={() => handleAction(label, order)}
                                    >
                                      <Icon className="w-4 h-4 mr-2" />
                                      {label}
                                    </DropdownMenuItem>
                                  )
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                    </TableRow>
                    {expandedRows.includes(order._id) && (
                      <TableRow>
                        <TableCell colSpan={8} className="p-0">
                          <div className="bg-muted/30 p-5 mx-1 my-1 rounded-lg">
                            <div className="grid gap-6 md:grid-cols-2">
                              <div>
                                <h4 className="mb-3 font-semibold text-sm">
                                  Order Details
                                </h4>
                                <div className="text-sm space-y-1.5">
                                  <p>
                                    <span className="text-muted-foreground">
                                      Customer:
                                    </span>{" "}
                                    {order?.customer?.firstName}
                                  </p>
                                  <p>
                                    <span className="text-muted-foreground">
                                      Phone:
                                    </span>{" "}
                                    {order?.customer?.number}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h4 className="mb-3 font-semibold text-sm">
                                  Items
                                </h4>
                                <div className="space-y-2">
                                  {order?.items?.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex justify-between text-sm"
                                    >
                                      <span>
                                        {item?.quantity}x {item?.title}
                                      </span>
                                      <span>{"\u20B9"}{item.price?.toFixed(2)}</span>
                                    </div>
                                  ))}
                                  <div className="pt-2 mt-2 font-medium border-t">
                                    <div className="flex justify-between">
                                      <span>Total</span>
                                      <span>{"\u20B9"}{totalAmount?.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
