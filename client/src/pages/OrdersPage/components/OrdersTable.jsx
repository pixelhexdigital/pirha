import { useState, Fragment } from "react";
import {
  ChevronDown,
  Clock,
  MoreHorizontal,
  Receipt,
  XCircle,
  Check,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

// Sample data - replace with real API data
const orders = [
  {
    id: "667d259cea57625b239186e",
    tableNo: "A-1",
    date: "2024-01-27T08:41:00",
    amount: 140.0,
    status: "new",
    paymentStatus: "unpaid",
    customer: {
      name: "John Doe",
      phone: "+91 98765 43210",
    },
    items: [
      {
        name: "Butter Chicken",
        quantity: 1,
        price: 90.0,
      },
      {
        name: "Naan",
        quantity: 2,
        price: 25.0,
      },
    ],
  },
  {
    id: "667d2689ea57625b239186a4",
    tableNo: "B-3",
    date: "2024-01-27T08:44:00",
    amount: 225.0,
    status: "preparing",
    paymentStatus: "paid",
    customer: {
      name: "Jane Smith",
      phone: "+91 98765 43211",
    },
    items: [
      {
        name: "Paneer Tikka",
        quantity: 1,
        price: 110.0,
      },
      {
        name: "Roti",
        quantity: 2,
        price: 15.0,
      },
      {
        name: "Mango Lassi",
        quantity: 2,
        price: 40.0,
      },
    ],
  },
];

const statusStyles = {
  new: "bg-blue-100 text-blue-800",
  preparing: "bg-yellow-100 text-yellow-800",
  ready: "bg-green-100 text-green-800",
  served: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStatusStyles = {
  paid: "bg-green-100 text-green-800",
  unpaid: "bg-red-100 text-red-800",
};

export function OrdersTable() {
  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRow = (orderId) => {
    setExpandedRows((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId]
    );
  };

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <Fragment key={order.id}>
                <TableRow>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => toggleRow(order.id)}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          expandedRows.includes(order.id) ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.id.slice(-8)}
                  </TableCell>
                  <TableCell>{order.tableNo}</TableCell>
                  <TableCell>
                    {format(new Date(order.date), "dd MMM yyyy HH:mm")}
                  </TableCell>
                  <TableCell>₹{order.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusStyles[order.status]}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={paymentStatusStyles[order.paymentStatus]}
                    >
                      {order.paymentStatus.charAt(0).toUpperCase() +
                        order.paymentStatus.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-8 h-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {order.status === "new" && (
                          <DropdownMenuItem>
                            <Clock className="w-4 h-4 mr-2" />
                            Start Preparing
                          </DropdownMenuItem>
                        )}
                        {order.status === "preparing" && (
                          <DropdownMenuItem>
                            <Check className="w-4 h-4 mr-2" />
                            Mark as Ready
                          </DropdownMenuItem>
                        )}
                        {order.status === "ready" && (
                          <DropdownMenuItem>
                            <Check className="w-4 h-4 mr-2" />
                            Mark as Served
                          </DropdownMenuItem>
                        )}
                        {order.paymentStatus === "unpaid" && (
                          <DropdownMenuItem>
                            <Receipt className="w-4 h-4 mr-2" />
                            Record Payment
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Report Issue
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {expandedRows.includes(order.id) && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="mb-2 font-semibold">Order Details</h4>
                          <div className="text-sm">
                            <p>
                              <span className="text-muted-foreground">
                                Customer:
                              </span>{" "}
                              {order.customer.name}
                            </p>
                            <p>
                              <span className="text-muted-foreground">
                                Phone:
                              </span>{" "}
                              {order.customer.phone}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="mb-2 font-semibold">Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {item.quantity}x {item.name}
                                </span>
                                <span>₹{item.price.toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="pt-2 mt-2 font-medium border-t">
                              <div className="flex justify-between">
                                <span>Total</span>
                                <span>₹{order.amount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
