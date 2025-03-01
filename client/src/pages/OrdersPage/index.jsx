import { RefreshCcw } from "lucide-react";

import { Button } from "components/ui/button";
import { OrderTabs } from "./components/OrderTabs";
import { OrdersTable } from "./components/OrdersTable";
import { OrderFilters } from "./components/OrderFilters";
import { OrderSummary } from "./components/OrderSummary";
import Layout from "components/Layout";

// export const metadata: Metadata = {
//   title: "Orders | PirHa.in",
//   description: "Restaurant order management system",
// }

export default function OrdersPage() {
  return (
    <Layout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            <p className="text-sm text-muted-foreground">
              Manage and track all your restaurant orders
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <OrderSummary />
          <OrderTabs />
          <OrderFilters />
          <OrdersTable />
        </div>
      </div>
    </Layout>
  );
}
