import { configureStore } from "@reduxjs/toolkit";
import { combineReducers, compose } from "redux";
import { persistReducer } from "redux-persist";
import sessionStorage from "redux-persist/es/storage/session";

import CartSlice from "store/CartSlice";
import MiscellaneousSlice from "store/MiscellaneousSlice";
import { menuApi } from "api/menuApi";

const reducers = combineReducers({
  cart: CartSlice,
  Misc: MiscellaneousSlice,
  [menuApi.reducerPath]: menuApi.reducer,
});

const persistConfig = {
  key: "root",
  storage: sessionStorage,
  version: 1,
  whitelist: ["cart"],
};
const persistedReducer = persistReducer(persistConfig, reducers);
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      menuApi.middleware
    ),
  // devTools: import.meta.env.DEV,
  composeEnhancers,
});

export default store;
