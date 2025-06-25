import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { BASE_URL } from "lib/constants";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/v1/customers`,
    credentials: "include",
    jsonContentType: "application/json",
  }),
  endpoints: (builder) => ({
    loginCustomer: builder.mutation({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const { useLoginCustomerMutation } = customerApi;
