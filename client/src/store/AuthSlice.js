import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "api/authApi";

const initialState = {
  accessToken: "",
  refreshToken: "",
};

const AuthSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      console.log("action.payload: ", action.payload);
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type.endsWith("/logout"),
      (state) => {
        state.accessToken = "";
        state.refreshToken = "";
      }
    );
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, action) => {
        console.log("action.payload: ", action.payload);
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      }
    );
  },
});

export const selectAccessToken = (state) => state.Auth.accessToken;
export const selectRefreshToken = (state) => state.Auth.refreshToken;

export const { setCredentials } = AuthSlice.actions;

export default AuthSlice.reducer;
