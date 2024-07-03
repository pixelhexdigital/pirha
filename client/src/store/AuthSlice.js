import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "api/authApi";

const initialState = {
  accessToken: "",
  refreshToken: "",
  isAuthenticated: false,
  restaurantId: null,
};

const AuthSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type.endsWith("/logout"),
      (state) => {
        Object.assign(state, initialState);
      }
    );
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, action) => {
        console.log("action.payload: ", action.payload);
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.restaurantId = action.payload.restaurant._id;
      }
    );
  },
});

export const selectAccessToken = (state) => state.Auth.accessToken;
export const selectRefreshToken = (state) => state.Auth.refreshToken;
export const selectIsAuthenticated = (state) => state.Auth.isAuthenticated;
export const selectRestaurantId = (state) => state.Auth.restaurantId;

export const { setCredentials } = AuthSlice.actions;

export default AuthSlice.reducer;
