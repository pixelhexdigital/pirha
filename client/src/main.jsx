import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import "./index.css";
import store from "store/index.js";

//  Disable console logs in production mode
if (import.meta.env.PROD) {
  // Override console methods to disable logging
  console.error = () => {};
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  console.warn = () => {};
}

const persistor = persistStore(store);
const toastOptions = {
  duration: 3000,
  success: {
    style: {
      color: "#009150",
    },
    iconTheme: {
      primary: "#009150",
    },
  },
  error: {
    style: {
      color: "#ff0033",
    },
    iconTheme: {
      primary: "#ff0033",
    },
  },
  loading: {
    style: {
      color: "blue",
    },
    iconTheme: {
      primary: "blue",
    },
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
        <Toaster
          containerStyle={{ bottom: 40, left: 20, right: 20 }}
          position="bottom-center"
          gutter={10}
          toastOptions={toastOptions}
        />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
