import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { PencilLine, SlidersVertical, Trash2 } from "lucide-react";

import DishForm from "./DishForm";
import Layout from "components/Layout";
import { Button } from "components/ui/button";
import { Switch } from "components/ui/switch";
import { Skeleton } from "components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "components/ui/alert-dialog";
import {
  selectFoodGroups,
  selectMenuItemTypes,
} from "store/MiscellaneousSlice";
import {
  useAddItemToCategoryMutation,
  useDeleteItemFromCategoryMutation,
  useGetMenuCategoryByRestaurantIdQuery,
  useToggleItemAvailabilityMutation,
  useUpdateImageOfItemMutation,
  useUpdateItemInCategoryMutation,
} from "api/menuApi";
import {
  selectMenuData,
  selectMenuCategoryData,
  updateItemImage,
  toggleItemAvailability,
  updateMenuDataByItemId,
  addItemToCategory,
  removeItemFromCategoryById,
} from "store/MenuSlice";
import { selectRestaurantId } from "store/AuthSlice";
import { ROUTES } from "routes/RouterConfig";
import { errorToast, successToast } from "lib/helper";

const DEFAULT_DELETE_ITEM_DATA = {
  itemId: null,
  itemName: null,
};

const FOOD_GROUP_BG_COLORS = {
  veg: "bg-green-500",
  nonVeg: "bg-red-500",
  egg: "bg-yellow-500",
  vegan: "bg-blue-500",
};

const FOOD_GROUP_BORDER_COLORS = {
  veg: "border-green-500",
  nonVeg: "border-red-500",
  egg: "border-yellow-500",
  vegan: "border-blue-500",
};

