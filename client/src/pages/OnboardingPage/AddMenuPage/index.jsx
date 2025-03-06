import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { object, string } from "yup";
import { useSelector } from "react-redux";
import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";

import Field from "components/Field";
import { Button } from "components/ui/button";
import { ROUTES } from "routes/RouterConfig";
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

const AddMenuPage = () => {
  const navigate = useNavigate();
  const itemType = useSelector(selectMenuItemTypes);
  const foodGroup = useSelector(selectFoodGroups);
  const restaurantId = useSelector(selectRestaurantId);

  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  const [createMenuCategory] = useAddMenuCategoryMutation();
  const [addItemToCategory] = useAddItemToCategoryMutation();
  const [deleteMenuCategory] = useDeleteMenuCategoryMutation();
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
    setSelectedCategory(data.categoryName);
    setValue("categoryName", "");
    handleAddCategory(categoryName);
  };

  const openModal = (category) => {
    setCurrentCategory(category);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const addMenuItemToCategory = async (data, resetForm) => {
    console.log("data", data);
    if (!currentCategory) return;
    const item = {
      title: data.itemName,
      description: data.description,
      price: data.itemPrice,
      discount: 0,
      itemType: data.itemType,
      foodGroup: data.foodGroup,
    };
    console.log("item", item);
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
      console.error("Failed to add item:", error);
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

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setValue("categoryName", category);
  };

  console.log("categories", categories);

  return (
    <div className="w-full max-w-xl px-4 mx-auto">
      <h2 className="mb-4 font-semibold text-n-4/80">
        Add your menu categories and items to get started with your restaurant
        menu setup 🍔. You can always edit or add more items later.
      </h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        categories?.map((category) => (
          <div
            key={category._id}
            className="relative p-4 mb-4 space-y-4 rounded-md bg-slate-200"
          >
            <h3 className="mb-2 text-lg font-semibold">{category.name}</h3>
            <ul className="p-0 space-y-2">
              {category.items.map((item) => (
                <>
                  <li key={item._id} className="flex justify-between">
                    <div>
                      <p className="mb-1">{item.title}</p>
                      <p className="text-sm text-n-4/50">{item.description}</p>
                    </div>
                    <div>
                      <p className="text-n-4/80">
                        {numberToCurrency(item.price)}
                        {item.discount > 0 && `(${item.discount} off)`}
                      </p>
                    </div>
                  </li>
                  <Separator />
                </>
              ))}
            </ul>
            <Button
              onClick={() => openModal(category)}
              size="sm"
              className="mb-2"
            >
              Add Menu Item
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteCategory(category._id)}
              className="absolute top-2 right-2 hover:text-destructive"
            >
              <Trash2Icon size={20} />
            </Button>
          </div>
        ))
      )}

      {(categories.length === 0 || showAddCategory) && (
        <AddCategoryForm
          handleSubmit={handleSubmit}
          onCategorySubmit={onCategorySubmit}
          categories={categories}
          selectedCategory={selectedCategory}
          handleSelectCategory={handleSelectCategory}
          errors={errors}
          register={register}
        />
      )}

      {categories.length > 0 && (
        <Button
          onClick={() => setShowAddCategory((prev) => !prev)}
          size="lg"
          variant="secondary"
          className="text-center rounded-2xl max-w-fit"
        >
          {showAddCategory ? <MinusIcon size={24} /> : <PlusIcon size={24} />}
        </Button>
      )}

      <MenuItemAddDialog
        open={showModal}
        onClose={closeModal}
        onAddItem={addMenuItemToCategory}
        itemType={itemType}
        foodGroup={foodGroup}
      />
      <Button
        onClick={() => navigate(ROUTES.DASHBOARD)}
        size="lg"
        className="w-full mt-4"
        disabled={categories.length === 0}
      >
        Next
      </Button>
    </div>
  );
};

export default AddMenuPage;

const AddCategoryForm = ({
  handleSubmit,
  onCategorySubmit,
  categories,
  selectedCategory,
  handleSelectCategory,
  errors,
  register,
}) => {
  return (
    <form
      onSubmit={handleSubmit(onCategorySubmit)}
      className="pt-4 mb-4 border-t"
    >
      <h3 className="mb-2 text-lg font-semibold">Add Category</h3>
      <p className="mb-4 text-n-4/50">
        Choose from the predefined categories or enter a new category name
      </p>

      <div className="flex flex-wrap gap-4 mb-4">
        {predefinedCategories
          ?.filter(
            (category) => !categories.some((cat) => cat.name === category)
          )
          ?.map((category) => (
            <button
              key={category}
              type="button"
              className={`px-4 py-2 rounded-full border ${selectedCategory === category ? "bg-secondary text-white" : "bg-gray-200 text-gray-800"}`}
              onClick={() => handleSelectCategory(category)}
            >
              {category}
            </button>
          ))}
      </div>
      <Field
        type="text"
        placeholder="Or enter new category name"
        className="w-full"
        classInput="border-n-4/20 focus:bg-transparent dark:bg-n-7 dark:border-n-1 dark:focus:bg-transparent"
        error={errors.categoryName?.message}
        {...register("categoryName")}
      />
      <Button type="submit" size="lg" className="w-full mt-5">
        {categories.length === 0 ? "Add Category" : "Add More Category"}
      </Button>
    </form>
  );
};
