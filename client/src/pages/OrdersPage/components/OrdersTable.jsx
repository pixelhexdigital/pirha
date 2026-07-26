import { useState, Fragment } from "react";
import { ChevronDown, MoreHorizontal, Receipt, XCircle, Check } from "lucide-react";
import { format } from "date-fns";

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
import { numberToCurrency } from "lib/helper";
import {
  getElapsedLabel,
  getUrgencyTint,
  getUrgencyTextColor,
} from "lib/orderTiming";

const getActionItems = (status) => {
  const actions = [];
  if (status === "new") actions.push({ label: "Mark as Ready", icon: Check });
  if (status === "ready")
    actions.push({ label: "Mark as Served", icon: Check });
  if (status === "served")
    actions.push({ label: "Generate Bill", icon: Receipt });
  if (status !== "billed" && status !== "cancelled")
    actions.push({ label: "Cancel Order", icon: XCircle, danger: true });

  return actions;
};

const statusMap = {
  "Mark as Ready": "Ready",
  "Mark as Served": "Served",
  "Generate Bill": "Billed",
  "Cancel Order": "Cancelled",
};

export function OrdersTable({ data, onAction, isLoading, isUpdating }) {
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
    if (!newStatus) return;
    await onAction(newStatus, order?._id);
  };

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-16 h-4" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-16 h-5 rounded-full" />
                <Skeleton className="w-8 h-8 ml-auto rounded" />
              </div>
            ))}
          </div>
        ) : data?.length === 0 ? (
          <EmptyState
            title="No orders here"
            description="Orders in this state will show up here as service moves."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]"></TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Placed</TableHead>
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
                const isExpanded = expandedRows.includes(order._id);
                const actions = getActionItems(orderStatus);
                const itemCount = order.items?.length || 0;
                // Aging only signals urgency for orders still in service
                // (waiting on the kitchen or the pass); closed orders stay calm.
                const isActive =
                  orderStatus === "new" || orderStatus === "ready";
                const rowTint = isActive ? getUrgencyTint(order.createdAt) : "";
                const timeColor = isActive
                  ? getUrgencyTextColor(order.createdAt)
                  : "text-muted-foreground";

                return (
                  <Fragment key={order._id}>
                    <TableRow
                      className={`cursor-pointer hover:bg-muted/50 ${rowTint}`}
                      onClick={() => toggleRow(order._id)}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9"
                          aria-label={
                            isExpanded ? "Hide order details" : "Show order details"
                          }
                          aria-expanded={isExpanded}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(order._id);
                          }}
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold capitalize leading-tight">
                          Table {order?.table}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          #{order._id?.slice(-6)}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </TableCell>
                      <TableCell
                        className={`whitespace-nowrap text-sm ${timeColor}`}
                      >
                        {getElapsedLabel(order.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium tabular-nums">
                        {numberToCurrency(totalAmount, "INR", 2)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {actions.length > 0 ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-9"
                                aria-label="Order actions"
                                disabled={isUpdating}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions.map(({ label, icon: Icon, danger }, idx) => (
                                <DropdownMenuItem
                                  key={idx}
                                  disabled={isUpdating}
                                  className={
                                    danger ? "text-destructive focus:text-destructive" : ""
                                  }
                                  onClick={() => handleAction(label, order)}
                                >
                                  <Icon className="w-4 h-4 mr-2" />
                                  {label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={7} className="p-0">
                          <div className="px-6 py-4 border-t bg-muted/30">
                            <div className="grid gap-6 md:grid-cols-2">
                              <div>
                                <h4 className="mb-3 text-sm font-semibold">
                                  Order details
                                </h4>
                                <div className="text-sm space-y-1.5">
                                  <p>
                                    <span className="text-muted-foreground">
                                      Customer:
                                    </span>{" "}
                                    {order?.customer?.firstName || "—"}
                                  </p>
                                  <p>
                                    <span className="text-muted-foreground">
                                      Phone:
                                    </span>{" "}
                                    {order?.customer?.number || "—"}
                                  </p>
                                  <p>
                                    <span className="text-muted-foreground">
                                      Placed:
                                    </span>{" "}
                                    {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm aa")}
                                  </p>
                                  <p className="font-mono text-xs text-muted-foreground">
                                    {order._id}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h4 className="mb-3 text-sm font-semibold">Items</h4>
                                <div className="space-y-2">
                                  {order?.items?.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex justify-between text-sm"
                                    >
                                      <span>
                                        {item?.quantity}x {item?.title}
                                      </span>
                                      <span>
                                        {numberToCurrency(item.price, "INR", 2)}
                                      </span>
                                    </div>
                                  ))}
                                  <div className="pt-2 mt-2 font-medium border-t">
                                    <div className="flex justify-between">
                                      <span>Total</span>
                                      <span>
                                        {numberToCurrency(totalAmount, "INR", 2)}
                                      </span>
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
