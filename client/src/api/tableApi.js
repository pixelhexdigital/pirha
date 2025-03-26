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

    // deleteTableById: builder.mutation({
    //   query: (tableId) => ({
    //     url: `/${tableId}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: ["Table"],
    // }),

    // deleteTableById: builder.mutation({
    //   query: (tableId) => ({
    //     url: `/${tableId}`,
    //     method: "DELETE",
    //   }),
    //   async onQueryStarted(tableId, { dispatch, queryFulfilled }) {
    //     const patchResult = dispatch(
    //       tableApi.util.updateQueryData("getMyTables", (draft) => {
    //         draft.data.tables = draft.data.tables.filter(
    //           (table) => table._id !== tableId
    //         );
    //       })
    //     );

    //     try {
    //       await queryFulfilled;
    //     } catch (error) {
    //       patchResult.undo(); // Rollback if API call fails
    //       console.error("Delete failed:", error);
    //     }
    //   },
    // }),

    deleteTableById: builder.mutation({
      query: (tableId) => ({
        url: `/${tableId}`,
        method: "DELETE",
      }),
      // onQueryStarted: async (id, { dispatch, getState, queryFulfilled }) => {
      //   const { tableApi } = getState();
      //   const queryArgs = Object.keys(tableApi.queries).find((key) =>
      //     key.startsWith("getMyTables")
      //   );

      //   if (!queryArgs) return; // Ensure there's valid cache data before modifying

      //   try {
      //     // Optimistically update the cache before the actual API call
      //     dispatch(
      //       tableApi.util.updateQueryData(
      //         "getMyTables",
      //         JSON.parse(queryArgs),
      //         (draft) => {
      //           if (draft.data?.tables) {
      //             draft.data.tables = draft.data.tables.filter(
      //               (table) => table._id !== id
      //             );
      //           }
      //         }
      //       )
      //     );

      //     // Wait for the API call to complete
      //     await queryFulfilled;
      //   } catch {
      //     // Handle rollback if API call fails (optional)
      //   }
      // },
      onQueryStarted: async (id, { dispatch, getState, queryFulfilled }) => {
        // Find the query arguments dynamically
        const cacheEntries = getState().tableApi.queries;
        const queryArgs = Object.keys(cacheEntries).find((key) =>
          key.startsWith("getMyTables")
        );

        if (!queryArgs) return; // Ensure there's valid cache data before modifying

        console.log("Updating cache for:", queryArgs);

        try {
          // Optimistically update cache before API call
          dispatch(
            tableApi.util.updateQueryData(
              "getMyTables",
              JSON.parse(queryArgs),
              (draft) => {
                console.log("Before deletion:", draft.data.tables);

                if (draft.data?.tables) {
                  draft.data.tables = draft.data.tables.filter(
                    (table) => table._id !== id
                  );
                  console.log("After deletion:", draft.data.tables);
                }
              }
            )
          );

          // Wait for API call to complete
          await queryFulfilled;
        } catch (error) {
          console.error("Failed to delete, rolling back:", error);
        }
      },
    }),

    updateTableById: builder.mutation({
      query: ({ tableId, ...data }) => ({
        url: `/${tableId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Table"],
    }),
  }),
});

export const {
  useGenerateTableQrMutation,
  useDownloadQrMutation,
  useGetMyTablesQuery,
  useDeleteTableByIdMutation,
  useUpdateTableByIdMutation,
} = tableApi;
