import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { BASE_URL } from "lib/constants";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/v1/orders`,
    prepareHeaders: (headers, { getState }) => {
      const token =
        getState().Auth.customerAccessToken || getState().Auth.accessToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include",
    jsonContentType: "application/json",
  }),
  // Declared so providesTags/invalidatesTags below actually take effect.
  tagTypes: ["CustomerOrder"],
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: ({ data, restaurantId }) => ({
        url: `/${restaurantId}`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => response.data,
      // Placing an order should surface in the customer's history immediately.
      invalidatesTags: ["CustomerOrder"],
    }),
    getCustomerOrders: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/",
        params: { page, limit },
      }),
      providesTags: ["CustomerOrder"],
      transformResponse: (response) => response.data,
    }),
  }),
});

export const { useCreateOrderMutation, useGetCustomerOrdersQuery } = ordersApi;
