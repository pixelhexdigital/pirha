import { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ImageIcon, Search, SlidersHorizontal } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useDebounce } from "hooks/useDebounce";

import TopNavBar from "components/TopNavBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { addToCart } from "store/CartSlice";
import { selectIsNonVegOnly, selectIsVegOnly } from "store/MiscellaneousSlice";

const FOOD_GROUP_BG_COLORS = {
  veg: "bg-green-500",
  "non-veg": "bg-red-500",
  egg: "bg-yellow-500",
  vegan: "bg-blue-500",
};

const FOOD_GROUP_BORDER_COLORS = {
  veg: "border-green-500",
  "non-veg": "border-red-500",
  egg: "border-yellow-500",
  vegan: "border-blue-500",
};

const DEBOUNCE_DELAY = 500; // milliseconds

const MenuPage = () => {
  // Redux selectors for filtering options
  const dispatch = useDispatch();
  const isVegOnly = useSelector(selectIsVegOnly);
  const isNonVegOnly = useSelector(selectIsNonVegOnly);

  // React Router hooks for route parameters and state
  const { categoryName } = useParams();
  const { state } = useLocation();
  const { items: data } = state || {};

  // Local state for search and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default"); // default, price-asc, price-desc

  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

  // Memoized filtered and sorted data based on user's preferences
  const processedData = useMemo(() => {
    if (!data) return [];

    // First filter by veg/non-veg preference
    let result = [...data]?.filter((item) => item.isActive);

    if (isVegOnly) {
      result = result.filter((item) => item.foodGroup.toLowerCase() === "veg");
    } else if (isNonVegOnly) {
      result = result.filter(
        (item) => item.foodGroup.toLowerCase() === "non-veg"
      );
    }

    // Then filter by search query
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
      );
    }

    // Finally sort according to selected option
    if (sortOption === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === "name-asc") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [data, isVegOnly, isNonVegOnly, debouncedSearchQuery, sortOption]);

  const handleAddToCart = (menu) => {
    dispatch(addToCart({ item: menu }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavBar title={categoryName} />

      <main className="container max-w-4xl mx-auto px-4 py-6 pb-28">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="h-9">
              <Button variant="outline" size="icon" className="ml-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Sort options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setSortOption("default")}
                className={sortOption === "default" ? "bg-muted" : ""}
              >
                Default
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortOption("price-asc")}
                className={sortOption === "price-asc" ? "bg-muted" : ""}
              >
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortOption("price-desc")}
                className={sortOption === "price-desc" ? "bg-muted" : ""}
              >
                Price: High to Low
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortOption("name-asc")}
                className={sortOption === "name-asc" ? "bg-muted" : ""}
              >
                Name: A to Z
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {processedData.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No menu items found</p>
            {debouncedSearchQuery && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {processedData.map((menu) => {
              return (
                <div
                  key={menu._id}
                  className="flex bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={twMerge(
                          "border p-[2px]",
                          FOOD_GROUP_BORDER_COLORS[
                            menu.foodGroup?.toLowerCase()
                          ]
                        )}
                      >
                        <div
                          className={twMerge(
                            "size-2.5 rounded-full",
                            FOOD_GROUP_BG_COLORS[menu.foodGroup?.toLowerCase()]
                          )}
                        />
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg">{menu.title}</h3>

                    <p className="font-medium text-lg mt-1">₹{menu.price}</p>

                    {menu.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {menu.description}
                      </p>
                    )}

                    <Button
                      onClick={() => handleAddToCart(menu)}
                      variant="outline"
                      className="mt-3 text-primary border-primary hover:bg-primary/10"
                    >
                      Add to Order
                    </Button>
                  </div>

                  <div className="w-2/4 relative max-w-60">
                    {menu.image?.url ? (
                      <img
                        src={menu.image.url || "/placeholder.svg"}
                        alt={menu.title}
                        className="h-full w-full object-cover p-1 rounded-r-lg max-h-52"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex flex-col gap-2 items-center justify-center">
                        <span className="text-muted-foreground text-xs">
                          No Image Available
                        </span>
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MenuPage;
