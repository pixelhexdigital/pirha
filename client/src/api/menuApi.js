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
    getMenuCategoryByRestaurantId: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Menu"],
      transformResponse: (response) => response.data,
      transformErrorResponse: (response) => {
        errorToast({ error: response });
        return response;
      },
    }),

    getMyMenu: builder.query({
      query: () => ``,
      providesTags: ["Menu"],
      transformResponse: (response) => response.data,
      transformErrorResponse: (response) => {
        errorToast({ error: response });
        return response;
      },
    }),

    addItemToCategory: builder.mutation({
      query: ({ categoryId, item }) => ({
        url: `/categories/${categoryId}/items`,
        method: "POST",
        body: item,
      }),
      invalidatesTags: ["Menu"],
    }),

    updateItemInCategory: builder.mutation({
      query: ({ categoryId, itemId, item }) => ({
        url: `/${categoryId}/items/${itemId}`,
        method: "PUT",
        body: item,
      }),
    }),

    deleteItemFromCategory: builder.mutation({
      query: ({ categoryId, itemId }) => ({
        url: `/${categoryId}/items/${itemId}`,
        method: "DELETE",
      }),
    }),

    createMenuCategory: builder.mutation({
      query: (category) => ({
        url: "/categories",
        method: "POST",
        body: category,
      }),
    }),
    updateMenuCategory: builder.mutation({
      query: ({ categoryId, category }) => ({
        url: `/categories/${categoryId}`,
        method: "PUT",
        body: category,
      }),
    }),
    deleteMenuCategory: builder.mutation({
      query: (categoryId) => ({
        url: `/categories/${categoryId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useAddItemToCategoryMutation,
  useGetMenuCategoryByRestaurantIdQuery,
  useGetMyMenuQuery,
  useCreateMenuCategoryMutation,
} = menuApi;