const ItemManagementPage = () => {
  const dispatch = useDispatch();
  const restaurantId = useSelector(selectRestaurantId);
  const itemType = useSelector(selectMenuItemTypes);
  const foodGroup = useSelector(selectFoodGroups);
  const menuData = useSelector(selectMenuData);
  const categoriesData = useSelector(selectMenuCategoryData);

  const [isFormVisible, setFormVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState();
  const [selectedDish, setSelectedDish] = useState(null);
  const [deleteItemData, setDeleteItemData] = useState(
    DEFAULT_DELETE_ITEM_DATA
  );

  const { isLoading } = useGetMenuCategoryByRestaurantIdQuery(restaurantId);
  const [addItemToCategoryMutationFn, { isLoading: isAddingItem }] =
    useAddItemToCategoryMutation();
  const [updateItemInCategoryMutationFn, { isLoading: isUpdatingItem }] =
    useUpdateItemInCategoryMutation();
  const [toggleItemAvailabilityMutationFn] =
    useToggleItemAvailabilityMutation();
  const [updateImageOfItemMutationFn, { isLoading: isUpdatingItemImage }] =
    useUpdateImageOfItemMutation();
  const [deleteItemFromCategoryMutationFn, { isLoading: isDeletingItem }] =
    useDeleteItemFromCategoryMutation();

  const navigate = useNavigate();
  const { state } = useLocation();
  const { categoryIdFromState } = state || { categoryIdFromState: null };
  const buttonLoader = Boolean(
    isAddingItem || isUpdatingItem || isUpdatingItemImage
  );

  useEffect(() => {
    if (!categoriesData) return;
    const id = categoryIdFromState || categoriesData[0]?._id;
    setActiveCategory(id);
  }, [categoriesData, categoryIdFromState]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const navigateToCategory = () => {
    navigate(ROUTES.CATEGORIES_MANAGEMENT);
  };

  const addItemToMenu = async (payload) => {
    try {
      const { data } = await addItemToCategoryMutationFn(payload).unwrap();
      dispatch(
        addItemToCategory({
          categoryId: payload.categoryId,
          newItem: data.data,
        })
      );

      const imagePayload = {
        ...payload,
        itemId: data.data._id,
      };
      changeItemImage({ data: imagePayload, isAddingItem: true });
    } catch (error) {
      console.error(error);
    }
  };

  const editItemInCategory = async (payload) => {
    try {
      await updateItemInCategoryMutationFn(payload).unwrap();
      dispatch(
        updateMenuDataByItemId({
          categoryId: payload.categoryId,
          itemId: payload.itemId,
          updatedItem: payload.item,
        })
      );
      changeItemImage({ data: payload, isAddingItem: false });
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormSubmit = async (data) => {
    const payload = {
      categoryId: activeCategory,
      item: { ...data },
    };

    console.log("payload", payload);

    if (selectedDish) {
      payload.itemId = selectedDish._id;
      editItemInCategory(payload);
    } else {
      addItemToMenu(payload);
    }
  };

  const updateItemAvailability = async (itemId, isActive) => {
    try {
      const payload = {
        isActive,
        itemId,
        categoryId: activeCategory,
      };

      await toggleItemAvailabilityMutationFn(payload);
      dispatch(toggleItemAvailability(payload));
    } catch (error) {
      console.error(error);
    }
  };

  const changeItemImage = async ({ data, isAddingItem }) => {
    const message = isAddingItem
      ? "Item added successfully"
      : "Item updated successfully";

    const { imageFile, isImageChanged, imageUrl } = data.item;
    if (!imageFile || !isImageChanged) {
      setFormVisible(false);
      successToast({ message });
      return;
    }
    const payload = {
      categoryId: data.categoryId,
      itemId: data.itemId,
      itemImage: imageFile,
      imageUrl: imageUrl,
    };

    try {
      await updateImageOfItemMutationFn(payload);
      dispatch(updateItemImage(payload));
      setFormVisible(false);
      successToast({ message });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteItemFromCategory = async () => {
    try {
      const payload = {
        categoryId: activeCategory,
        itemId: deleteItemData.itemId,
      };
      await deleteItemFromCategoryMutationFn(payload);
      dispatch(removeItemFromCategoryById(payload));
      setDeleteItemData(DEFAULT_DELETE_ITEM_DATA);
    } catch (error) {
      console.error(error);
      errorToast({ error });
    }
  };

  const onCloseDishForm = () => {
    setFormVisible(false);
    setSelectedDish(null);
  };

  const selectedCategory = menuData?.categories.find(
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
              : categoriesData
                  ?.filter(
                    (category) =>
                      category.isActive || category._id === categoryIdFromState
                  )
                  .map((category) => (
                    <button
                      key={category?._id}
                      onClick={() => handleCategoryChange(category._id)}
                      className={twMerge(
                        "flex items-center justify-center pb-3 mb-1 gap-2 transition-all delay-100 border-b-2 hover:text-primary hover:border-primary border-b-transparent",
                        // category?.isActive ? "text-primary" : "text-gray-500",
                        activeCategory === category._id &&
                          "text-primary text-[1.2rem] border-primary"
                      )}
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
                    className="w-full gap-4 pt-4 transition ease-in-out delay-150 transform scale-[0.98] border rounded-lg shadow-sm hover:shadow-md border-primary/10 hover:border-primary/20 hover:scale-100 bg-white/100 hover:-translate-y-1 duration-300 flex flex-col  justify-between group"
                  >
                    <div className="flex flex-col justify-end ">
                      <div className="flex items-center justify-between px-4 pb-2 mb-4 border-b border-primary/10">
                        <button
                          onClick={() =>
                            setDeleteItemData({
                              itemId: item._id,
                              itemName: item.title,
                            })
                          }
                        >
                          <Trash2
                            size={22}
                            color="red"
                            className="transition-all duration-300 ease-in-out transform cursor-pointer hover:scale-110 hover:text-red-500"
                          />
                        </button>
                        <div className="flex items-center justify-end gap-4">
                          <div
                            className={twMerge(
                              "border p-[4px] w-fit",
                              FOOD_GROUP_BORDER_COLORS[
                                item.foodGroup?.toLowerCase()
                              ]
                            )}
                          >
                            <div
                              className={twMerge(
                                "size-2.5 rounded-full",
                                FOOD_GROUP_BG_COLORS[
                                  item.foodGroup?.toLowerCase()
                                ]
                              )}
                            />
                          </div>
                          <Switch
                            checked={item.isActive}
                            onCheckedChange={(isActive) =>
                              updateItemAvailability(item._id, isActive)
                            }
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-center w-full">
                        <img
                          src={item.image?.url}
                          alt={item.title}
                          className="rounded-md aspect-square size-44 md:size-48 lg:size-52"
                        />
                        <h3 className="mt-4 font-semibold">{item?.title}</h3>
                        <p className="text-sm opacity-70">
                          {item?.description}
                        </p>
                        <p className="font-semibold"></p>
                        <p className="mt-2 text-primary">
                          <span>&#8377;</span>
                          {item.price}
                          <span className="text-sm text-red-500">
                            {item?.discount ? `(${item?.discount}% off)` : ""}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setFormVisible(true);
                        setSelectedDish(item);
                      }}
                      className="flex items-center justify-center w-full p-4 text-primary/80 border-primary bg-primary/10 rounded-br-md hover:bg-primary/20 hover:text-primary/90 hover:border-primary group hover:font-semibold"
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
        loader={buttonLoader}
        onSubmit={handleFormSubmit}
        itemType={itemType}
        foodGroup={foodGroup}
        defaultValues={selectedDish}
        onClose={onCloseDishForm}
      />

      <AlertDialog
        open={deleteItemData.itemId}
        onOpenChange={() => setDeleteItemData(DEFAULT_DELETE_ITEM_DATA)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">{deleteItemData.itemName}</span>{" "}
              From the menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row items-center justify-end gap-4">
            <AlertDialogCancel className="w-24 mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteItemFromCategory}
              className="w-24"
            >
              {isDeletingItem ? <div className="ring-loader" /> : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ItemManagementPage;
