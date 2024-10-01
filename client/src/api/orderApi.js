import { createApi } from "@reduxjs/toolkit/query/react";

import { BASE_URL } from "lib/constants";
import { baseQueryWithReAuth } from "lib/baseQueryWithReAuth";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: baseQueryWithReAuth(`${BASE_URL}/api/v1/orders`),
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: ({ data, restaurantId }) => ({
        url: `/${restaurantId}`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const { useCreateOrderMutation } = ordersApi;
