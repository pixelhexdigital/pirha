import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const miscApi = createApi({
  reducerPath: "miscApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `http://localhost:8080/api/v1/public`,
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
  }),
});

export const { useGetRestaurantDetailsByIdQuery, useGetTableDetailsByIdQuery } =
  miscApi;
