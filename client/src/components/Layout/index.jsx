import { useSelector } from "react-redux";
import {
  ChefHat,
  LayoutDashboard,
  LayoutGridIcon,
  List,
  MenuSquare,
  Settings,
} from "lucide-react";

import LeftSidebar, { SidebarItem } from "components/LeftSideBar";
import { ROUTES } from "routes/RouterConfig";
import { selectIsSidebarExtended } from "store/MiscellaneousSlice";

const navigation = [
  {
    name: "Dashboard",
    url: ROUTES.DASHBOARD,
    icon: <LayoutDashboard size={20} />,
  },
  {
    name: "Order List",
    url: ROUTES.ORDER,
    icon: <List size={20} />,
  },
  {
    name: "Kitchen Orders",
    url: ROUTES.KITCHEN,
    icon: <ChefHat size={20} />,
  },
  {
    name: "Menu Items",
    url: ROUTES.MENU_MANAGEMENT,
    icon: <MenuSquare size={20} />,
  },
  {
    name: "Tables",
    url: ROUTES.TABLES,
    icon: <LayoutGridIcon size={20} />,
  },
  {
    name: "Settings",
    url: ROUTES.SETTINGS,
    icon: <Settings size={20} />,
  },
];

function Layout({ children }) {
  const isExpanded = useSelector(selectIsSidebarExtended);

  return (
    <main className="flex w-full min-h-screen">
      <LeftSidebar>
        {navigation.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            name={item.name}
            url={item.url}
          />
        ))}
      </LeftSidebar>
      <div
        className="flex flex-col w-full transition-all duration-200"
        style={{
          paddingLeft: isExpanded ? "16rem" : "4.5rem",
        }}
      >
        <div className="p-6">{children}</div>
      </div>
    </main>
  );
}

export default Layout;
