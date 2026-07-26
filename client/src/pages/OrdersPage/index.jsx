import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import {
  useGetOrderListQuery,
  useGetOrderStatusCountsQuery,
  useUpdateOrderStatusMutation,
} from "api/adminApi";

import Layout from "components/Layout";
import PageHeader from "components/PageHeader";
import RefreshButton from "components/RefreshButton";
import { errorToast, successToast } from "lib/helper";
import { OrderTabs } from "./components/OrderTabs";
import { OrdersTable } from "./components/OrdersTable";

const OrderStatuses = [
  { label: "New Order", value: "New" },
  { label: "Ready", value: "Ready" },
  { label: "Served", value: "Served" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Billed", value: "Billed" },
];

// Warm confirmation copy keyed by the status an order is moving into.
const STATUS_CHANGE_MESSAGE = {
  Ready: "Order marked ready — kitchen's all set.",
  Served: "Order served. Nicely done!",
  Billed: "Bill generated for this order.",
  Cancelled: "Order cancelled.",
};

const PAGINATION_LIMIT = 20;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState(OrderStatuses[0].value);
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
    status: activeFilter,
  });

  const { data: statusCounts } = useGetOrderStatusCountsQuery();

  const [updateOrderStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();

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

  const handleStatusChange = (status) => {
    setActiveFilter(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleAction = async (status, orderId) => {
    try {
      await updateOrderStatus({ orderId, status }).unwrap();
      // The mutation invalidates the "Order" list tag, so RTK Query refetches
      // every status tab and the order drops out of this one on its own.
      successToast({
        message: STATUS_CHANGE_MESSAGE[status] || "Order updated.",
      });
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
          title="Orders"
          description="Manage and track all your restaurant orders"
        >
          <RefreshButton
            onClick={handleRefresh}
            isLoading={isLoading}
            isFetching={isFetching}
          />
        </PageHeader>
        <div className="flex-1 p-4 space-y-4">
          <OrderTabs
            orderStatuses={OrderStatuses}
            defaultValue={OrderStatuses[0].value}
            onStatusChange={handleStatusChange}
            counts={statusCounts}
          />
          <OrdersTable
            data={orders}
            onAction={handleAction}
            isLoading={isLoading}
            isUpdating={isUpdating}
          />
          {hasNextPage && <div ref={ref} className="h-10"></div>}
        </div>
      </div>
    </Layout>
  );
}
