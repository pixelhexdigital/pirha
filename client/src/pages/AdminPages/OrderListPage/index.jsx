import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";
import OrderListTable from "pages/AdminPages/OrderListPage/OrderListTable";

// CONSTANTS FOR STATUS COLORS AND TEXT

const FILTER_BUTTONS = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "New Order",
    value: "new",
  },
  {
    label: "In Progress",
    value: "inProgress",
  },
  {
    label: "Completed",
    value: "completed",
  },
];

const data = [
  {
    orderId: "1",
    status: "inProgress",
    date: "01-01-2024",
    time: "12:00 PM",
    amount: "100.00",
    customerName: "Wolverine",
    tableNo: "1",
  },
  {
    orderId: "2",
    status: "completed",
    date: "01-01-2024",
    time: "12:00 PM",
    amount: "200.00",
    customerName: "Wade Wilson",
    tableNo: "2",
  },
  {
    orderId: "3",
    status: "cancelled",
    date: "01-01-2024",
    time: "12:00 PM",
    amount: "300.00",
    customerName: "John wick",
    tableNo: "3",
  },
  {
    orderId: "4",
    status: "inProgress",
    date: "01-01-2024",
    time: "12:00 PM",
    amount: "400.00",
    customerName: "John cena",
    tableNo: "4",
  },
  {
    orderId: "5",
    status: "completed",
    date: "01-01-2024",
    time: "12:00 PM",
    amount: "500.00",
    customerName: "Goku",
    tableNo: "5",
  },
  {
    orderId: "6",
    status: "cancelled",
    date: "01-01-2024",
    time: "12:00 PM",
    amount: "600.00",
    customerName: "Freiza",
    tableNo: "6",
  },
  {
    orderId: "7",
    status: "inProgress",
    date: "01-01-2024",
    time: "12:00 PM",
    amount: "700.00",
    customerName: "Oliver Queen",
    tableNo: "7",
  },
  {
    orderId: "8",
    status: "completed",
    date: "01-01-2024",
    time: "12:00 PM",
    amount: "800.00",
    customerName: "I am Batman",
    tableNo: "8",
  },
  {
    orderId: "9",
    status: "cancelled",
    date: "01-01-2024",
    time: "12:00 PM",
    amount: "900.00",
    customerName: "I am Groot",
    tableNo: "9",
  },
  {
    orderId: "10",
    status: "inProgress",
    date: "01-01-2024",
    time: "12:00 PM",
    amount: "1000.00",
    customerName: "I am Ironman",
    tableNo: "10",
  },
];

const OrderListPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const tableData = data.filter((order) => order.status === activeFilter);

  return (
    <div className="space-y-4 w-[98%] mx-auto">
      <h2 className="h4">Orders</h2>
      <div className="w-full p-4 space-y-4 bg-white rounded-md shadow-md ring-1 ring-black/5">
        <Tabs defaultValue="all" className="space-y-4">
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
                <OrderListTable
                  data={filter.value === "all" ? data : tableData}
                />
              </TabsContent>
            );
          })}
        </Tabs>

        <div className="flex items-center justify-end space-x-2"></div>
      </div>
    </div>
  );
};

export default OrderListPage;
