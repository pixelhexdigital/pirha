import { createSlice } from "@reduxjs/toolkit";
import { menuApi } from "api/menuApi";

const initialState = {
  menuData: [],
  menuCategoryData: [],
};

// The admin menu surfaces read the menu directly from the RTK Query cache.
// This slice is a read-only projection of that same data, kept in sync by the
// query's own fulfilled action, so store-only consumers (e.g. the customer
// CategoryFab) can still select categories without threading props.
const MenuSlice = createSlice({
  name: "Menu",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      menuApi.endpoints.getMenuCategoryByRestaurantId.matchFulfilled,
      (state, action) => {
        state.menuData = action.payload?.menu ?? [];
        state.menuCategoryData = action.payload?.menu?.categories ?? [];
      }
    );
  },
});

export default MenuSlice.reducer;

export const selectMenuData = (state) => state.Menu.menuData;
export const selectMenuCategoryData = (state) => state.Menu.menuCategoryData;
