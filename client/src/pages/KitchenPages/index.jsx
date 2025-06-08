import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import {
  useGetOrderListQuery,
  useUpdateOrderStatusMutation,
} from "api/adminApi";
import Layout from "components/Layout";
import { Button } from "components/ui/button";

import { KitchenOrdersView } from "./components/KitchenOrdersView";

const PAGINATION_LIMIT = 20;

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { ref, inView } = useInView({ threshold: 1 });

  const {
    data: orderData,
    isLoading,
    isFetching,
    refetch,
  } = useGetOrderListQuery({
    page: currentPage,
    limit: PAGINATION_LIMIT,
    // status: activeFilter,
  });
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const hasNextPage = orderData?.data?.hasNextPage || false;

  useEffect(() => {
    const includeStatus = ["new", "preparing", "ready"];
    if (orderData?.data?.orders) {
      const filteredOrders = orderData.data.orders.filter((order) =>
        includeStatus.includes(order.status?.toLowerCase())
      );
      setOrders(filteredOrders);
    }
  }, [orderData]);

  useEffect(() => {
    // Only fetch if inView, not loading, and hasNextPage is true
    if (inView && !isLoading && hasNextPage && !isFetching) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [inView, isLoading, hasNextPage, isFetching]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({ orderId, status: newStatus }).unwrap();
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1); // Reset to first page
    refetch(); // Refetch data
  };

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Kitchen Orders
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and track orders for kitchen preparation
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isFetching ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <KitchenOrdersView
            orders={orders}
            onStatusChange={handleUpdateOrderStatus}
          />
          {isLoading && (
            <div className="flex justify-center items-center mt-4">
              <div className="ring-loader border-secondary size-10" />
            </div>
          )}
          {hasNextPage && <div ref={ref} className="h-10"></div>}
        </div>
      </div>
    </Layout>
  );
}
