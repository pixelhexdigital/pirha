import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import sessionStorage from "redux-persist/es/storage/session";

import cartReducer from "store/CartSlice";
import MiscellaneousSlice from "store/MiscellaneousSlice";
import AuthSlice from "store/AuthSlice";
import { menuApi } from "api/menuApi";
import { miscApi } from "api/miscApi";
import { customerApi } from "api/customerApi";
import { ordersApi } from "api/orderApi";
import { authApi } from "api/authApi";
import { adminApi } from "api/adminApi";
import { tableApi } from "api/tableApi";
import MenuSlice from "store/MenuSlice";

// Persist configurations
const rootPersistConfig = {
  key: "root",
  storage,
  version: 1,
  whitelist: ["Misc", "Auth"],
};

const cartPersistConfig = {
  key: "cart",
  storage: sessionStorage,
  version: 2,
  whitelist: ["cart", "total", "totalItems", "totalUniqueItems"],
};

// Apply persistReducer to the cart slice
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

// Combine all reducers including the API reducers
const rootReducer = combineReducers({
  cart: persistedCartReducer,
  Misc: MiscellaneousSlice,
  Auth: AuthSlice,
  Menu: MenuSlice,
  [menuApi.reducerPath]: menuApi.reducer,
  [miscApi.reducerPath]: miscApi.reducer,
  [customerApi.reducerPath]: customerApi.reducer,
  [ordersApi.reducerPath]: ordersApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [tableApi.reducerPath]: tableApi.reducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      authApi.middleware,
      menuApi.middleware,
      miscApi.middleware,
      customerApi.middleware,
      ordersApi.middleware,
      adminApi.middleware,
      tableApi.middleware
    ),
});

export const persistor = persistStore(store);

export default store;
