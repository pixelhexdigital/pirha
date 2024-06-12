import { useLocation, useParams } from "react-router-dom";

import TopNavBar from "components/TopNavBar";
import { Circle } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "store/CartSlice";

const MenuPage = () => {
  const { categoryName, tableId, restaurantId } = useParams();
  const { state } = useLocation();
  const { items: data } = state || {};

  const dispatch = useDispatch();

  return (
    <div className="container flex flex-col gap-4">
      <TopNavBar />
      <div>
        <section className="flex items-center gap-4 p-2">
          <h2>{categoryName}</h2>
        </section>
        <section className="grid flex-col items-center content-center justify-center w-full grid-cols-1 gap-4 px-4 py-2 mx-auto f lg:grid-cols-2">
          {data.map((menu) => (
            <div
              key={menu._id}
              className="grid w-full grid-cols-2 p-4 border rounded-lg shadow-md sm:grid-cols-5"
            >
              {console.log("menu", menu)}
              <div className="space-y-2 sm:col-span-3">
                <div
                  className={`border p-[2px] w-fit ${
                    menu.veg ? "border-green-500" : "border-red-500"
                  }`}
                >
                  <Circle
                    size={8}
                    color={menu.veg ? "green" : "red"}
                    fill={menu.veg ? "green" : "red"}
                  />
                </div>
                <h3 className="font-semibold">{menu.title}</h3>
                <p className="font-semibold">
                  <span>&#8377;</span>
                  {menu.price}
                </p>

                <p className="text-sm opacity-70">[{menu.description}]</p>
              </div>

              <div className="h-56 sm:col-span-2">
                {menu.image ? (
                  <img
                    src={menu.image.url}
                    alt={menu.title}
                    className="object-cover w-full h-48 rounded-lg"
                  />
                ) : (
                  <div className="w-full h-36"></div>
                )}
                <div className="w-1/2 mx-auto min-w-32">
                  <button
                    className="w-full p-2 -mt-12 font-semibold text-red-700 transition-colors border border-red-700 rounded-lg bg-rose-50 hover:bg-rose-100 hover:text-rose-700 focus:outline-none focus:ring focus:ring-rose-300 focus:ring-opacity-50 "
                    onClick={() => {
                      dispatch(addToCart({ item: menu }));
                    }}
                  >
                    ADD +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default MenuPage;
