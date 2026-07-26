import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { Plus, Search, SlidersVertical, UtensilsCrossed } from "lucide-react";

import DishForm from "./DishForm";
import MenuManagementCard from "../MenuManagementCard";
import Layout from "components/Layout";
import { ButtonSpinner } from "components/Spinner";
import PageHeader from "components/PageHeader";
import EmptyState from "components/EmptyState";
import FoodGroupIndicator from "components/FoodGroupIndicator";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
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
import { selectFoodGroups, selectMenuItemTypes } from "store/MiscellaneousSlice";
import {
  useAddItemToCategoryMutation,
  useDeleteItemFromCategoryMutation,
  useGetMenuCategoryByRestaurantIdQuery,
  useToggleItemAvailabilityMutation,
  useUpdateImageOfItemMutation,
  useUpdateItemInCategoryMutation,
} from "api/menuApi";
import { selectRestaurantId } from "store/AuthSlice";
import { ROUTES } from "routes/RouterConfig";
import { errorToast, successToast, numberToCurrency } from "lib/helper";
import { useDebounce } from "hooks/useDebounce";

const DEFAULT_DELETE_ITEM_DATA = {
  itemId: null,
  itemName: null,
};

const SEARCH_DEBOUNCE = 300;

const ItemManagementPage = () => {
  const restaurantId = useSelector(selectRestaurantId);
  const itemType = useSelector(selectMenuItemTypes);
  const foodGroup = useSelector(selectFoodGroups);

  const [isFormVisible, setFormVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState();
  const [selectedDish, setSelectedDish] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingItemId, setPendingItemId] = useState(null);
  const [deleteItemData, setDeleteItemData] = useState(DEFAULT_DELETE_ITEM_DATA);

  const debouncedSearch = useDebounce(searchQuery, SEARCH_DEBOUNCE);

  // Single source of truth: the menu comes straight from the query cache.
  const { data, isLoading } = useGetMenuCategoryByRestaurantIdQuery(
    restaurantId,
    { skip: !restaurantId }
  );
  const categoriesData = data?.menu?.categories ?? [];

  const [addItemMutationFn, { isLoading: isAddingItem }] =
    useAddItemToCategoryMutation();
  const [updateItemMutationFn, { isLoading: isUpdatingItem }] =
    useUpdateItemInCategoryMutation();
  const [toggleItemMutationFn] = useToggleItemAvailabilityMutation();
  const [updateItemImageMutationFn, { isLoading: isUpdatingItemImage }] =
    useUpdateImageOfItemMutation();
  const [deleteItemMutationFn, { isLoading: isDeletingItem }] =
    useDeleteItemFromCategoryMutation();

  const navigate = useNavigate();
  const { state } = useLocation();
  const { categoryIdFromState } = state || { categoryIdFromState: null };
  const buttonLoader = Boolean(
    isAddingItem || isUpdatingItem || isUpdatingItemImage
  );

  useEffect(() => {
    if (!categoriesData.length) return;
    const stillExists = categoriesData.some((c) => c._id === activeCategory);
    if (stillExists) return;
    const id = categoryIdFromState || categoriesData[0]?._id;
    setActiveCategory(id);
  }, [categoriesData, categoryIdFromState, activeCategory]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setSearchQuery("");
  };

  const navigateToCategory = () => navigate(ROUTES.CATEGORIES_MANAGEMENT);

  const openAddDish = () => {
    setSelectedDish(null);
    setFormVisible(true);
  };

  const addItemToMenu = async (payload) => {
    try {
      const { data: newItem } = await addItemMutationFn(payload).unwrap();
      const imagePayload = { ...payload, itemId: newItem?._id };
      changeItemImage({ data: imagePayload, isAddingItem: true });
    } catch (error) {
      errorToast({ error, message: "Failed to add item to menu" });
    }
  };

  const editItemInCategory = async (payload) => {
    try {
      await updateItemMutationFn(payload).unwrap();
      changeItemImage({ data: payload, isAddingItem: false });
    } catch (error) {
      errorToast({ error, message: "Failed to update item in menu" });
    }
  };

  const handleFormSubmit = async (formData) => {
    const payload = {
      categoryId: activeCategory,
      item: { ...formData },
    };

    if (selectedDish) {
      payload.itemId = selectedDish._id;
      editItemInCategory(payload);
    } else {
      addItemToMenu(payload);
    }
  };

  const handleToggleItem = async (item, nextActive) => {
    setPendingItemId(item._id);
    try {
      await toggleItemMutationFn({
        categoryId: activeCategory,
        itemId: item._id,
        isActive: nextActive,
        restaurantId,
      }).unwrap();
    } catch (error) {
      errorToast({ error, message: "Failed to update availability" });
    } finally {
      setPendingItemId(null);
    }
  };

  const changeItemImage = async ({ data: payloadData, isAddingItem: adding }) => {
    const message = adding ? "Item added" : "Item updated";
    const { imageFile, isImageChanged } = payloadData.item;

    if (!imageFile || !isImageChanged) {
      setFormVisible(false);
      successToast({ message });
      return;
    }

    try {
      await updateItemImageMutationFn({
        categoryId: payloadData.categoryId,
        itemId: payloadData.itemId,
        itemImage: imageFile,
      }).unwrap();
      setFormVisible(false);
      successToast({ message });
    } catch (error) {
      errorToast({ error, message: "Failed to update item image" });
    }
  };

  const deleteItemFromCategory = async () => {
    try {
      await deleteItemMutationFn({
        categoryId: activeCategory,
        itemId: deleteItemData.itemId,
      }).unwrap();
      setDeleteItemData(DEFAULT_DELETE_ITEM_DATA);
      successToast({ message: "Item deleted" });
    } catch (error) {
      errorToast({ error, message: "Failed to delete item from category" });
    }
  };

  const onCloseDishForm = () => {
    setFormVisible(false);
    setSelectedDish(null);
  };

  const visibleCategories = categoriesData.filter(
    (category) => category.isActive || category._id === categoryIdFromState
  );
  const selectedCategory = categoriesData.find(
    (category) => category._id === activeCategory
  );
  const categoryItems = selectedCategory?.items ?? [];
  const filteredItems = debouncedSearch
    ? categoryItems.filter((item) => {
        const query = debouncedSearch.toLowerCase();
        return (
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
        );
      })
    : categoryItems;

  const noCategories = !isLoading && categoriesData.length === 0;

  return (
    <Layout>
      <PageHeader
        title="Menu Items"
        description="Manage the dishes in each category"
      >
        <Button variant="outline" onClick={navigateToCategory} className="h-9">
          <SlidersVertical className="mr-3 size-4" />
          Manage Categories
        </Button>
      </PageHeader>

      {noCategories ? (
        <div className="mx-auto w-[98%]">
          <EmptyState
            icon={UtensilsCrossed}
            title="No categories yet"
            description="Menu items live inside categories. Create a category first, then add dishes to it."
          >
            <Button onClick={navigateToCategory}>Create a category</Button>
          </EmptyState>
        </div>
      ) : (
        <div className="mx-auto w-[98%] space-y-4 rounded-md bg-card shadow-md ring-1 ring-border">
          <div className="w-full px-4 pt-4">
            <section className="flex w-full gap-6 overflow-x-auto border-b border-border">
              {isLoading
                ? [...Array(5)].map((_, index) => (
                    <Skeleton
                      key={index}
                      className="mb-3 h-[35px] w-[110px] shrink-0 rounded-xl"
                    />
                  ))
                : visibleCategories.map((category) => (
                    <button
                      key={category?._id}
                      onClick={() => handleCategoryChange(category._id)}
                      className={twMerge(
                        "shrink-0 whitespace-nowrap border-b-2 border-transparent pb-3 -mb-px font-medium text-muted-foreground transition-colors hover:text-primary",
                        activeCategory === category._id &&
                          "border-primary text-primary"
                      )}
                    >
                      {category?.name}
                    </button>
                  ))}
            </section>
          </div>

          {!isLoading && (
            <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search items in this category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  disabled={!categoryItems.length}
                />
              </div>
              <Button
                onClick={openAddDish}
                className="h-9 shrink-0"
                disabled={!activeCategory}
              >
                {isAddingItem ? (
                  <ButtonSpinner />
                ) : (
                  <>
                    <Plus className="mr-2 size-4" />
                    Add dish
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="p-4 pt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <Skeleton key={index} className="h-[320px] w-full rounded-lg" />
                ))}
              </div>
            ) : categoryItems.length === 0 ? (
              <EmptyState
                icon={UtensilsCrossed}
                title="No items in this category yet"
                description="Add your first dish to this category and it'll show up here."
              >
                <Button onClick={openAddDish}>Add dish</Button>
              </EmptyState>
            ) : filteredItems.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No matching items"
                description={`Nothing in this category matches "${debouncedSearch}".`}
              >
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              </EmptyState>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <MenuManagementCard
                    key={item?._id}
                    imageUrl={item?.image?.url}
                    title={item?.title}
                    subtitle={item?.description}
                    meta={
                      <FoodGroupIndicator
                        foodGroup={item?.foodGroup}
                        className="p-[4px]"
                      />
                    }
                    footerLeft={
                      <span className="font-semibold tabular-nums text-foreground">
                        {numberToCurrency(item?.price, "INR", 2)}
                      </span>
                    }
                    isActive={item?.isActive}
                    isToggling={pendingItemId === item?._id}
                    onToggleAvailability={(next) => handleToggleItem(item, next)}
                    onEdit={() => {
                      setSelectedDish(item);
                      setFormVisible(true);
                    }}
                    onDelete={() =>
                      setDeleteItemData({
                        itemId: item?._id,
                        itemName: item?.title,
                      })
                    }
                    editLabel="Edit item"
                    deleteLabel="Delete item"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
        open={Boolean(deleteItemData.itemId)}
        onOpenChange={() => setDeleteItemData(DEFAULT_DELETE_ITEM_DATA)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">{deleteItemData.itemName}</span>{" "}
              from the menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row items-center justify-end gap-4">
            <AlertDialogCancel className="mt-0 w-24">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteItemFromCategory} className="w-24">
              {isDeletingItem ? <ButtonSpinner /> : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ItemManagementPage;
