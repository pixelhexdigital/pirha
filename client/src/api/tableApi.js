import { createApi } from "@reduxjs/toolkit/query/react";

import { BASE_URL } from "lib/constants";
import { baseQueryWithReAuth } from "lib/baseQueryWithReAuth";

export const tableApi = createApi({
  reducerPath: "tableApi",
  baseQuery: baseQueryWithReAuth(`${BASE_URL}/api/v1/tables`),
  endpoints: (builder) => ({
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
        const { page: _p, ...filterArgs } = queryArgs || {}; // eslint-disable-line no-unused-vars
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
        const cacheEntries = getState().tableApi.queries;
        const activeQuery = Object.keys(cacheEntries).find((key) =>
          key.startsWith("getMyTables")
        );
        if (!activeQuery) return;

        const queryArgs = cacheEntries[activeQuery]?.originalArgs;
        if (!queryArgs) return;

        // Optimistically remove the table and keep the summary counts in sync.
        const patchResult = dispatch(
          tableApi.util.updateQueryData("getMyTables", queryArgs, (draft) => {
            if (!draft.data?.tables) return;
            const removed = draft.data.tables.find((table) => table._id === id);
            draft.data.tables = draft.data.tables.filter(
              (table) => table._id !== id
            );
            draft.data.totalTables = Math.max(
              0,
              (draft.data.totalTables || 0) - 1
            );
            if (removed?.status === "Free") {
              draft.data.freeTables = Math.max(0, (draft.data.freeTables || 0) - 1);
            } else if (removed?.status === "Occupied") {
              draft.data.occupiedTables = Math.max(
                0,
                (draft.data.occupiedTables || 0) - 1
              );
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    updateTableById: builder.mutation({
      query: ({ tableId, ...data }) => ({
        url: `/${tableId}`,
        method: "PATCH",
        body: data,
      }),
      onQueryStarted: async (
        { tableId, ...changes },
        { dispatch, getState, queryFulfilled }
      ) => {
        const cacheEntries = getState().tableApi.queries;
        const activeQuery = Object.keys(cacheEntries).find((key) =>
          key.startsWith("getMyTables")
        );
        if (!activeQuery) return;

        const queryArgs = cacheEntries[activeQuery]?.originalArgs;
        if (!queryArgs) return;

        // Optimistically merge the change and adjust the free/occupied counts
        // when the status flips, so the summary stays in sync.
        const patchResult = dispatch(
          tableApi.util.updateQueryData("getMyTables", queryArgs, (draft) => {
            const table = draft.data?.tables?.find((t) => t._id === tableId);
            if (!table || !draft.data) return;
            const prevStatus = table.status;
            Object.assign(table, changes);
            if (changes.status && changes.status !== prevStatus) {
              if (prevStatus === "Free") {
                draft.data.freeTables = Math.max(0, (draft.data.freeTables || 0) - 1);
              } else if (prevStatus === "Occupied") {
                draft.data.occupiedTables = Math.max(
                  0,
                  (draft.data.occupiedTables || 0) - 1
                );
              }
              if (changes.status === "Free") {
                draft.data.freeTables = (draft.data.freeTables || 0) + 1;
              } else if (changes.status === "Occupied") {
                draft.data.occupiedTables = (draft.data.occupiedTables || 0) + 1;
              }
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

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
