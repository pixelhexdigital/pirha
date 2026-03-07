import { Fragment } from "react";
import { format } from "date-fns";
import { Users, ChefHat, ScanText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { useGetDashBoardDataQuery, useGetOrderListQuery } from "api/adminApi";
import { ROUTES } from "routes/RouterConfig";

import Layout from "components/Layout";
import PageHeader from "components/PageHeader";
import StatusBadge from "components/StatusBadge";
import EmptyState from "components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";

const CARD_COLORS = [
  { border: "border-l-primary", bg: "bg-primary/10", text: "text-primary" },
  { border: "border-l-info", bg: "bg-info/10", text: "text-info" },
  { border: "border-l-success", bg: "bg-success/10", text: "text-success" },
];

const DashboardPage = () => {
  const { data: dashboardData } = useGetDashBoardDataQuery();
  const { data: orderData } = useGetOrderListQuery({
    page: 1,
    limit: 5,
  });

  const DASHBOARD_CARD_DATA = [
    {
      title: "Total Orders",
      value: dashboardData?.totalOrders ?? 0,
      icon: <ScanText className="size-5" />,
    },
    {
      title: "Total Menu",
      value: dashboardData?.totalMenus ?? 0,
      icon: <ChefHat className="size-5" />,
    },
    {
      title: "Total Customers",
      value: dashboardData?.totalCustomers ?? 0,
      icon: <Users className="size-5" />,
    },
  ];

  return (
    <Layout>
      <PageHeader title="Dashboard" />
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {DASHBOARD_CARD_DATA.map((item, index) => {
          const colors = CARD_COLORS[index % CARD_COLORS.length];
          return (
            <Card
              key={index}
              className={`border-l-4 ${colors.border}`}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex items-center justify-center size-12 rounded-xl ${colors.bg} ${colors.text}`}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
      <Card className="border-0">
        <CardHeader className="py-4 flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link
            to={ROUTES.ORDER}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View All Orders
            <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {orderData?.length === 0 ? (
            <EmptyState
              title="No orders found"
              description="Start taking orders to see them here."
            />
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

                  return (
                    <Fragment key={order._id}>
                      <TableRow className="hover:bg-muted/50">
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
                        <TableCell>{"\u20B9"}{totalAmount?.toFixed(2)}</TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
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
