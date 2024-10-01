import { createApi } from "@reduxjs/toolkit/query/react";

import { errorToast } from "lib/helper";
import { BASE_URL } from "lib/constants";
import { baseQueryWithReAuth } from "lib/baseQueryWithReAuth";

export const tableApi = createApi({
  reducerPath: "tableApi",
  baseQuery: baseQueryWithReAuth(`${BASE_URL}/api/v1/tables`),
  endpoints: (builder) => ({
    getMyTables: builder.query({
      query: () => ``,
      providesTags: ["Table"],
      transformErrorResponse: (response) => {
        errorToast({ error: response });
        return response;
      },
    }),
    generateTableQr: builder.mutation({
      query: (data) => {
        return {
          url: "/register",
          method: "POST",
          body: data,
        };
      },
    }),
    downloadQr: builder.mutation({
      query: (data) => {
        return {
          url: "/qr-download",
          method: "POST",
          body: data,
        };
      },
    }),
  }),
});

export const {
  useGenerateTableQrMutation,
  useDownloadQrMutation,
  useGetMyTablesQuery,
} = tableApi;
