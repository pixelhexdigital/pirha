import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDispatch } from "react-redux";

import {
  adminApi,
  useGetOrderListQuery,
  useUpdateOrderStatusMutation,
} from "api/adminApi";

import Layout from "components/Layout";
import { Button } from "components/ui/button";
import { OrderTabs } from "./components/OrderTabs";
import { OrdersTable } from "./components/OrdersTable";
import { OrderSummary } from "./components/OrderSummary";

const OrderStatuses = [
  {
    label: "New Order",
    value: "New",
    count: 6,
  },
  {
    label: "Ready",
    value: "Ready",
    count: 2,
  },
  {
    label: "Served",
    value: "Served",
    count: 3,
  },
  {
    label: "Cancelled",
    value: "Cancelled",
    count: 1,
  },
  {
    label: "Billed",
    value: "Billed",
    count: 4,
  },
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
            console.log("Removing order:", orderId);
            console.log("Current orders:", draft.data.orders);
            draft.data.orders = draft.data.orders.filter(
              (o) => o._id !== orderId
            );
          }
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
        <div className="flex sm:items-center justify-between p-4 border-b sm:flex-row flex-col gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            <p className="text-sm text-muted-foreground">
              Manage and track all your restaurant orders
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 max-w-fit px-4 self-end"
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
          {/* <OrderSummary /> */}
          <OrderTabs
            orderStatuses={OrderStatuses}
            defaultValue={OrderStatuses[0].value}
            onStatusChange={handleStatusChange}
          />
          {/* <OrderFilters />bg-pink-50  */}
          <OrdersTable data={orders} onAction={handelAction} />
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
