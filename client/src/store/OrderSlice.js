import { createSlice } from "@reduxjs/toolkit";
import { adminApi } from "api/adminApi";

const initialState = {
  orders: [],
  order: {},
};

const OrderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      adminApi.endpoints.getOrdersData.matchFulfilled,
      (state, action) => {
        state.orders = action.payload;
      }
    );
  },
});

export const {} = OrderSlice.actions;

export default OrderSlice.reducer;

export const selectOrders = (state) => state.Order.orders;
