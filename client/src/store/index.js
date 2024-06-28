import { configureStore } from "@reduxjs/toolkit";
import { combineReducers, compose } from "redux";
import { persistReducer } from "redux-persist";
import sessionStorage from "redux-persist/es/storage/session";
import localStorage from "redux-persist/es/storage";

import CartSlice from "store/CartSlice";
import MiscellaneousSlice from "store/MiscellaneousSlice";
import AuthSlice from "store/AuthSlice";
import { menuApi } from "api/menuApi";
import { miscApi } from "api/miscApi";
import { customerApi } from "api/customerApi";
import { ordersApi } from "api/orderApi";
import { authApi } from "api/authApi";
import { adminApi } from "api/adminApi";
import { tableApi } from "api/tableApi";

// Combine all reducers including the API reducers
const reducers = combineReducers({
  cart: CartSlice,
  Misc: MiscellaneousSlice,
  Auth: AuthSlice,
  [menuApi.reducerPath]: menuApi.reducer,
  [miscApi.reducerPath]: miscApi.reducer,
  [customerApi.reducerPath]: customerApi.reducer,
  [ordersApi.reducerPath]: ordersApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [tableApi.reducerPath]: tableApi.reducer,
});

// Persist configurations
const rootPersistConfig = {
  key: "root",
  storage: localStorage,
  version: 1,
  whitelist: ["Misc", "Auth"],
};

const cartPersistConfig = {
  key: "cart",
  storage: sessionStorage,
  version: 1,
  whitelist: ["cart"],
};

// Create persisted reducer
const persistedReducer = persistReducer(
  rootPersistConfig,
  persistReducer(cartPersistConfig, reducers)
);

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
      tableApi.middleware
    ),
  composeEnhancers,
});

export default store;
