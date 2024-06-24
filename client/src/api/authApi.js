import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `http://localhost:8080/api/v1/users`,
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
    verifyUserName: builder.mutation({
      query: (username) => ({
        url: `/verify-username/`,
        method: "POST",
        body: username,
      }),
    }),
    logOut: builder.query({
      query: () => ({
        url: "/logout",
        method: "GET",
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
} = authApi;
