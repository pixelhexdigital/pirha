import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { errorToast } from "lib/helper";

export const menuApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `http://localhost:8080/api/v1/menus`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set("authorization", `Token ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getMenuCategoryById: builder.query({
      query: (id) => `/${id}`,
      transformResponse: (response) => response.data,
      transformErrorResponse: (response) => {
        errorToast({ error: response });
        return response;
      },
    }),
  }),
});

export const { useGetMenuCategoryByIdQuery } = menuApi;
