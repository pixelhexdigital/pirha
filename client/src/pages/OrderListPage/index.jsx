import { useState } from "react";
import { useSelector } from "react-redux";
import { RotateCcw, X } from "lucide-react";

import Layout from "components/Layout";
import OrderListTable from "./OrderListTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";
import { selectOrders } from "store/OrderSlice";
import { useGetOrderListQuery, useGetOrdersDataQuery } from "api/adminApi";
import { Button } from "components/ui/button";

import { useInView } from "react-intersection-observer";

// CONSTANTS FOR STATUS COLORS AND TEXT
const FILTER_BUTTONS = [
  {
    label: "New Order",
    value: "New",
  },
  {
    label: "Ready",
    value: "Ready",
  },
  {
    label: "Served",
    value: "Served",
  },
  {
    label: "Cancelled",
    value: "Cancelled",
  },
  {
    label: "Billed",
    value: "Billed",
  },
];

const PAGINATION_LIMIT = 20;
const DEBOUNCE_TIME = 500;

const OrderListPage = () => {
  const ordersData = useSelector(selectOrders);
  const [activeFilter, setActiveFilter] = useState(FILTER_BUTTONS[0].value);
  const [pageNo, setPageNo] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // console.log("ordersData", ordersData);

  const { orders } = ordersData || {};

  const { ref, inView } = useInView({ threshold: 1 });

  // const { isLoading, isFetching, refetch } = useGetOrdersDataQuery(
  //   { pageNo, status: activeFilter },
  //   { refetchOnMountOrArgChange: true }
  // );

  const {
    data: ordersDataResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetOrderListQuery({
    page: currentPage,
    limit: PAGINATION_LIMIT,
    status: activeFilter,
  });
  console.log("ordersDataResponse", ordersDataResponse);

  const tableData = orders?.filter((order) => order.status === activeFilter);

  return (
    <Layout>
      <div className="space-y-4 w-[98%] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="h4">Orders</h2>

          <Button
            variant="outline"
            onClick={() =>
              refetch({
                pageNo: pageNo,
                status: activeFilter,
              })
            }
            className="h-9"
          >
            {isFetching ? (
              <X className="size-4 animate-pulse" />
            ) : (
              <RotateCcw className="size-4" />
            )}
          </Button>
        </div>
        <div className="w-full p-4 space-y-4 bg-white rounded-md shadow-md ring-1 ring-black/5">
          <Tabs defaultValue={FILTER_BUTTONS[0].value} className="space-y-4">
            <TabsList className="gap-4">
              {FILTER_BUTTONS.map((filter) => {
                return (
                  <TabsTrigger
                    key={filter.value}
                    value={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                  >
                    {filter.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {FILTER_BUTTONS.map((filter) => {
              return (
                <TabsContent key={filter.value} value={filter.value}>
                  {isLoading ? (
                    <div className="flex mx-auto my-20 ring-loader border-primary" />
                  ) : (
                    <OrderListTable data={tableData} />
                  )}
                </TabsContent>
              );
            })}
          </Tabs>

          <div className="flex items-center justify-end space-x-2"></div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderListPage;
