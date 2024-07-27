import { createApi } from "@reduxjs/toolkit/query/react";

import { BASE_URL } from "lib/constants";
import { baseQueryWithReAuth } from "lib/baseQueryWithReAuth";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: baseQueryWithReAuth(`${BASE_URL}/api/v1/customers`),
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
