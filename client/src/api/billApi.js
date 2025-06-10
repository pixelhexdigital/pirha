import { createApi } from "@reduxjs/toolkit/query/react";

import { BASE_URL } from "lib/constants";
import { baseQueryWithReAuth } from "lib/baseQueryWithReAuth";

export const billApi = createApi({
  reducerPath: "billApi",
  baseQuery: baseQueryWithReAuth(`${BASE_URL}/api/v1/bills`),
  endpoints: (builder) => ({
    generateTableBill: builder.mutation({
      query: ({ tableId }) => ({
        url: `/${tableId}/generateTableBill`,
        method: "POST",
        body: { tableId },
      }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const { useGenerateTableBillMutation } = billApi;
