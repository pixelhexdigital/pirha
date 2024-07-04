import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "lib/constants";
import { errorToast } from "lib/helper";

export const tableApi = createApi({
  reducerPath: "tableApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/v1/tables`,
    credentials: "include",
    jsonContentType: "application/json",
  }),
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
