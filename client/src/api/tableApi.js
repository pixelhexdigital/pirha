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
      query: ({ page = 1, limit = 10, ...otherPrams }) => ({
        url: "",
        params: { page, limit, ...otherPrams },
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

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // Exclude 'page' from cache key
        const { page, ...filterArgs } = queryArgs || {};
        return `${endpointName}-${JSON.stringify(filterArgs)}`;
      },

      merge: (currentCache, newItems) => {
        const uniqueTablesMap = new Map();

        currentCache.data.tables.forEach((table) => {
          uniqueTablesMap.set(table._id, table);
        });

        newItems.data.tables.forEach((table) => {
          if (!uniqueTablesMap.has(table._id)) {
            uniqueTablesMap.set(table._id, table);
          }
        });

        currentCache.data.tables = Array.from(uniqueTablesMap.values());
        currentCache.data.hasNextPage = newItems.data.hasNextPage;
        currentCache.data.nextPage = newItems.data.nextPage;
      },

      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          JSON.stringify(currentArg) !== JSON.stringify(previousArg)
        );
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

    deleteTableById: builder.mutation({
      query: (tableId) => ({
        url: `/${tableId}`,
        method: "DELETE",
      }),
      onQueryStarted: async (id, { dispatch, getState, queryFulfilled }) => {
        try {
          // Find the active query arguments from cache
          const cacheEntries = getState().tableApi.queries;
          const activeQuery = Object.keys(cacheEntries).find((key) =>
            key.startsWith("getMyTables")
          );

          if (!activeQuery) return; // If there's no cached query, exit early

          // Extract page and limit from the active query
          const queryArgs = cacheEntries[activeQuery]?.originalArgs;
          if (!queryArgs) return; // Ensure we have valid query arguments

          // console.log("Updating cache for:", queryArgs);

          // Optimistically update cache before API call
          dispatch(
            tableApi.util.updateQueryData("getMyTables", queryArgs, (draft) => {
              if (draft.data?.tables) {
                // console.log("Before deletion:", draft.data.tables);

                // Remove the table from cache
                draft.data.tables = draft.data.tables.filter(
                  (table) => table._id !== id
                );

                // console.log("After deletion:", draft.data.tables);
              }
            })
          );

          // Wait for API response
          await queryFulfilled;
        } catch (error) {
          console.error("Failed to delete, rolling back:", error);
        }
      },
    }),

    updateTableById: builder.mutation({
      query: ({ tableId, ...data }) => ({
        url: `/${tableId}`,
        method: "PATCH",
        body: data,
      }),
      onQueryStarted: async (data, { dispatch, getState, queryFulfilled }) => {
        try {
          // Find the active query arguments from cache
          const cacheEntries = getState().tableApi.queries;
          const activeQuery = Object.keys(cacheEntries).find((key) =>
            key.startsWith("getMyTables")
          );

          if (!activeQuery) return; // If there's no cached query, exit early

          // Extract page and limit from the active query
          const queryArgs = cacheEntries[activeQuery]?.originalArgs;
          if (!queryArgs) return; // Ensure we have valid query arguments

          console.log("Updating cache for:", queryArgs);

          // Optimistically update cache before API call
          dispatch(
            tableApi.util.updateQueryData("getMyTables", queryArgs, (draft) => {
              if (draft.data?.tables) {
                // Find the table in cache and update it
                draft.data.tables = draft.data.tables.map((table) =>
                  table._id === data.tableId ? { ...table, ...data } : table
                );

                console.log("After update:", draft.data.tables);
              }
            })
          );

          // Wait for API response
          await queryFulfilled;
        } catch (error) {
          console.error("Failed to update, rolling back:", error);
        }
      },
    }),

    // getTableDetailsById: builder.query({
    //   query: (tableId) => `/${tableId}`,
    // }),

    getTableDetailsById: builder.mutation({
      query: (tableId) => ({
        method: "GET",
        url: `/${tableId}`,
      }),
    }),
  }),
});

export const {
  useGenerateTableQrMutation,
  useDownloadQrMutation,
  useGetMyTablesQuery,
  useDeleteTableByIdMutation,
  useUpdateTableByIdMutation,
  useGetTableDetailsByIdMutation,
} = tableApi;
