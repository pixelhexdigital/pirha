import { configureStore } from "@reduxjs/toolkit";
import { combineReducers, compose } from "redux";
import { persistReducer } from "redux-persist";
import { thunk } from "redux-thunk";
import sessionStorage from "redux-persist/es/storage/session";

import CartSlice from "store/CartSlice";
import MiscellaneousSlice from "store/MiscellaneousSlice";

const reducers = combineReducers({
  cart: CartSlice,
  Misc: MiscellaneousSlice,
});

const persistConfig = {
  key: "root",
  storage: sessionStorage,
  version: 1,
  whitelist: ["cart"],
};
const persistedReducer = persistReducer(persistConfig, reducers);
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const middleware = [thunk];

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(middleware),
  // devTools: import.meta.env.DEV,
  composeEnhancers,
});

export default store;
