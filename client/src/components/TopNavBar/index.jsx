import { useDispatch, useSelector } from "react-redux";
import { Circle, ScrollText, Utensils } from "lucide-react";
import LOGO from "assets/pirha_logo_white.png";

import {
  selectIsNonVegOnly,
  selectIsVegOnly,
  selectRestaurantDetails,
  selectTableDetailById,
  toggleNonVegOnly,
  toggleVegOnly,
} from "store/MiscellaneousSlice";

const TopNavBar = () => {
  const restaurantDetails = useSelector(selectRestaurantDetails);
  const tableDetailsById = useSelector(selectTableDetailById);
  const isVegOnly = useSelector(selectIsVegOnly);
  const isNonVegOnly = useSelector(selectIsNonVegOnly);

  console.log("restaurantDetails:", restaurantDetails);

  const dispatch = useDispatch();

  const { coverImage, restroName } = restaurantDetails;
  const { title: tableTitle } = tableDetailsById;

  return (
    <nav className="sticky top-0 z-10 bg-background ">
      <section className="flex items-center gap-4 p-2">
        <img
          src={coverImage?.url ?? LOGO}
          alt="logo"
          className="h-10 rounded-sm"
        />
        <h1>{restroName}</h1>
      </section>
      <section className="flex gap-4 p-2 bg-[#f8f8f8] items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-2 py-1 text-sm bg-white border shadow-md">
            <ScrollText size={15} className="text-red-700" />
            Bill
          </button>
          <div className="flex items-center gap-1 text-sm">
            <div className="p-2 bg-white border-2 rounded-full">
              <Utensils size={13} />
            </div>
            <p className="capitalize">{tableTitle}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              dispatch(toggleVegOnly());
            }}
            className={`flex items-center gap-1 px-3 py-1 text-sm bg-white border-2 rounded-3xl ${
              isVegOnly ? "shadow" : "shadow-sm"
            }`}
          >
            <Circle
              size={15}
              color={isVegOnly ? "green" : "black"}
              fill={isVegOnly ? "green" : "transparent"}
            />
            Veg
          </button>
          <button
            type="button"
            onClick={() => {
              dispatch(toggleNonVegOnly());
            }}
            className={`flex items-center gap-1 px-3 py-1 text-sm bg-white border-2 rounded-3xl ${
              isNonVegOnly ? "shadow" : "shadow-sm"
            }`}
          >
            <Circle
              size={15}
              color={isNonVegOnly ? "#c51f30" : "black"}
              fill={isNonVegOnly ? "#c51f30" : "transparent"}
            />
            Non Veg
          </button>
        </div>
      </section>
    </nav>
  );
};

export default TopNavBar;
