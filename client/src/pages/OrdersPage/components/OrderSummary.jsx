import { DollarSign, ShoppingBag, Clock, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";

export function OrderSummary() {
  // This data would typically come from an API call
  const summaryData = {
    totalOrders: 24,
    totalRevenue: 3650.5,
    averagePreparationTime: 18, // in minutes
    pendingOrders: 5,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingBag className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.totalOrders}</div>
          <p className="text-xs text-muted-foreground">Today's orders</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{summaryData.totalRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Today's revenue</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            Avg. Preparation Time
          </CardTitle>
          <Clock className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summaryData.averagePreparationTime} min
          </div>
          <p className="text-xs text-muted-foreground">
            Average time per order
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.pendingOrders}</div>
          <p className="text-xs text-muted-foreground">
            Orders awaiting preparation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
