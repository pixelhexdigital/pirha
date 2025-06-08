import { Fragment } from "react";
import { format } from "date-fns";
import {
  // IndianRupee,
  Users,
  ChefHat,
  ScanText,
  // ArrowDown,
  // ArrowUp,
} from "lucide-react";

import { useGetDashBoardDataQuery, useGetOrderListQuery } from "api/adminApi";

import Layout from "components/Layout";
import { Badge } from "components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
// import { numberToCurrency } from "lib/helper";

const ICON_COLOR = "rgba(234,42,136,0.6)";
const ICON_SIZE = 22;
const statusStyles = {
  new: "bg-blue-100 text-blue-800",
  preparing: "bg-yellow-100 text-yellow-800",
  ready: "bg-green-100 text-green-800",
  served: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
  billed: "bg-indigo-100 text-indigo-800",
};

const DashboardPage = () => {
  const { data: dashboardData } = useGetDashBoardDataQuery();
  const { data: orderData } = useGetOrderListQuery({
    page: 1,
    limit: 5,
  });

  const DASHBOARD_CARD_DATA = [
    // {
    //   title: "Total Revenue",
    //   value: numberToCurrency(30000),
    //   changes: 10,
    //   icon: <IndianRupee size={ICON_SIZE} color={ICON_COLOR} />,
    // },
    {
      title: "Total Orders",
      value: dashboardData?.totalOrders ?? 0,
      changes: -10,
      icon: <ScanText size={ICON_SIZE} color={ICON_COLOR} />,
    },
    {
      title: "Total Menu",
      value: dashboardData?.totalMenus ?? 0,
      changes: 10,
      icon: <ChefHat size={ICON_SIZE} color={ICON_COLOR} />,
    },
    {
      title: "Total Customers",
      value: dashboardData?.totalCustomers ?? 0,
      changes: 10,
      icon: <Users size={ICON_SIZE} color={ICON_COLOR} />,
    },
  ];

  return (
    <Layout>
      <h2 className="mb-2 h4">Dashboard</h2>
      <section className="flex flex-wrap">
        {DASHBOARD_CARD_DATA.map((item, index) => {
          const { title, value, changes, icon } = item;
          const changeColor = changes > 0 ? "text-green-500" : "text-red-500";
          return (
            <article key={index} className="w-64 py-4 pr-4 min-w-fit">
              <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="p-3 mr-4 rounded-lg bg-primary-foreground">
                    {icon}
                  </div>
                  {/* <p className={`text-muted-foreground mr-2 ${changeColor}`}>
                    {changes}%
                  </p> */}

                  {/* {changes > 0 ? (
                    <div className="p-1 bg-green-100 rounded-full">
                      <ArrowUp size={18} color="#50D1AA" />
                    </div>
                  ) : (
                    <div className="p-1 bg-red-100 rounded-full">
                      <ArrowDown size={18} color="red" />
                    </div>
                  )} */}
                </div>
                <h3 className="mt-2 text-xl font-semibold">{value}</h3>
                <div>
                  <h3 className="font-light">{title}</h3>
                </div>
              </div>
            </article>
          );
        })}
      </section>
      <Card className="border-0">
        <CardHeader className="py-4">
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orderData?.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">No orders found</p>
              <p className="text-xs">Start taking orders to see them here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderData?.data?.orders?.map((order) => {
                  const totalAmount = order.items?.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  );
                  const orderStatus = order.status?.toLowerCase();

                  return (
                    <Fragment key={order._id}>
                      <TableRow>
                        <TableCell className="font-medium">
                          {order._id?.slice(-8)}
                        </TableCell>
                        <TableCell className="capitalize">
                          {order?.table}
                        </TableCell>
                        <TableCell>
                          {order?.customer?.firstName}{" "}
                          {order?.customer?.lastName}
                        </TableCell>
                        <TableCell>
                          {order?.items?.map((item, index) => (
                            <span
                              key={item._id}
                              className="inline-block mr-2 text-sm "
                            >
                              {item?.title}
                              {index < order.items.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </TableCell>
                        <TableCell>₹{totalAmount?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusStyles[orderStatus] || ""}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.createdAt), "dd MMM yyyy")} ,{" "}
                          {""}
                          {format(new Date(order.createdAt), "hh:mm aa")}
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default DashboardPage;
