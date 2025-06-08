import { createSlice } from "@reduxjs/toolkit";
import { miscApi } from "api/miscApi";
import localStorage from "redux-persist/es/storage";

const initialState = {
  isSidebarExpanded: true,
  restaurantDetails: {},
  tableDetailById: {},
  isVegOnly: false,
  isNonVegOnly: false,
  foodGroups: [],
  restroTypes: [],
  menuItemTypes: [],
  tableStatus: [],
};

const MiscellaneousSlice = createSlice({
  name: "Miscellaneous",
  initialState,
  reducers: {
    setSidebarExtended: (state, action) => {
      state.isSidebarExpanded = action.payload;
    },
    toggleVegOnly: (state) => {
      state.isVegOnly = !state.isVegOnly;
      state.isNonVegOnly = false;
    },
    toggleNonVegOnly: (state) => {
      state.isNonVegOnly = !state.isNonVegOnly;
      state.isVegOnly = false;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      miscApi.endpoints.getRestaurantDetailsById.matchFulfilled,
      (state, action) => {
        state.restaurantDetails = action.payload;
        localStorage.setItem("restaurantDetails", action.payload);
      }
    );
    builder.addMatcher(
      miscApi.endpoints.getTableDetailsById.matchFulfilled,
      (state, action) => {
        state.tableDetailById = action.payload;
        localStorage.setItem("tableDetailById", action.payload);
      }
    );
    builder.addMatcher(
      miscApi.endpoints.getEnumValues.matchFulfilled,
      (state, action) => {
        console.log("action.payload: ", action.payload);
        // state.foodGroups = action.payload.foodGroup?.map((group) => ({
        //   label: group,
        //   value: group,
        // }));
        // state.restroTypes = action.payload.restroType?.map((type) => ({
        //   label: type,
        //   value: type,
        // }));
        // state.menuItemTypes = action.payload.menuItemType?.map((type) => ({
        //   label: type,
        //   value: type,
        // }));
        state.foodGroups = action.payload.foodGroup;
        state.restroTypes = action.payload.restroType;
        state.menuItemTypes = action.payload.menuItemType;
        state.tableStatus = action.payload.tableStatus;
      }
    );
  },
});

export const selectIsSidebarExtended = (state) => state.Misc.isSidebarExpanded;
export const selectRestaurantDetails = (state) => state.Misc.restaurantDetails;
export const selectTableDetailById = (state) => state.Misc.tableDetailById;
export const selectIsVegOnly = (state) => state.Misc.isVegOnly;
export const selectIsNonVegOnly = (state) => state.Misc.isNonVegOnly;
export const selectFoodGroups = (state) => state.Misc.foodGroups;
export const selectRestroTypes = (state) => state.Misc.restroTypes;
export const selectMenuItemTypes = (state) => state.Misc.menuItemTypes;
export const selectTableStatus = (state) => state.Misc.tableStatus;

export const {
  setSidebarExtended,
  setRestaurantDetails,
  toggleNonVegOnly,
  toggleVegOnly,
} = MiscellaneousSlice.actions;

export default MiscellaneousSlice.reducer;
