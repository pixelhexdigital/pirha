import { useState, Fragment } from "react";
import {
  ChevronDown,
  // Clock,
  MoreHorizontal,
  Receipt,
  XCircle,
  Check,
  // AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

import { Badge } from "components/ui/badge";
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

const statusStyles = {
  new: "bg-blue-100 text-blue-800",
  preparing: "bg-yellow-100 text-yellow-800",
  ready: "bg-green-100 text-green-800",
  served: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
  billed: "bg-indigo-100 text-indigo-800",
};

const getActionItems = (status, paymentStatus) => {
  const actions = [];
  // if (status === "new") actions.push({ label: "Start Preparing", icon: Clock });
  if (status === "new") actions.push({ label: "Mark as Ready", icon: Check });
  if (status === "ready")
    actions.push({ label: "Mark as Served", icon: Check });
  if (status === "served")
    actions.push({ label: "Generate Bill", icon: Receipt });
  if (status === "billed" && paymentStatus === "unpaid")
    actions.push({ label: "Record Payment", icon: Receipt });
  if (status !== "billed" && status !== "cancelled")
    actions.push({ label: "Cancel Order", icon: XCircle, danger: true });

  // actions.push({ label: "Report Issue", icon: AlertTriangle });

  return actions;
};

const statusMap = {
  "Start Preparing": "preparing",
  "Mark as Ready": "Ready",
  "Mark as Served": "Served",
  "Generate Bill": "Billed",
  // "Record Payment": "paid",
  "Cancel Order": "Cancelled",
};

export function OrdersTable({ data, onAction }) {
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
        {data?.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p className="text-sm">No orders found</p>
            <p className="text-xs">
              Try changing the filters or check back later.
            </p>
          </div>
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
                    <TableRow>
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
                        {/* {format(new Date(order.createdAt), "dd MMM yyyy HH:mm")} */}
                        {/* // first show date and and after that show time in 12
                        hour format */}
                        {format(new Date(order.createdAt), "dd MMM yyyy")}{" "}
                        {format(new Date(order.createdAt), "hh:mm aa")}
                      </TableCell>
                      <TableCell>₹{totalAmount?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusStyles[orderStatus] || ""}
                        >
                          {order.status}
                        </Badge>
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
                                      className={danger ? "text-red-600" : ""}
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
                        <TableCell colSpan={8} className="p-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="mb-2 font-semibold">
                                Order Details
                              </h4>
                              <div className="text-sm">
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
                              <h4 className="mb-2 font-semibold">Items</h4>
                              <div className="space-y-2">
                                {order?.items?.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between text-sm"
                                  >
                                    <span>
                                      {item?.quantity}x {item?.title}
                                    </span>
                                    <span>₹{item.price?.toFixed(2)}</span>
                                  </div>
                                ))}
                                <div className="pt-2 mt-2 font-medium border-t">
                                  <div className="flex justify-between">
                                    <span>Total</span>
                                    <span>₹{totalAmount?.toFixed(2)}</span>
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
