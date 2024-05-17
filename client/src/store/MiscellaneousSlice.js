import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSidebarExpanded: true,
};

const MiscellaneousSlice = createSlice({
  name: "Miscellaneous",
  initialState,
  reducers: {
    setSidebarExtended: (state, action) => {
      state.isSidebarExpanded = action.payload;
    },
  },
});

export const selectIsSidebarExtended = (state) => state.Misc.isSidebarExpanded;

export const { setSidebarExtended } = MiscellaneousSlice.actions;

export default MiscellaneousSlice.reducer;
