import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import {
  useGetOrderListQuery,
  useUpdateOrderStatusMutation,
} from "api/adminApi";
import Layout from "components/Layout";
import PageHeader from "components/PageHeader";
import RefreshButton from "components/RefreshButton";
import { errorToast } from "lib/helper";
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
    status: "New",
  });
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const hasNextPage = orderData?.data?.hasNextPage || false;

  useEffect(() => {
    if (orderData?.data?.orders) {
      setOrders(orderData.data.orders);
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
      errorToast({ error: err, message: "Failed to update order status" });
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1); // Reset to first page
    refetch(); // Refetch data
  };

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <PageHeader
          title="Kitchen Orders"
          description="Manage and track orders for kitchen preparation"
        >
          <RefreshButton
            onClick={handleRefresh}
            isLoading={isLoading}
            isFetching={isFetching}
          />
        </PageHeader>
        <div className="flex-1 p-4 space-y-4">
          <KitchenOrdersView
            orders={orders}
            onStatusChange={handleUpdateOrderStatus}
            isLoading={isLoading}
          />
          {hasNextPage && <div ref={ref} className="h-10"></div>}
        </div>
      </div>
    </Layout>
  );
}
