import { configureStore } from "@reduxjs/toolkit";
import { combineReducers, compose } from "redux";
import { persistReducer } from "redux-persist";
import sessionStorage from "redux-persist/es/storage/session";
import localStorage from "redux-persist/es/storage";

import CartSlice from "store/CartSlice";
import MiscellaneousSlice from "store/MiscellaneousSlice";
import { menuApi } from "api/menuApi";
import { miscApi } from "api/miscApi";
import { customerApi } from "api/customerApi";
import { ordersApi } from "api/orderApi";

const reducers = combineReducers({
  cart: CartSlice,
  Misc: MiscellaneousSlice,
  [menuApi.reducerPath]: menuApi.reducer,
  [miscApi.reducerPath]: miscApi.reducer,
  [customerApi.reducerPath]: customerApi.reducer,
  [ordersApi.reducerPath]: ordersApi.reducer,
});

const rootPersistConfig = {
  key: "root",
  storage: localStorage,
  version: 1,
  whitelist: ["Misc"],
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
      menuApi.middleware,
      miscApi.middleware,
      customerApi.middleware,
      ordersApi.middleware
    ),
  // devTools: import.meta.env.DEV,
  composeEnhancers,
});

export default store;
