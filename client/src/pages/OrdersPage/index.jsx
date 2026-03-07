import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDispatch } from "react-redux";

import {
  adminApi,
  useGetOrderListQuery,
  useUpdateOrderStatusMutation,
} from "api/adminApi";

import Layout from "components/Layout";
import PageHeader from "components/PageHeader";
import RefreshButton from "components/RefreshButton";
import { errorToast } from "lib/helper";
import { OrderTabs } from "./components/OrderTabs";
import { OrdersTable } from "./components/OrdersTable";

const OrderStatuses = [
  { label: "New Order", value: "New" },
  { label: "Ready", value: "Ready" },
  { label: "Served", value: "Served" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Billed", value: "Billed" },
];

const PAGINATION_LIMIT = 20;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState(OrderStatuses[0].value);
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useDispatch();
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

  const handleStatusChange = (status) => {
    setActiveFilter(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handelAction = async (status, orderId) => {
    try {
      await updateOrderStatus({ orderId, status }).unwrap();

      // Optimistically remove order from list
      dispatch(
        adminApi.util.updateQueryData(
          "getOrderList",
          { page: currentPage, limit: PAGINATION_LIMIT, status: activeFilter },
          (draft) => {
            draft.data.orders = draft.data.orders.filter(
              (o) => o._id !== orderId
            );
          }
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
          />
          <OrdersTable data={orders} onAction={handelAction} isLoading={isLoading} />
          {hasNextPage && <div ref={ref} className="h-10"></div>}
        </div>
      </div>
    </Layout>
  );
}
