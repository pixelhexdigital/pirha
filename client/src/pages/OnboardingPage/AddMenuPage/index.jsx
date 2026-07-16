import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import { useSelector } from "react-redux";
import { twMerge } from "tailwind-merge";
import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";

import Field from "components/Field";
import { Button } from "components/ui/button";
import MenuItemAddDialog from "./MenuItemAddDialog";
import {
  useAddItemToCategoryMutation,
  useAddMenuCategoryMutation,
  useDeleteMenuCategoryMutation,
  useGetMyMenuQuery,
} from "api/menuApi";
import { selectRestaurantId } from "store/AuthSlice";
import {
  selectFoodGroups,
  selectMenuItemTypes,
} from "store/MiscellaneousSlice";
import { errorToast, numberToCurrency } from "lib/helper";
import { Separator } from "components/ui/separator";
import { Skeleton } from "components/ui/skeleton";
import { useOnboardDoneMutation } from "api/adminApi";
import { ButtonSpinner } from "components/Spinner";

const ADD_CATEGORY_SCHEMA = object().shape({
  categoryName: string().required("Category name is required"),
});

const predefinedCategories = [
  "Starter",
  "Main Course",
  "Dessert",
  "Beverages",
  "Salads",
  "Appetizers",
];

const AddMenuPage = ({ onComplete }) => {
  const itemType = useSelector(selectMenuItemTypes);
  const foodGroup = useSelector(selectFoodGroups);
  const restaurantId = useSelector(selectRestaurantId);

  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  const [createMenuCategory] = useAddMenuCategoryMutation();
  const [addItemToCategory] = useAddItemToCategoryMutation();
  const [deleteMenuCategory] = useDeleteMenuCategoryMutation();
  const [onboardDone, { isLoading: onboardDoneLoading }] =
    useOnboardDoneMutation();
  const { data: menuData, isLoading } = useGetMyMenuQuery();

  const {
    handleSubmit,
    register,
    setValue,
    setError,
    formState: { errors },
  } = useForm({ resolver: yupResolver(ADD_CATEGORY_SCHEMA) });

  useEffect(() => {
    if (menuData?.categories) {
      setCategories(
        menuData.categories.map((category) => ({
          ...category,
          items: category.items || [],
        }))
      );
    }
  }, [menuData]);

  const onCategorySubmit = (data) => {
    const { categoryName } = data || {};
    setValue("categoryName", "");
    handleAddCategory(categoryName);
  };

  const openModal = (category) => {
    setCurrentCategory(category);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const addMenuItemToCategory = async (data, resetForm) => {
    if (!currentCategory) return;
    const item = {
      title: data.itemName,
      description: data.description,
      price: data.itemPrice,
      discount: 0,
      itemType: data.itemType,
      foodGroup: data.foodGroup,
    };

    try {
      await addItemToCategory({
        categoryId: currentCategory._id,
        item,
      }).unwrap();
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat._id === currentCategory._id
            ? { ...cat, items: [...cat.items, item] }
            : cat
        )
      );
      setShowModal(false);
      resetForm();
    } catch (error) {
      errorToast({ error, message: "Failed to add item" });
    }
  };

  const handleAddCategory = async (categoryName) => {
    const isExistingCategory = categories.some(
      (category) =>
        category.name?.localeCompare(categoryName, undefined, {
          sensitivity: "accent",
        }) === 0
    );
    if (isExistingCategory) {
      setError("categoryName", {
        type: "manual",
        message: "Category already exists",
      });
      return;
    }

    try {
      const { data } = await createMenuCategory({
        name: categoryName,
        restaurantId,
      }).unwrap();
      setCategories((prevCategories) => [
        ...prevCategories,
        { ...data, items: [] },
      ]);
      setShowAddCategory(false);
    } catch (error) {
      errorToast({ error, message: "Failed to add category" });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteMenuCategory({ categoryId }).unwrap();
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category._id !== categoryId)
      );
    } catch (error) {
      errorToast({ error, message: "Failed to delete category" });
    }
  };

  const handleOnboardDone = async () => {
    try {
      await onboardDone().unwrap();
      onComplete();
    } catch (error) {
      errorToast({ error, message: "Failed to complete onboarding" });
    }
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 space-y-3 border rounded-lg">
              <Skeleton className="w-32 h-6" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="w-40 h-4" />
                  <Skeleton className="w-16 h-4" />
                </div>
                <Separator />
              </div>
              <Skeleton className="h-8 rounded-md w-28" />
            </div>
          ))}
        </div>
      ) : (
        categories?.map((category) => (
          <div
            key={category._id}
            className="relative p-4 mb-4 space-y-3 border rounded-lg"
          >
            <h3 className="pr-8 text-lg font-semibold">{category.name}</h3>
            {category?.items?.length ? (
              <ul className="p-0 space-y-2">
                {category.items.map((item, idx) => (
                  <li
                    key={item._id || idx}
                    className="flex justify-between gap-3 pb-2 border-b last:border-b-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate">{item?.title}</p>
                      {item?.description && (
                        <p className="text-sm truncate text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <p className="font-medium shrink-0">
                      {numberToCurrency(item.price)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No dishes yet — add your first below.
              </p>
            )}
            <Button
              onClick={() => openModal(category)}
              size="sm"
              variant="outline"
              className="gap-1.5"
            >
              <PlusIcon size={14} /> Add dish
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Delete ${category.name} category`}
              onClick={() => handleDeleteCategory(category._id)}
              className="absolute size-8 top-2 right-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2Icon size={16} />
            </Button>
          </div>
        ))
      )}

      {(categories.length === 0 || showAddCategory) && (
        <AddCategoryForm
          handleSubmit={handleSubmit}
          onCategorySubmit={onCategorySubmit}
          onQuickAdd={handleAddCategory}
          categories={categories}
          errors={errors}
          register={register}
        />
      )}

      {categories.length > 0 && (
        <Button
          onClick={() => setShowAddCategory((prev) => !prev)}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          {showAddCategory ? (
            <>
              <MinusIcon size={16} /> Cancel
            </>
          ) : (
            <>
              <PlusIcon size={16} /> Add category
            </>
          )}
        </Button>
      )}

      <MenuItemAddDialog
        open={showModal}
        onClose={closeModal}
        onAddItem={addMenuItemToCategory}
        itemType={itemType}
        foodGroup={foodGroup}
      />
      <div className="pt-6 mt-6 border-t">
        <Button
          onClick={handleOnboardDone}
          size="lg"
          className="w-full"
          disabled={categories.length === 0 || onboardDoneLoading}
        >
          {onboardDoneLoading ? <ButtonSpinner /> : "Finish setup"}
        </Button>
        {categories.length === 0 && (
          <p className="mt-2 text-xs text-center text-muted-foreground">
            Add at least one category to finish.
          </p>
        )}
      </div>
    </div>
  );
};

export default AddMenuPage;

const AddCategoryForm = ({
  handleSubmit,
  onCategorySubmit,
  onQuickAdd,
  categories,
  errors,
  register,
}) => {
  const suggestions = predefinedCategories.filter(
    (category) => !categories.some((cat) => cat.name === category)
  );

  return (
    <form
      onSubmit={handleSubmit(onCategorySubmit)}
      className={twMerge("mb-4", categories.length > 0 && "pt-4 border-t")}
    >
      <h3 className="mb-1 text-lg font-semibold">Add a category</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Tap a suggestion to add it instantly, or type your own.
      </p>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onQuickAdd(category)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border rounded-full border-input bg-background text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <PlusIcon size={14} className="text-muted-foreground" />
              {category}
            </button>
          ))}
        </div>
      )}
      <Field
        type="text"
        placeholder="Or enter a new category name"
        className="w-full"
        error={errors.categoryName?.message}
        {...register("categoryName")}
      />
      <Button type="submit" size="lg" className="w-full mt-4">
        Add category
      </Button>
    </form>
  );
};
