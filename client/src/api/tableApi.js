import { createApi } from "@reduxjs/toolkit/query/react";

import { BASE_URL } from "lib/constants";
import { baseQueryWithReAuth } from "lib/baseQueryWithReAuth";

export const tableApi = createApi({
  reducerPath: "tableApi",
  baseQuery: baseQueryWithReAuth(`${BASE_URL}/api/v1/tables`),
  endpoints: (builder) => ({
    // getMyTables: builder.query({
    //   query: ({ page = 1, limit = 10 }) => ({
    //     url: "",
    //     params: { page, limit },
    //   }),
    //   providesTags: ["Table"],
    //   transformErrorResponse: (response) => {
    //     errorToast({ error: response });
    //     return response;
    //   },
    // }),

    getMyTables: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: "",
        params: { page, limit },
      }),
      providesTags: (result) =>
        result?.data?.tables
          ? [
              ...result.data.tables.map(({ _id }) => ({
                type: "Table",
                id: _id,
              })),
              "Table",
            ]
          : ["Table"],
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems) => {
        const uniqueTablesMap = new Map();

        // Add existing tables to the map
        currentCache.data.tables.forEach((table) => {
          uniqueTablesMap.set(table._id, table);
        });

        // Add new tables only if they don’t already exist
        newItems.data.tables.forEach((table) => {
          if (!uniqueTablesMap.has(table._id)) {
            uniqueTablesMap.set(table._id, table);
          }
        });

        // Update cache with unique tables
        currentCache.data.tables = Array.from(uniqueTablesMap.values());
        currentCache.data.hasNextPage = newItems.data.hasNextPage;
        currentCache.data.nextPage = newItems.data.nextPage;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
    }),

    generateTableQr: builder.mutation({
      query: (data) => ({
        url: "/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Table"],
    }),

    downloadQr: builder.mutation({
      query: (data) => ({
        url: "/qr-download",
        method: "POST",
        body: data,
        responseHandler: async (response) => {
          if (!response.ok) {
            throw new Error("Failed to download file");
          }
          return await response.blob(); // Ensure Blob is returned
        },
        cache: "no-cache",
      }),
    }),
  }),
});

export const {
  useGenerateTableQrMutation,
  useDownloadQrMutation,
  useGetMyTablesQuery,
} = tableApi;
