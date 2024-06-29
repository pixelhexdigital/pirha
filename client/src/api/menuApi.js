import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "lib/constants";
import { errorToast } from "lib/helper";

export const menuApi = createApi({
  reducerPath: "menuApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/v1/menus`,
    credentials: "include",
    jsonContentType: "application/json",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set("authorization", `Token ${token}`);
      }
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
