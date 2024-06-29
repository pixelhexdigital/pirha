import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Circle } from "lucide-react";

import TopNavBar from "components/TopNavBar";
import { addToCart } from "store/CartSlice";
import { selectIsNonVegOnly, selectIsVegOnly } from "store/MiscellaneousSlice";

const MenuPage = () => {
  // Redux selectors for filtering options
  const dispatch = useDispatch();
  const isVegOnly = useSelector(selectIsVegOnly);
  const isNonVegOnly = useSelector(selectIsNonVegOnly);

  // React Router hooks for route parameters and state
  const { categoryName } = useParams();
  const { state } = useLocation();
  const { items: data } = state || {};

  // Memoized filtered data based on user's veg/non-veg preference
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (isVegOnly) {
      return data.filter((item) => item.foodGroup.toLowerCase() === "veg");
    }
    if (isNonVegOnly) {
      return data.filter((item) => item.foodGroup.toLowerCase() === "non-veg");
    }
    return data;
  }, [data, isVegOnly, isNonVegOnly]);

  const handleAddToCart = (menu) => {
    dispatch(addToCart({ item: menu }));
  };

  return (
    <div className="container flex flex-col gap-4">
      <TopNavBar />
      <div>
        <section className="flex items-center gap-4 p-2">
          <h2 className="h5">{categoryName}</h2>
        </section>
        <section className="grid flex-col items-center content-center justify-center w-full grid-cols-1 gap-4 px-4 py-2 mx-auto pb-28 lg:grid-cols-2">
          {filteredData?.length ? (
            filteredData.map((menu) => {
              const isVeg = menu.foodGroup.toLowerCase() === "veg";

              return (
                <article
                  key={menu._id}
                  className="grid w-full grid-cols-2 p-4 border rounded-lg shadow-md sm:grid-cols-5"
                >
                  <div className="space-y-2 sm:col-span-3">
                    <div
                      className={`border p-[2px] w-fit ${
                        isVeg ? "border-green-500" : "border-red-500"
                      }`}
                    >
                      <Circle
                        size={8}
                        color={isVeg ? "green" : "red"}
                        fill={isVeg ? "green" : "red"}
                      />
                    </div>
                    <h3 className="font-semibold">{menu.title}</h3>
                    <p className="font-semibold">
                      <span>&#8377;</span>
                      {menu.price}
                    </p>
                    <p className="text-sm opacity-70">{menu.description}</p>
                  </div>
                  <div className="h-56 sm:col-span-2">
                    {menu.image ? (
                      <img
                        src={menu.image.url}
                        alt={menu.title}
                        className="object-cover w-full h-48 rounded-lg"
                      />
                    ) : (
                      <div className="w-full bg-gray-200 rounded-lg h-36"></div>
                    )}
                    <div className="w-1/2 mx-auto min-w-32">
                      <button
                        className="w-full p-2 -mt-12 font-semibold text-red-700 transition-colors border border-red-700 rounded-lg bg-rose-50 hover:bg-rose-100 hover:text-rose-700 focus:outline-none focus:ring focus:ring-rose-300 focus:ring-opacity-50"
                        onClick={() => handleAddToCart(menu)}
                      >
                        ADD +
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <section className="flex items-center justify-center w-full h-32 text-center text-gray-500 ">
              No items available in this category.
            </section>
          )}
        </section>
      </div>
    </div>
  );
};

export default MenuPage;
