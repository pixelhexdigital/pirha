import { createSlice } from "@reduxjs/toolkit";
import { tableApi } from "api/tableApi";

const initialState = {
  tableData: [],
  nextPage: 2,
  hasNextPage: false,
  totalTablesCount: 0,
};

const MenuSlice = createSlice({
  name: "Table",
  initialState,
  reducers: {
    deleteTableEntry(state, action) {
      state.tableData = state.tableData.filter(
        (table) => table._id !== action.payload
      );
    },
    updateTableData(state, action) {
      state.tableData = state.tableData.map((table) =>
        table._id === action.payload._id ? action.payload : table
      );
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      tableApi.endpoints.getMyTables.matchFulfilled,
      (state, action) => {
        state.tableData = action.payload.data.tables || [];
        state.hasNextPage = action.payload.data.hasNextPage || false;
        state.nextPage = action.payload.data.nextPage || 2;
        state.totalTablesCount = action.payload.data.totalTables || 0;
      }
    );
  },
});

export const selectTableData = (state) => state.Table.tableData;
export const selectNextPage = (state) => state.Table.nextPage;
export const selectHasNextPage = (state) => state.Table.hasNextPage;
export const selectTotalTablesCount = (state) => state.Table.totalTablesCount;

export const { deleteTableEntry, updateTableData } = MenuSlice.actions;

export default MenuSlice.reducer;
