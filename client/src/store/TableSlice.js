import { createSlice } from "@reduxjs/toolkit";
import { menuApi } from "api/menuApi";

const initialState = {
  menuData: null,
};

const MenuSlice = createSlice({
  name: "Table",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      menuApi.endpoints.getMenuCategoryByRestaurantId.matchFulfilled,
      (state, action) => {
        state.table = action.payload?.table;
      }
    );
  },
});

export const {} = MenuSlice.actions;

export default MenuSlice.reducer;

export const selectMenuData = (state) => state.Table.table;
