import { createSlice } from "@reduxjs/toolkit";
import { miscApi } from "api/miscApi";
import localStorage from "redux-persist/es/storage";

const initialState = {
  isSidebarExpanded: true,
  restaurantDetails: {},
  tableDetailById: {},
  isVegOnly: false,
  isNonVegOnly: false,
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
  },
});

export const selectIsSidebarExtended = (state) => state.Misc.isSidebarExpanded;
export const selectRestaurantDetails = (state) => state.Misc.restaurantDetails;
export const selectTableDetailById = (state) => state.Misc.tableDetailById;
export const selectIsVegOnly = (state) => state.Misc.isVegOnly;
export const selectIsNonVegOnly = (state) => state.Misc.isNonVegOnly;

export const {
  setSidebarExtended,
  setRestaurantDetails,
  toggleNonVegOnly,
  toggleVegOnly,
} = MiscellaneousSlice.actions;

export default MiscellaneousSlice.reducer;
