import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { PencilLine, SlidersVertical } from "lucide-react";

import DishForm from "./DishForm";
import Layout from "components/Layout";
import { Button } from "components/ui/button";
import { Skeleton } from "components/ui/skeleton";
import {
  selectFoodGroups,
  selectMenuItemTypes,
} from "store/MiscellaneousSlice";
import { ROUTES } from "routes/RouterConfig";
import {
  useAddItemToCategoryMutation,
  useGetMenuCategoryByRestaurantIdQuery,
} from "api/menuApi";
import { selectRestaurantId } from "store/AuthSlice";

import { Switch } from "components/ui/switch";
import { successToast } from "lib/helper";

const MenuManagementPage = () => {
  const restaurantId = useSelector(selectRestaurantId);
  const itemType = useSelector(selectMenuItemTypes);
  const foodGroup = useSelector(selectFoodGroups);

  const { data: menuData, isLoading } =
    useGetMenuCategoryByRestaurantIdQuery(restaurantId);
  const [addItemToCategory, { isLoading: isAddingItem, error: addItemError }] =
    useAddItemToCategoryMutation();

  console.log("menuData", menuData);

  const [isFormVisible, setFormVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState();
  const [selectedDish, setSelectedDish] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!menuData?.menu) return;
    setActiveCategory(menuData?.menu?.categories[0]?._id);
  }, [menuData]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const navigateToCategory = () => {
    navigate(ROUTES.CATEGORIES_MANAGEMENT);
  };

  const handleFormSubmit = async (data) => {
    // Handle form submission logic here
    console.log(data);
    try {
      const response = await addItemToCategory({
        categoryId: activeCategory,
        item: data,
      }).unwrap();
      successToast({ data: response, message: "Item added successfully" });
      setFormVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  const selectedCategory = menuData?.menu?.categories.find(
    (category) => category._id === activeCategory
  );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="mb-4 h4">Menu Management</h2>
        <Button variant="outline" onClick={navigateToCategory} className="h-9">
          <SlidersVertical className="mr-3 size-4" />
          Manage Categories
        </Button>
      </div>
      <div className="space-y-4 w-[98%] mx-auto bg-white rounded-md shadow-md ring-1 ring-black/5">
        <div className="w-full p-4 ">
          <section className="flex w-full p-2 pb-4 overflow-x-scroll gap-x-7">
            {isLoading
              ? [...Array(5)].map((_, index) => (
                  <Skeleton
                    key={index}
                    className="w-[110px] h-[35px] rounded-xl"
                  />
                ))
              : menuData?.menu?.categories?.map((category) => (
                  <button
                    key={category?._id}
                    onClick={() => handleCategoryChange(category._id)}
                    className={`flex items-center justify-center pb-3 mb-1 gap-2 transition-all delay-100 border-b-2  ${
                      activeCategory === category._id
                        ? "text-primary text-[1.2rem] border-primary"
                        : "hover:text-primary hover:border-primary border-b-transparent"
                    }`}
                  >
                    <h4>{category?.name}</h4>
                  </button>
                ))}
          </section>
          <div
            className={twMerge(
              "w-full h-px ml-2 -mt-[1.35rem] bg-black/10",
              isLoading && "-mt-0"
            )}
          />
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-3 sm:grid-cols-2">
          {isLoading ? (
            [...Array(6)].map((_, index) => (
              <Skeleton key={index} className="w-full h-[350px] rounded-lg" />
            ))
          ) : (
            <>
              <button
                onClick={() => {
                  setFormVisible(true);
                  setSelectedDish(null);
                }}
                className="flex flex-col items-center justify-center w-full p-4 transition ease-in-out delay-150 duration-300 border border-dotted rounded-lg scale-[0.98] shadow-sm border-primary hover:scale-100 hover:text-primary/90 hover:border-primary min-h-80 group"
              >
                {!isAddingItem ? (
                  <>
                    <h3 className="text-3xl transition duration-300 delay-200 group-hover:-translate-y-1 text-primary group-hover:animate-pulse group-hover:text-primary/90 group-hover:font-semibold ">
                      +
                    </h3>
                    <h3 className="font-semibold text-primary">Add New Dish</h3>
                  </>
                ) : (
                  <div className="ring-loader border-primary/80" />
                )}
              </button>
              {selectedCategory &&
                selectedCategory?.items?.map((item) => (
                  <article
                    key={item._id}
                    className="w-full gap-4 pt-4 transition ease-in-out delay-150 transform scale-[0.98] border rounded-lg shadow-sm hover:shadow-md border-primary/10 hover:border-primary/20 hover:scale-100 bg-white/100 hover:-translate-y-1 duration-300"
                  >
                    <div className="flex items-center justify-between px-4 pb-2 mb-4 border-b m border-primary/10">
                      <div
                        className={`border mb-2 p-[4px] w-fit ${
                          item.foodGroup.toLowerCase() === "veg"
                            ? "border-green-500"
                            : "border-red-500"
                        }`}
                      >
                        <div
                          className={`size-2.5 rounded-full ${
                            item.foodGroup.toLowerCase() === "veg"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                      </div>
                      <Switch id="airplane-mode" />
                    </div>
                    <div className="flex flex-col items-center w-full">
                      <img
                        src={item.image.url}
                        alt={item.title}
                        className="rounded-md aspect-square size-44 md:size-48 lg:size-52"
                      />
                      <h3 className="mt-4 font-semibold">{item.title}</h3>
                      <p className="text-sm opacity-70">{item.description}</p>
                      <p className="font-semibold"></p>
                      <p className="mt-2 text-primary">
                        <span>&#8377;</span>
                        {item.price}
                        <span className="text-sm text-red-500">
                          {item.discount ? `(${item.discount}% off)` : ""}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setFormVisible(true);
                        setSelectedDish(item);
                      }}
                      className="flex items-center justify-center w-full p-4 mt-4 text-primary/80 border-primary bg-primary/10 rounded-b-md hover:bg-primary/20 hover:text-primary/90 hover:border-primary group hover:font-semibold"
                    >
                      <PencilLine className="mr-2 transition-all size-5 group-hover:size-6" />
                      Edit Dish
                    </button>
                  </article>
                ))}
            </>
          )}
        </div>
      </div>

      <DishForm
        isOpen={isFormVisible}
        loader={isAddingItem}
        onSubmit={handleFormSubmit}
        itemType={itemType}
        foodGroup={foodGroup}
        defaultValues={selectedDish}
        onClose={() => setFormVisible(false)}
      />
    </Layout>
  );
};

export default MenuManagementPage;
