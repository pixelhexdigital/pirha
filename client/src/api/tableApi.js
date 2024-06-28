import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const tableApi = createApi({
  reducerPath: "tableApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `http://localhost:8080/api/v1/tables`,
    credentials: "include",
    jsonContentType: "application/json",
  }),
  endpoints: (builder) => ({
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

export const { useGenerateTableQrMutation, useDownloadQrMutation } = tableApi;
