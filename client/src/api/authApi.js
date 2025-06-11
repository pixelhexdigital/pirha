import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "lib/constants";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/v1/users`,
    credentials: "include",
    jsonContentType: "application/json",
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => response.data,
    }),
    register: builder.mutation({
      query: (data) => ({
        url: "/register",
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => response.data,
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "/forgot-password",
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => response.data,
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/reset-password",
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => response.data,
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/change-password",
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => response.data,
    }),
    verifyUserName: builder.mutation({
      query: (username) => ({
        url: `/verify-username/`,
        method: "POST",
        body: username,
      }),
    }),
    logOut: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      transformResponse: (response) => response.data,
    }),
    refreshToken: builder.mutation({
      query: ({ refreshToken }) => ({
        url: "/refresh-token",
        method: "POST",
        body: refreshToken,
      }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useVerifyUserNameMutation,
  useRegisterMutation,
  useLoginMutation,
  useChangePasswordMutation,
  useResetPasswordMutation,
  useLogOutMutation,
  useForgotPasswordMutation,
} = authApi;
