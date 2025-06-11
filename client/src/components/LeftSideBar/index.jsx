import { useDispatch, useSelector } from "react-redux";
import { twMerge } from "tailwind-merge";
import { Link, NavLink } from "react-router-dom";
import { ChevronLast, ChevronFirst, LogOutIcon } from "lucide-react";

import {
  selectIsSidebarExtended,
  setSidebarExtended,
} from "store/MiscellaneousSlice";
import { IMAGES } from "lib/constants";
import { useLogOutMutation } from "api/authApi";

export default function LeftSidebar({ children }) {
  const isExpanded = useSelector(selectIsSidebarExtended);
  const dispatch = useDispatch();

  const setExpanded = (value) => {
    dispatch(setSidebarExtended(value));
  };

  const [logOutMutation, { isLoading: isLoggingOut } = {}] =
    useLogOutMutation();

  // useEffect(() => {
  //   if (isDesktop) {
  //     setExpanded(false);
  //   }
  // }, [isDesktop]);

  const handleLogout = async () => {
    try {
      await logOutMutation().unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="fixed top-0 left-0 z-20 h-screen overflow-x-hidden overflow-y-auto bg-white border-r shadow-sm drop-shadow-2xl bg-background scrollbar-none">
      <nav className="inline-flex flex-col h-full px-2">
        <div className="flex items-center justify-between h-20 p-2 ">
          {isExpanded && (
            <Link to="/" className="flex items-center">
              <img src={IMAGES.LOGO_WHITE} alt="logo" className="h-8" />
              <span className="ml-2 text-lg font-semibold text-primary"></span>
            </Link>
          )}
          <button
            onClick={() => setExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {isExpanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>
        <ul className="flex-1">
          {children}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            type="button"
            aria-label="Logout"
            className="relative  my-1.5 font-medium cursor-pointer group"
          >
            <div
              className={twMerge(
                "flex items-center justify-center pl-2 py-2.5 transition-all border-l-[0.25rem] text-black/70 border-transparent bg-transparent ml-4 w-[85%] mr-auto rounded-tr-md rounded-br-md hove:text-primary hover:bg-primary/10 hover:border-primary",
                !isExpanded &&
                  "w-full rounded-none border-r-[0.25rem] border-l-0 mx-auto"
              )}
            >
              <LogOutIcon />
              <span
                className={`overflow-hidden transition-all ${
                  isExpanded ? " ml-3" : ""
                }`}
              >
                {isExpanded ? "Logout" : ""}
              </span>
              {!isExpanded && (
                <div
                  className={twMerge(
                    "absolute left-full px-2 py-1 ml-6 text-primary text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0"
                  )}
                >
                  Logout
                </div>
              )}
            </div>
          </button>
        </ul>

        <div className="h-px w-full bg-gray-200 my-2" />
        <div className="flex flex-col items-center justify-center p-2">
          <p className="text-sm text-gray-500">
            {isExpanded ? `@ ${new Date().getFullYear()}` : ""}

            <a
              href="https://pixelhexdigital.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-primary hover:underline"
            >
              {isExpanded ? "PixelHex Digital" : "PH"}
            </a>
          </p>

          <p className="text-sm text-gray-500">
            {isExpanded ? "Version 1.0.0" : "v1.0.0"}
          </p>
        </div>
      </nav>
    </aside>
  );
}

export function SidebarItem({ icon, name, url }) {
  const isExpanded = useSelector(selectIsSidebarExtended);

  return (
    <NavLink
      className="relative flex flex-col my-1.5 font-medium cursor-pointer group"
      to={url}
    >
      {({ isActive }) => (
        <div
          className={twMerge(
            "flex items-center justify-center pl-2 py-2.5 transition-all border-l-[0.25rem] text-black/70 border-transparent bg-transparent ml-4 w-[85%] mr-auto rounded-tr-md rounded-br-md hove:text-primary hover:bg-primary/10 hover:border-primary",
            isActive && "text-primary/80 border-primary bg-primary/10",
            !isExpanded &&
              "w-full rounded-none border-r-[0.25rem] border-l-0 mx-auto"
          )}
        >
          {icon}
          <span
            className={`overflow-hidden transition-all ${
              isExpanded ? "w-44 ml-3" : "w-2"
            }`}
          >
            {isExpanded ? name : ""}
          </span>
          {!isExpanded && (
            <div
              className={twMerge(
                "absolute left-full px-2 py-1 ml-6 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0",
                isActive ? "text-primary" : "text-secondary"
              )}
            >
              {name}
            </div>
          )}
        </div>
      )}
    </NavLink>
  );
}
