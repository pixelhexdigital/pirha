import { createSlice, current } from "@reduxjs/toolkit";
import { menuApi } from "api/menuApi";

const initialState = {
  menuData: [],
  menuCategoryData: [],
};

// Helper function to find category index
const findCategoryIndex = (categories, categoryId) => {
  return categories.findIndex((category) => category._id === categoryId);
};

// Helper function to update categories
const updateCategories = (categories, categoryIndex, updatedCategory) => {
  return [
    ...categories.slice(0, categoryIndex),
    updatedCategory,
    ...categories.slice(categoryIndex + 1),
  ];
};

// Helper function to update category items
const updateCategoryItems = (currentMenuData, categoryId, itemId, updateFn) => {
  const categoryIndex = findCategoryIndex(
    currentMenuData.categories,
    categoryId
  );

  if (categoryIndex === -1) {
    console.error(`Category with id ${categoryId} not found`);
    return currentMenuData;
  }

  const updatedCategory = {
    ...currentMenuData.categories[categoryIndex],
    items: currentMenuData.categories[categoryIndex].items.map((item) =>
      item._id === itemId ? updateFn(item) : item
    ),
  };

  return {
    ...currentMenuData,
    categories: updateCategories(
      currentMenuData.categories,
      categoryIndex,
      updatedCategory
    ),
  };
};

const MenuSlice = createSlice({
  name: "Menu",
  initialState,
  reducers: {
    updateMenuDataByItemId: (state, action) => {
      const { categoryId, itemId, updatedItem } = action.payload;
      state.menuData = updateCategoryItems(
        current(state.menuData),
        categoryId,
        itemId,
        (item) => ({ ...item, ...updatedItem })
      );
    },

    toggleItemAvailability: (state, action) => {
      const { categoryId, itemId, isActive } = action.payload;
      state.menuData = updateCategoryItems(
        current(state.menuData),
        categoryId,
        itemId,
        (item) => ({ ...item, isActive })
      );
    },

    updateItemImage: (state, action) => {
      const { categoryId, itemId, imageUrl } = action.payload;
      state.menuData = updateCategoryItems(
        current(state.menuData),
        categoryId,
        itemId,
        (item) => ({
          ...item,
          image: { ...item.image, url: imageUrl },
        })
      );
    },

    addItemToCategory: (state, action) => {
      const { categoryId, newItem } = action.payload;
      const currentMenuData = current(state.menuData);

      const categoryIndex = findCategoryIndex(
        currentMenuData.categories,
        categoryId
      );

      if (categoryIndex === -1) {
        console.error(`Category with id ${categoryId} not found`);
        return;
      }

      const updatedCategory = {
        ...currentMenuData.categories[categoryIndex],
        items: [...currentMenuData.categories[categoryIndex].items, newItem],
      };

      state.menuData = {
        ...currentMenuData,
        categories: updateCategories(
          currentMenuData.categories,
          categoryIndex,
          updatedCategory
        ),
      };
    },

    removeItemFromCategoryById: (state, action) => {
      const { categoryId, itemId } = action.payload;
      const currentMenuData = current(state.menuData);

      const categoryIndex = findCategoryIndex(
        currentMenuData.categories,
        categoryId
      );

      if (categoryIndex === -1) {
        console.error(`Category with id ${categoryId} not found`);
        return;
      }

      const updatedCategory = {
        ...currentMenuData.categories[categoryIndex],
        items: currentMenuData.categories[categoryIndex].items.filter(
          (item) => item._id !== itemId
        ),
      };

      state.menuData = {
        ...currentMenuData,
        categories: updateCategories(
          currentMenuData.categories,
          categoryIndex,
          updatedCategory
        ),
      };
    },

    addCategoryToMenu: (state, action) => {
      const { category } = action.payload;
      state.menuCategoryData = [...current(state.menuCategoryData), category];
    },

    updateMenuCategoryById: (state, action) => {
      const { categoryId, category } = action.payload;
      const currentMenuCategoryData = current(state.menuCategoryData);

      const categoryIndex = findCategoryIndex(
        currentMenuCategoryData,
        categoryId
      );

      if (categoryIndex === -1) {
        console.error(`Category with id ${categoryId} not found`);
        return;
      }

      state.menuCategoryData = updateCategories(
        currentMenuCategoryData,
        categoryIndex,
        {
          ...currentMenuCategoryData[categoryIndex],
          ...category,
        }
      );
    },

    toggleCategoryAvailability: (state, action) => {
      const { categoryId, isActive } = action.payload;
      const currentMenuCategoryData = current(state.menuCategoryData);

      const categoryIndex = findCategoryIndex(
        currentMenuCategoryData,
        categoryId
      );

      if (categoryIndex === -1) {
        console.error(`Category with id ${categoryId} not found`);
        return;
      }

      state.menuCategoryData = updateCategories(
        currentMenuCategoryData,
        categoryIndex,
        {
          ...currentMenuCategoryData[categoryIndex],
          isActive,
        }
      );
    },

    updateCategoryImage: (state, action) => {
      const { categoryId, imageUrl } = action.payload;
      const currentMenuCategoryData = current(state.menuCategoryData);

      const categoryIndex = findCategoryIndex(
        currentMenuCategoryData,
        categoryId
      );

      if (categoryIndex === -1) {
        console.error(`Category with id ${categoryId} not found`);
        return;
      }

      state.menuCategoryData = updateCategories(
        currentMenuCategoryData,
        categoryIndex,
        {
          ...currentMenuCategoryData[categoryIndex],
          image: {
            ...currentMenuCategoryData[categoryIndex].image,
            url: imageUrl,
          },
        }
      );
    },

    removeCategoryById: (state, action) => {
      const { categoryId } = action.payload;
      state.menuCategoryData = state.menuCategoryData.filter(
        (category) => category._id !== categoryId
      );
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      menuApi.endpoints.getMenuCategoryByRestaurantId.matchFulfilled,
      (state, action) => {
        state.menuData = action.payload.menu;
        state.menuCategoryData = action.payload.menu.categories;
      }
    );
  },
});

export const {
  addItemToCategory,
  updateMenuDataByItemId,
  toggleItemAvailability,
  updateItemImage,
  removeItemFromCategoryById,
  updateMenuCategoryById,
  toggleCategoryAvailability,
  updateCategoryImage,
  removeCategoryById,
  addCategoryToMenu,
} = MenuSlice.actions;

export default MenuSlice.reducer;

export const selectMenuData = (state) => state.Menu.menuData;
export const selectMenuCategoryData = (state) => state.Menu.menuCategoryData;
