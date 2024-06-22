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

const reducers = combineReducers({
  cart: CartSlice,
  Misc: MiscellaneousSlice,
  Auth: AuthSlice,
  // [menuApi.reducerPath]: menuApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
});

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

const persistedReducer = persistReducer(
  rootPersistConfig,
  persistReducer(cartPersistConfig, reducers)
);
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      authApi.middleware
    ),
  // devTools: import.meta.env.DEV,
  composeEnhancers,
});

export default store;
