import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
  total: 0,
  totalItems: 0,
  totalUniqueItems: 0,
};

const CartSlice = createSlice({
  name: "Cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { item } = action.payload;
      const existingItem = state.cart.find((i) => i._id === item._id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cart.push({ ...item, quantity: 1 });
      }
      state.totalItems += 1;
      state.totalUniqueItems = state.cart.length;
      state.total += item.price;
    },
    removeFromCart: (state, action) => {
      const { item } = action.payload;
      const existingItem = state.cart.find((i) => i._id === item._id);
      if (existingItem.quantity === 1) {
        state.cart = state.cart.filter((i) => i._id !== item._id);
      } else {
        existingItem.quantity -= 1;
      }
      state.totalItems -= 1;
      state.totalUniqueItems = state.cart.length;
      state.total -= item.price;
    },
    clearCart: (state) => {
      state.cart = [];
      state.total = 0;
      state.totalItems = 0;
      state.totalUniqueItems = 0;
    },
    increaseQuantity: (state, action) => {
      const { item } = action.payload;
      const existingItem = state.cart.find((i) => i._id === item._id);
      existingItem.quantity += 1;
      state.totalItems += 1;
      state.total += item.price;
    },
    decreaseQuantity: (state, action) => {
      const { item } = action.payload;
      const existingItem = state.cart.find((i) => i._id === item._id);
      if (existingItem.quantity === 1) {
        state.cart = state.cart.filter((i) => i._id !== item._id);
      } else {
        existingItem.quantity -= 1;
      }
      state.totalItems -= 1;
      state.total -= item.price;
    },
  },
});

export const selectCart = (state) => state.cart.cart;
export const selectTotal = (state) => state.cart.total;
export const selectTotalItems = (state) => state.cart.totalItems;
export const selectTotalUniqueItems = (state) => state.cart.totalUniqueItems;

export const {
  addToCart,
  removeFromCart,
  clearCart,
  increaseQuantity,
  decreaseQuantity,
} = CartSlice.actions;

export default CartSlice.reducer;
