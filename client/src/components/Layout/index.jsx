import { useSelector } from "react-redux";
import { twMerge } from "tailwind-merge";
import {
  AlignLeft,
  ChefHat,
  LayoutDashboard,
  ReceiptText,
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
    url: ROUTES.ORDER_LIST,
    icon: <AlignLeft size={20} />,
  },
  {
    name: "Order Details",
    url: ROUTES.ORDER_DETAILS,
    icon: <ReceiptText size={20} />,
  },

  {
    name: "Menu Items",
    url: ROUTES.MENU_MANAGEMENT,
    icon: <ChefHat size={20} />,
  },
  {
    name: "Settings",
    url: ROUTES.NOT_FOUND,
    icon: <Settings size={20} />,
  },
];

function Layout({ children }) {
  const isExpanded = useSelector(selectIsSidebarExtended);

  return (
    <main className="flex w-full">
      <LeftSidebar>
        {navigation.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            name={item.name}
            url={item.url}
            nestedNavigation={item.nestedNavigation}
          />
        ))}
      </LeftSidebar>
      <div className="flex flex-col w-full">
        <nav
          className={twMerge(
            `fixed z-5 top-0 right-0 bg-background shadow-md h-22 flex items-center justify-between flex-row px-4 md:px-8 rounded-b-2xl transition-all`
          )}
          style={{
            width: isExpanded ? "calc(100% - 15rem)" : "calc(100% - 4.5rem)",
          }}
        >
          <div className="items-center justify-center h-24"></div>
          <div className="flex flex-row-reverse items-center w-full gap-6">
            <div
              className={`flex justify-end w-full
            `}
            >
              <div className="flex lg:w-full md:items-end md:justify-between">
                <p
                  className={`text-neutral-700 text-xl font-semibold hidden lg:flex`}
                ></p>
                <div className="flex gap-4 mr-4">
                  <div className="flex flex-col ">
                    <p className="text-base font-semibold text-black">Sagar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div
          className={`transition-all duration-200 w-full mt-28 ${
            isExpanded ? "pl-[17rem]" : "pl-[6rem]"
          } pr-2`}
        >
          {children}
        </div>
      </div>
    </main>
  );
}

export default Layout;
