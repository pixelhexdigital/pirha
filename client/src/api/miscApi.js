import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "lib/constants";

export const miscApi = createApi({
  reducerPath: "miscApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/v1/public`,
    credentials: "include",
    jsonContentType: "application/json",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set("authorization", `Token ${token}`);
      }
      return headers;
    },
  }),
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
