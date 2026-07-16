import { useState } from "react";
import { useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { NavLink } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import {
  ChefHat,
  LayoutDashboard,
  LayoutGridIcon,
  List,
  LogOutIcon,
  Menu,
  MenuSquare,
  Settings,
} from "lucide-react";

import LeftSidebar, { SidebarItem } from "components/LeftSideBar";
import ThemeToggle from "components/ThemeToggle";
import VerifyEmailBanner from "components/VerifyEmailBanner";
import { Button } from "components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "components/ui/sheet";
import Wordmark from "components/Wordmark";
import { ROUTES } from "routes/RouterConfig";
import { useLogOutMutation } from "api/authApi";
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

// Nav rendered inside the mobile drawer. Items always show icon + label and
// close the drawer on navigation.
function MobileNav({ onNavigate }) {
  const [logOut, { isLoading: isLoggingOut } = {}] = useLogOutMutation();

  const handleLogout = async () => {
    try {
      await logOut().unwrap();
    } catch {
      // Logout failure is handled by the auth middleware
    }
  };

  return (
    <nav className="flex flex-col h-full">
      <div className="flex items-center h-16 px-4 border-b">
        <Wordmark className="text-xl text-foreground" />
      </div>
      <ul className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <li key={item.url}>
            <NavLink
              to={item.url}
              onClick={onNavigate}
              className={({ isActive }) =>
                twMerge(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="px-2 py-3 space-y-1 border-t">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          type="button"
          className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOutIcon className="size-5 shrink-0" />
          Logout
        </button>
      </div>
    </nav>
  );
}

function Layout({ children }) {
  const isExpanded = useSelector(selectIsSidebarExtended);
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Mobile: no permanent rail. A sticky top bar opens the nav in a drawer
  // (backdrop + focus trap + escape handled by the Sheet).
  if (!isDesktop) {
    return (
      <div className="flex flex-col w-full min-h-screen">
        <header className="sticky top-0 z-20 flex items-center gap-3 h-14 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <MobileNav onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <Wordmark className="text-lg text-foreground" />
        </header>
        <div className="p-4">
          <VerifyEmailBanner />
          {children}
        </div>
      </div>
    );
  }

  // Desktop: fixed collapsible sidebar with reserved gutter.
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
        <div className="p-6">
          <VerifyEmailBanner />
          {children}
        </div>
      </div>
    </main>
  );
}

export default Layout;
