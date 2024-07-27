import { useGetDashBoardDataQuery } from "api/adminApi";
import Layout from "components/Layout";
import { numberToCurrency } from "lib/helper";
import {
  IndianRupee,
  Users,
  ChefHat,
  ScanText,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

const ICON_COLOR = "rgba(234,42,136,0.6)";
const ICON_SIZE = 22;

const DashboardPage = () => {
  const { data, error } = useGetDashBoardDataQuery();
  console.log("data:", data);

  const DASHBOARD_CARD_DATA = [
    {
      title: "Total Revenue",
      value: numberToCurrency(30000),
      changes: 10,
      icon: <IndianRupee size={ICON_SIZE} color={ICON_COLOR} />,
    },
    {
      title: "Total Orders",
      value: data?.totalOrders ?? 0,
      changes: -10,
      icon: <ScanText size={ICON_SIZE} color={ICON_COLOR} />,
    },
    {
      title: "Total Menu",
      value: data?.totalMenus ?? 0,
      changes: 10,
      icon: <ChefHat size={ICON_SIZE} color={ICON_COLOR} />,
    },
    {
      title: "Total Customers",
      value: data?.totalCustomers ?? 0,
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
            <article key={index} className="w-64 p-4 min-w-fit">
              <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="p-3 mr-4 rounded-lg bg-primary-foreground">
                    {icon}
                  </div>
                  <p className={`text-muted-foreground mr-2 ${changeColor}`}>
                    {changes}%
                  </p>

                  {changes > 0 ? (
                    <div className="p-1 bg-green-100 rounded-full">
                      <ArrowUp size={18} color="#50D1AA" />
                    </div>
                  ) : (
                    <div className="p-1 bg-red-100 rounded-full">
                      <ArrowDown size={18} color="red" />
                    </div>
                  )}
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
    </Layout>
  );
};

export default DashboardPage;
