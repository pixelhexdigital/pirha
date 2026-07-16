import { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ImageIcon, Search, SlidersHorizontal } from "lucide-react";
import { useDebounce } from "hooks/useDebounce";

import TopNavBar from "components/TopNavBar";
import FoodGroupIndicator from "components/FoodGroupIndicator";
import EmptyState from "components/EmptyState";
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
import { numberToCurrency } from "lib/helper";

const DEBOUNCE_DELAY = 500;

const MenuPage = () => {
  const dispatch = useDispatch();
  const isVegOnly = useSelector(selectIsVegOnly);
  const isNonVegOnly = useSelector(selectIsNonVegOnly);

  const { categoryName } = useParams();
  const { state } = useLocation();
  const { items: data } = state || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");

  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

  const processedData = useMemo(() => {
    if (!data) return [];

    let result = [...data]?.filter((item) => item.isActive);

    if (isVegOnly) {
      result = result.filter((item) => item.foodGroup.toLowerCase() === "veg");
    } else if (isNonVegOnly) {
      result = result.filter(
        (item) => item.foodGroup.toLowerCase() === "non-veg"
      );
    }

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
      );
    }

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
    <div className="min-h-screen bg-background">
      <TopNavBar title={categoryName} />

      <main className="container max-w-4xl mx-auto px-4 py-6 pb-28">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
          <EmptyState title="No menu items found">
            {debouncedSearchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {processedData.map((menu) => {
              return (
                <div
                  key={menu._id}
                  className="flex bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FoodGroupIndicator foodGroup={menu.foodGroup} />
                    </div>

                    <h3 className="font-semibold text-lg">{menu.title}</h3>

                    <p className="font-medium text-lg mt-1">
                      {numberToCurrency(menu.price, "INR", 0)}
                    </p>

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
                        className="h-full w-full object-cover p-1 rounded-r-xl max-h-52"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex flex-col gap-2 items-center justify-center rounded-r-xl">
                        <ImageIcon className="size-8 text-muted-foreground/40" />
                        <span className="text-muted-foreground/60 text-xs">
                          No Image
                        </span>
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
