import { createSlice } from "@reduxjs/toolkit";
import { menuApi } from "api/menuApi";

const initialState = {
  menuData: null,
};

const MenuSlice = createSlice({
  name: "Menu",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      menuApi.endpoints.getMenuCategoryByRestaurantId.matchFulfilled,
      (state, action) => {
        state.menu = action.payload?.menu;
      }
    );
  },
});

export const {} = MenuSlice.actions;

export default MenuSlice.reducer;

export const selectMenuData = (state) => state.Menu.menu;
