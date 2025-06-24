import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, Utensils } from "lucide-react";
import { useGetMenuCategoryByRestaurantIdQuery } from "api/menuApi";
import {
  useGetRestaurantDetailsByIdQuery,
  useGetTableDetailsByIdQuery,
} from "api/miscApi";

import TopNavBar from "components/TopNavBar";
import { Skeleton } from "components/ui/skeleton";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";
import { ROUTES } from "routes/RouterConfig";
import { selectRestaurantDetails } from "store/MiscellaneousSlice";
import CategoryFab from "components/CategoryFab";
import { useDebounce } from "hooks/useDebounce";

const DEBOUNCE_DELAY = 500;

const CategoriesPage = () => {
  const restaurantDetails = useSelector(selectRestaurantDetails);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const restaurantId = searchParams.get("restaurantId");
  const tableId = searchParams.get("tableId");

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

  // Redirect to Dashboard page if restaurantId or tableId is not present in the URL
  useEffect(() => {
    if (!restaurantId || !tableId) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [restaurantId, tableId, navigate]);

  const { data, error, isLoading } = useGetMenuCategoryByRestaurantIdQuery(
    restaurantId,
    {
      skip: !restaurantId || restaurantId === "null",
    }
  );
  useGetRestaurantDetailsByIdQuery(restaurantId, { skip: !restaurantDetails });
  useGetTableDetailsByIdQuery(tableId, { skip: !tableId });

  const filteredCategories =
    data?.menu?.categories?.filter((category) =>
      category?.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    ) || [];

  const isValidRestaurantId = restaurantId && restaurantId !== "null";
  const isValidTableId = tableId && tableId !== "null";

  if (!isValidRestaurantId || !isValidTableId) {
    return (
      <div className="container flex flex-col items-center justify-center h-screen">
        <h2 className="text-red-500 text-lg text-center">
          Invalid restaurant or table ID. Please select a valid restaurant and
          table.
        </h2>
        <p className="text-gray-500 mt-2 text-center">
          If you are seeing this message, please ensure that you have selected a
          valid restaurant and table from the dashboard.
        </p>
        <p className="text-gray-500 mt-2 text-center">
          If you are a restaurant owner, please{" "}
          <Link to={ROUTES.AUTH} className="text-blue-500 hover:underline">
            login
          </Link>{" "}
          to manage your restaurant.
        </p>
      </div>
    );
  }

  return (
    <div className="container flex flex-col gap-4">
      <TopNavBar
        showSearch={false}
        showBackButton={false}
        title={restaurantDetails?.restroName || "Restaurant Menu"}
      />
      <main className="container max-w-4xl mx-auto px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <h2 className="text-xl font-semibold mb-4">Categories</h2>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="h-32 w-full rounded-lg mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">Failed to load categories</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredCategories
              ?.filter((category) => category?.isActive)
              .map(({ _id, image, items, name }) => (
                <Link
                  key={_id}
                  to={`${ROUTES.MENU}/${tableId}/${restaurantId}/${name}`}
                  state={{ items } || {}}
                  className="h-auto flex flex-col items-center justify-center p-6 bg-white hover:bg-gray-50 border rounded-lg shadow-sm transition-all"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    {image?.url ? (
                      <img src={image?.url} alt={name} className="w-8 h-8" />
                    ) : (
                      <Utensils className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <span className="font-medium text-lg">{name}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {/* {items?.length || 0} items */}
                    {items?.filter((item) => item?.isActive).length || 0} Items
                  </span>
                </Link>
              ))}
          </div>
        )}
      </main>
      <CategoryFab />
    </div>
  );
};

export default CategoriesPage;
