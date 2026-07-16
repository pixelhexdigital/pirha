import { useDispatch, useSelector } from "react-redux";
import { twMerge } from "tailwind-merge";
import { Link, NavLink } from "react-router-dom";
import { ChevronLast, ChevronFirst, LogOutIcon } from "lucide-react";

import {
  selectIsSidebarExtended,
  setSidebarExtended,
} from "store/MiscellaneousSlice";
import Wordmark from "components/Wordmark";
import { useLogOutMutation } from "api/authApi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "components/ui/tooltip";
import ThemeToggle from "components/ThemeToggle";

export default function LeftSidebar({ children }) {
  const isExpanded = useSelector(selectIsSidebarExtended);
  const dispatch = useDispatch();

  const setExpanded = (value) => {
    dispatch(setSidebarExtended(value));
  };

  const [logOutMutation, { isLoading: isLoggingOut } = {}] =
    useLogOutMutation();

  const handleLogout = async () => {
    try {
      await logOutMutation().unwrap();
    } catch {
      // Logout failure is handled by the auth middleware
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={twMerge(
          "fixed top-0 left-0 z-20 h-screen overflow-x-hidden overflow-y-auto border-r bg-card transition-all duration-200 scrollbar-none",
          isExpanded ? "w-[16rem]" : "w-[4.5rem]"
        )}
      >
        <nav className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-3 border-b">
            {isExpanded && (
              <Link to="/" className="flex items-center">
                <Wordmark className="text-xl text-foreground" />
              </Link>
            )}
            <button
              onClick={() => setExpanded(!isExpanded)}
              className={twMerge(
                "p-1.5 rounded-lg bg-accent hover:bg-accent/80 transition-colors",
                !isExpanded && "mx-auto"
              )}
            >
              {isExpanded ? (
                <ChevronFirst className="size-4 text-muted-foreground" />
              ) : (
                <ChevronLast className="size-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {isExpanded && (
            <div className="px-3 pt-4 pb-2">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground/60 px-2">
                Main
              </p>
            </div>
          )}

          <ul className="flex-1 px-2 py-2 space-y-1">{children}</ul>

          <div className="px-2 pb-2 space-y-1">
            <ThemeToggle collapsed={!isExpanded} />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  type="button"
                  aria-label="Logout"
                  className={twMerge(
                    "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
                    !isExpanded && "justify-center px-0"
                  )}
                >
                  <LogOutIcon className="size-5 shrink-0" />
                  {isExpanded && <span>Logout</span>}
                </button>
              </TooltipTrigger>
              {!isExpanded && (
                <TooltipContent side="right">Logout</TooltipContent>
              )}
            </Tooltip>
          </div>

          <div className="border-t px-3 py-3">
            <p className="text-xs text-muted-foreground text-center">
              {isExpanded ? (
                <>
                  &copy; {new Date().getFullYear()}{" "}
                  <a
                    href="https://pixelhexdigital.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    PixelHex Digital
                  </a>
                </>
              ) : (
                <a
                  href="https://pixelhexdigital.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  PH
                </a>
              )}
            </p>
            <p className="text-[0.65rem] text-muted-foreground/60 text-center mt-0.5">
              {isExpanded ? "Version 1.0.0" : "v1"}
            </p>
          </div>
        </nav>
      </aside>
    </TooltipProvider>
  );
}

export function SidebarItem({ icon, name, url }) {
  const isExpanded = useSelector(selectIsSidebarExtended);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink className="block" to={url}>
          {({ isActive }) => (
            <div
              className={twMerge(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                !isExpanded && "justify-center px-0"
              )}
            >
              <span className="shrink-0">{icon}</span>
              {isExpanded && <span>{name}</span>}
            </div>
          )}
        </NavLink>
      </TooltipTrigger>
      {!isExpanded && (
        <TooltipContent side="right">{name}</TooltipContent>
      )}
    </Tooltip>
  );
}
