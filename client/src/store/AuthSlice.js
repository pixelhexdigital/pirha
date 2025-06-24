import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "api/authApi";
import { customerApi } from "api/customerApi";

const USER_ROLES = {
  RESTAURANT_ADMIN: "RESTAURANT_ADMIN",
  CUSTOMER: "CUSTOMER",
};

const initialState = {
  accessToken: "",
  customerAccessToken: "",
  refreshToken: "",
  isAuthenticated: false,
  onboardingState: "",
  restaurantId: null,
  userRole: null,
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
    loggedOut: (state) => {
      Object.assign(state, initialState);
    },
    setOnboardingState: (state, action) => {
      state.onboardingState = action.payload;
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
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.restaurantId = action.payload.restaurant._id;
        state.onboardingState = action.payload.restaurant.onboardingState;
        state.userRole = USER_ROLES.RESTAURANT_ADMIN; // Set userRole based on the authenticated user
      }
    );
    builder.addMatcher(
      customerApi.endpoints.loginCustomer.matchFulfilled,
      (state, action) => {
        state.isAuthenticated = true;
        state.customerAccessToken = action.payload.accessToken;
        state.userRole = USER_ROLES.CUSTOMER; // Set userRole for customer
      }
    );
    builder.addMatcher(authApi.endpoints.logOut.matchFulfilled, (state) => {
      Object.assign(state, initialState);
    });
    builder.addMatcher(authApi.endpoints.logOut.matchRejected, (state) => {
      Object.assign(state, initialState);
    });
  },
});

export const selectAccessToken = (state) => state.Auth.accessToken;
export const selectRefreshToken = (state) => state.Auth.refreshToken;
export const selectIsAuthenticated = (state) => state.Auth.isAuthenticated;
export const selectRestaurantId = (state) => state.Auth.restaurantId;
export const selectOnboardingState = (state) => state.Auth.onboardingState;
export const selectIsOnboardingComplete = (state) =>
  state.Auth.onboardingState?.toLowerCase() === "completed";

export const { setCredentials, loggedOut, setOnboardingState } =
  AuthSlice.actions;

export default AuthSlice.reducer;
