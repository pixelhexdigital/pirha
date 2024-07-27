import { createApi } from "@reduxjs/toolkit/query/react";

import { BASE_URL } from "lib/constants";
import { baseQueryWithReAuth } from "lib/baseQueryWithReAuth";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithReAuth(`${BASE_URL}/api/v1/admin`),
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response) => response,
    }),
    updateCoverImage: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("coverImage", file);
        return {
          url: "/update-cover-image",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response) => response,
    }),
    updateLogo: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("avatar", file);
        return {
          url: "/avatar",
          method: "PATCH",
          body: formData,
        };
      },
      transformResponse: (response) => response,
    }),
    getDashBoardData: builder.query({
      query: () => "/dashboard",
      transformResponse: (response) => response.data,
    }),
    getOrdersData: builder.query({
      query: ({ page = 1, status }) => `/orders?page=${page}&status=${status}`,
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useUpdateLogoMutation,
  useUpdateProfileMutation,
  useGetDashBoardDataQuery,
  useUpdateCoverImageMutation,
  useGetOrdersDataQuery,
} = adminApi;
