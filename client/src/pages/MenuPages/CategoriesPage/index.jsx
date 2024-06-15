import { Link, useLocation } from "react-router-dom";
import { useGetMenuCategoryByIdQuery } from "api/menuApi";
import {
  useGetRestaurantDetailsByIdQuery,
  useGetTableDetailsByIdQuery,
} from "api/miscApi";

import TopNavBar from "components/TopNavBar";
import { ROUTES } from "routes/RouterConfig";

const CategoriesPage = () => {
  // get id from the URL which is passed as ?tableId=123?restaurantId=123
  const { search } = useLocation();
  const restaurantId = new URLSearchParams(search).get("restaurantId");
  const tableId = new URLSearchParams(search).get("tableId");

  const { data, error, isLoading } = useGetMenuCategoryByIdQuery(restaurantId);
  useGetRestaurantDetailsByIdQuery(restaurantId);
  useGetTableDetailsByIdQuery(tableId);

  console.log("data", data);

  return (
    <div className="container flex flex-col gap-4">
      <TopNavBar />
      <div className="w-full">
        <h1 className="mb-4 font-semibold">Categories</h1>
        <section className="grid items-center content-center justify-center grid-cols-2 gap-4 px-4 py-2 mx-auto sm:grid-cols-3">
          {data?.menu?.categories?.map(({ image, items, name }, index) => (
            <Link
              key={index}
              to={`${ROUTES.MENU}/${tableId}/${restaurantId}/${name}`}
              state={{ items } || {}}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg shadow-md bg-card ring-1 ring-slate-800 ring-opacity-20"
            >
              <img src={image} alt={name} className="size-28" />
              <h2>{name}</h2>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
};

export default CategoriesPage;
