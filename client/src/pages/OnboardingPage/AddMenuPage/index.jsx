import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { object, string } from "yup";
import { useSelector } from "react-redux";

import Field from "components/Field";
import { Button } from "components/ui/button";
import { ROUTES } from "routes/RouterConfig";
import MenuItemAddDialog from "./MenuItemAddDialog";
import { useAddItemToCategoryMutation, useGetMyMenuQuery } from "api/menuApi";
import { selectRestaurantId } from "store/AuthSlice";

// Validation schema for category
const ADD_CATEGORY_SCHEMA = object().shape({
  categoryName: string().required("Category name is required"),
});

const predefinedCategories = ["Starter", "Main Course", "Dessert"];

const AddMenuPage = () => {
  const restaurantId = useSelector(selectRestaurantId);
  const { data: menuData, isLoading } = useGetMyMenuQuery(restaurantId);
  const [addItemToCategory] = useAddItemToCategoryMutation();

  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("");

  const {
    handleSubmit: handleCategorySubmit,
    register: registerCategory,
    setValue,
    formState: { errors: categoryErrors },
  } = useForm({
    resolver: yupResolver(ADD_CATEGORY_SCHEMA),
  });

  useEffect(() => {
    if (menuData?.menu?.categories) {
      setCategories(
        menuData.menu.categories.map((category) => ({
          ...category,
          items: category.items || [],
        }))
      );
    }
  }, [menuData]);

  const navigateToDashboard = () => {
    navigate(ROUTES.DASHBOARD);
  };

  const onCategorySubmit = (data) => {
    const newCategory = data.categoryName;
    if (!categories.some((cat) => cat.name === newCategory)) {
      setCategories([...categories, { name: newCategory, items: [] }]);
    }
    setSelectedCategory(newCategory);
    setValue("categoryName", ""); // Clear the input field
  };

  const openModal = (category) => {
    setCurrentCategory(category);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const addMenuItemToCategory = async (item) => {
    try {
      const response = await addItemToCategory({
        categoryId: currentCategory._id,
        item,
      }).unwrap();
      const updatedCategories = categories.map((cat) => {
        if (cat._id === currentCategory._id) {
          return { ...cat, items: [...cat.items, item] };
        }
        return cat;
      });
      setCategories(updatedCategories);
      setShowModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCategoryClick = (category) => {
    setValue("categoryName", category);
    setSelectedCategory(category);
  };

  return (
    <div className="w-full max-w-xl px-4 mx-auto">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        categories.map((category, index) => (
          <div key={index} className="mb-4">
            <h3 className="mb-2 font-semibold text-lg">{category.name}</h3>
            <Button
              onClick={() => openModal(category)}
              size="sm"
              className="mb-2"
            >
              Add Menu Item
            </Button>
            <ul>
              {category.items.map((item, itemIndex) => (
                <li key={itemIndex} className="mb-1">
                  {item.itemName} - {item.itemPrice}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
      <form onSubmit={handleCategorySubmit(onCategorySubmit)} className="mb-4">
        <div className="flex flex-wrap mb-4 space-x-2">
          {predefinedCategories.map((category, index) => (
            <button
              key={index}
              type="button"
              className={`px-4 py-2 rounded-full border ${
                selectedCategory === category
                  ? "bg-secondary text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <Field
            type="text"
            placeholder="Or enter new category name"
            className="w-full"
            error={categoryErrors.categoryName?.message}
            {...registerCategory("categoryName")}
          />
        </div>
        <Button type="submit" size="lg" className="w-full">
          {categories.length === 0 ? "Add Category" : "Add More Category"}
        </Button>
      </form>

      <MenuItemAddDialog
        open={showModal}
        onClose={closeModal}
        onAddItem={addMenuItemToCategory}
      />
      <Button onClick={navigateToDashboard} size="lg" className="w-full mt-4">
        Next
      </Button>
    </div>
  );
};

export default AddMenuPage;
