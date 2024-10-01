import { createApi } from "@reduxjs/toolkit/query/react";

import { BASE_URL } from "lib/constants";
import { baseQueryWithReAuth } from "lib/baseQueryWithReAuth";

export const miscApi = createApi({
  reducerPath: "miscApi",
  baseQuery: baseQueryWithReAuth(`${BASE_URL}/api/v1/public`),
  endpoints: (builder) => ({
    getRestaurantDetailsById: builder.query({
      query: (restaurantId) => `restaurants/${restaurantId}`,

      transformResponse: (response) => response.data?.restaurant,
    }),
    getTableDetailsById: builder.query({
      query: (tableId) => `tables/${tableId}`,
      transformResponse: (response) => response.data?.table,
    }),
    getEnumValues: builder.query({
      query: () => "/enums",
      transformResponse: (response) => response.data?.enums,
    }),
  }),
});

export const {
  useGetEnumValuesQuery,
  useGetTableDetailsByIdQuery,
  useGetRestaurantDetailsByIdQuery,
} = miscApi;
