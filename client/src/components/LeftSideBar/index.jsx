import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { twMerge } from "tailwind-merge";
import { NavLink } from "react-router-dom";
import { ChevronLast, ChevronFirst } from "lucide-react";
// import LOGO from "assets/images/logo.png";

import {
  selectIsSidebarExtended,
  setSidebarExtended,
} from "store/MiscellaneousSlice";
// import { IMAGES } from "lib/constants";

export default function LeftSidebar({ children }) {
  const isExpanded = useSelector(selectIsSidebarExtended);
  const dispatch = useDispatch();
  const isDesktop = useMediaQuery({
    query: "(max-width: 1280px)",
  });

  const setExpanded = (value) => {
    dispatch(setSidebarExtended(value));
  };

  // useEffect(() => {
  //   if (isDesktop) {
  //     setExpanded(false);
  //   }
  // }, [isDesktop]);

  return (
    <aside className="fixed top-0 left-0 z-20 h-screen overflow-x-hidden overflow-y-auto bg-white border-r shadow-sm drop-shadow-2xl bg-background scrollbar-none">
      <nav className="inline-flex flex-col h-full ">
        <div className="flex items-center justify-between p-4 pb-8">
          <button
            onClick={() => setExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {isExpanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>
        <ul className="flex-1">{children}</ul>
      </nav>
    </aside>
  );
}

export function SidebarItem({ icon, name, url }) {
  const isExpanded = useSelector(selectIsSidebarExtended);

  return (
    <NavLink
      className="relative flex flex-col my-3 font-medium cursor-pointer group"
      to={url}
    >
      {({ isActive }) => (
        <div
          className={twMerge(
            "flex items-center justify-center pl-2 py-3 transition-all border-l-[0.25rem] text-black/70 border-transparent bg-transparent ml-4 w-[85%] mr-auto rounded-tr-md rounded-br-md",
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
