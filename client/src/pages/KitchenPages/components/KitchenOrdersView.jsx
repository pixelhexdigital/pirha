import { useState } from "react";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Sample data - replace with real API data
const initialOrders = [
  {
    id: "667d259cea57625b239186e",
    tableNo: "A-1",
    orderTime: "2024-01-27T08:41:00",
    status: "new",
    items: [
      { name: "Butter Chicken", quantity: 1, notes: "Extra spicy" },
      { name: "Naan", quantity: 2, notes: "" },
    ],
  },
  {
    id: "667d2689ea57625b239186a4",
    tableNo: "B-3",
    orderTime: "2024-01-27T08:44:00",
    status: "preparing",
    items: [
      { name: "Paneer Tikka", quantity: 1, notes: "No onions" },
      { name: "Roti", quantity: 2, notes: "" },
      { name: "Dal Makhani", quantity: 1, notes: "" },
    ],
  },
  // Add more sample orders as needed
];

const statusStyles = {
  new: "bg-blue-100 text-blue-800",
  preparing: "bg-yellow-100 text-yellow-800",
  ready: "bg-green-100 text-green-800",
};

export function KitchenOrdersView() {
  const [orders, setOrders] = useState(initialOrders);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getTimeDifference = (orderTime) => {
    const diff = new Date().getTime() - new Date(orderTime).getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min ago`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <Card key={order.id} className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Table {order.tableNo} - Order #{order.id.slice(-4)}
            </CardTitle>
            <Badge variant="secondary" className={statusStyles[order.status]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              {getTimeDifference(order.orderTime)}
            </div>
            <ul className="space-y-2">
              {order.items.map((item, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">
                    {item.quantity}x {item.name}
                  </span>
                  {item.notes && (
                    <p className="ml-5 text-muted-foreground">{item.notes}</p>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-4 space-x-2">
              {order.status === "new" && (
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, "preparing")}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Start Preparing
                </Button>
              )}
              {order.status === "preparing" && (
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, "ready")}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark as Ready
                </Button>
              )}
              <Button size="sm" variant="outline">
                <AlertCircle className="w-4 h-4 mr-1" />
                Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
