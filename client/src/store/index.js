import { configureStore } from "@reduxjs/toolkit";
import { combineReducers, compose } from "redux";
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
import { billApi } from "api/billApi";
import MenuSlice from "store/MenuSlice";
import TableSlice from "./TableSlice";
import OrderSlice from "store/OrderSlice";
import { userApi } from "api/userApi";

// Persist configurations
const rootPersistConfig = {
  key: "root",
  storage,
  timeout: 200,
  version: 1,
  whitelist: ["Misc", "Auth"],
};

const cartPersistConfig = {
  key: "cart",
  storage: sessionStorage,
  timeout: 200,
  version: 2,
  whitelist: [
    "cart",
    "total",
    "totalItems",
    "totalUniqueItems",
    "restaurantId",
  ],
};

// Apply persistReducer to the cart slice
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

// Combine all reducers including the API reducers
const rootReducer = combineReducers({
  cart: persistedCartReducer,
  Misc: MiscellaneousSlice,
  Auth: AuthSlice,
  Menu: MenuSlice,
  Table: TableSlice,
  Order: OrderSlice,
  [menuApi.reducerPath]: menuApi.reducer,
  [miscApi.reducerPath]: miscApi.reducer,
  [customerApi.reducerPath]: customerApi.reducer,
  [ordersApi.reducerPath]: ordersApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [tableApi.reducerPath]: tableApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [billApi.reducerPath]: billApi.reducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(rootPersistConfig, rootReducer);
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

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
      tableApi.middleware,
      userApi.middleware,
      billApi.middleware
    ),
  devTools: import.meta.env.DEV,
  composeEnhancers,
});

export const persistor = persistStore(store);

// Enable Redux DevTools

export default store;
