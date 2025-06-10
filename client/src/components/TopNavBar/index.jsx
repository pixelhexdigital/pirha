import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  Receipt,
  History,
  Filter,
  Utensils,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  selectIsVegOnly,
  selectIsNonVegOnly,
  toggleAllItems as setAllItems,
  toggleNonVegOnly as setNonVegOnly,
  toggleVegOnly as setVegOnly,
  selectRestaurantDetails,
} from "store/MiscellaneousSlice";

const TopNavBar = ({
  showSearch = false,
  showBackButton = true,
  title = "",
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tableId, restaurantId } = useParams();
  const restaurantDetails = useSelector(selectRestaurantDetails);

  const isVegOnly = useSelector(selectIsVegOnly);
  const isNonVegOnly = useSelector(selectIsNonVegOnly);

  const restaurantAvatar = restaurantDetails?.avatar?.url;

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearchToggle = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchQuery("");
    }
  };

  const handleFilterChange = (type) => {
    if (type === "veg") {
      dispatch(setVegOnly());
    } else if (type === "nonveg") {
      dispatch(setNonVegOnly());
    } else {
      dispatch(setAllItems());
    }
  };

  const handleViewBill = () => {
    navigate(`/bill/${tableId}/${restaurantId}`);
  };

  const handleViewHistory = () => {
    navigate(`/history/${tableId}/${restaurantId}`);
  };

  return (
    <header className="sticky top-0 z-10 w-full bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="sr-only">Back</span>
            </Button>
          )}

          {!isSearchVisible && (
            <div className="flex items-center gap-2">
              {restaurantAvatar ? (
                <img
                  src={restaurantAvatar}
                  alt="Restaurant logo"
                  className="w-8 h-8 rounded-full object-contain"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex">
                  <Utensils className="w-4 text-gray-600 m-auto" />
                </div>
              )}
              <h1 className="text-xl font-semibold">
                {title || "Restaurant Menu"}
              </h1>
            </div>
          )}

          {isSearchVisible && (
            <div className="flex-1 min-w-[200px]">
              <Input
                type="search"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <Button variant="ghost" size="icon" onClick={handleSearchToggle}>
              <Search className="w-5 h-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Filter className="w-5 h-5" />
                <span className="sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleFilterChange("all")}
                className={!isVegOnly && !isNonVegOnly ? "bg-muted" : ""}
              >
                All Items
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFilterChange("veg")}
                className={isVegOnly ? "bg-muted" : ""}
              >
                Veg Only
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFilterChange("nonveg")}
                className={isNonVegOnly ? "bg-muted" : ""}
              >
                Non-Veg Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={handleViewBill}>
            <Receipt className="w-5 h-5" />
            <span className="sr-only">View Bill</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={handleViewHistory}>
            <History className="w-5 h-5" />
            <span className="sr-only">Order History</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
