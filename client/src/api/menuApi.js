import { createApi } from "@reduxjs/toolkit/query/react";

import { errorToast } from "lib/helper";
import { BASE_URL } from "lib/constants";
import { baseQueryWithReAuth } from "lib/baseQueryWithReAuth";

export const menuApi = createApi({
  reducerPath: "menuApi",
  baseQuery: baseQueryWithReAuth(`${BASE_URL}/api/v1/menus`),
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
      transformResponse: (response) => response?.data?.menu ?? [],
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
        url: `/categories/${categoryId}/items/${itemId}`,
        method: "PATCH",
        body: item,
      }),
      invalidatesTags: ["Menu"],
    }),

    updateImageOfItem: builder.mutation({
      query: ({ categoryId, itemId, itemImage }) => {
        const formData = new FormData();
        formData.append("itemImage", itemImage);
        return {
          url: `/categories/${categoryId}/items/${itemId}/image`,
          method: "PATCH",
          body: formData,
        };
      },
      extraOptions: {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
      invalidatesTags: ["Menu"],
    }),

    toggleItemAvailability: builder.mutation({
      query: ({ categoryId, itemId, isActive }) => ({
        url: `/categories/${categoryId}/items/${itemId}/${isActive ? "activate" : "deactivate"}`,
        method: "PATCH",
      }),
      // Flip the switch instantly; roll back if the server rejects it.
      async onQueryStarted(
        { categoryId, itemId, isActive, restaurantId },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          menuApi.util.updateQueryData(
            "getMenuCategoryByRestaurantId",
            restaurantId,
            (draft) => {
              const category = draft?.menu?.categories?.find(
                (c) => c._id === categoryId
              );
              const item = category?.items?.find((i) => i._id === itemId);
              if (item) item.isActive = isActive;
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ["Menu"],
    }),

    deleteItemFromCategory: builder.mutation({
      query: ({ categoryId, itemId }) => ({
        url: `categories/${categoryId}/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Menu"],
    }),

    addMenuCategory: builder.mutation({
      query: (category) => ({
        url: "/categories",
        method: "POST",
        body: category,
      }),
      invalidatesTags: ["Menu"],
    }),

    updateMenuCategory: builder.mutation({
      query: ({ categoryId, category }) => ({
        url: `/categories/${categoryId}`,
        method: "PATCH",
        body: category,
      }),
      invalidatesTags: ["Menu"],
    }),

    updateImageOfCategory: builder.mutation({
      query: ({ categoryId, categoryImage }) => {
        const formData = new FormData();
        formData.append("categoryImage", categoryImage);
        return {
          url: `/categories/${categoryId}/image`,
          method: "PATCH",
          body: formData,
        };
      },
      extraOptions: {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
      invalidatesTags: ["Menu"],
    }),

    toggleCategoryAvailability: builder.mutation({
      query: ({ categoryId, isActive }) => ({
        url: `/categories/${categoryId}/${isActive ? "activate" : "deactivate"}`,
        method: "PATCH",
      }),
      // Flip the switch instantly; roll back if the server rejects it.
      async onQueryStarted(
        { categoryId, isActive, restaurantId },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          menuApi.util.updateQueryData(
            "getMenuCategoryByRestaurantId",
            restaurantId,
            (draft) => {
              const category = draft?.menu?.categories?.find(
                (c) => c._id === categoryId
              );
              if (category) category.isActive = isActive;
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ["Menu"],
    }),

    deleteMenuCategory: builder.mutation({
      query: ({ categoryId }) => ({
        url: `/categories/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Menu"],
    }),
  }),
});

export const {
  useAddItemToCategoryMutation,
  useGetMenuCategoryByRestaurantIdQuery,
  useGetMyMenuQuery,
  useUpdateItemInCategoryMutation,
  useToggleItemAvailabilityMutation,
  useUpdateImageOfCategoryMutation,
  useUpdateImageOfItemMutation,
  useDeleteItemFromCategoryMutation,
  useAddMenuCategoryMutation,
  useUpdateMenuCategoryMutation,
  useToggleCategoryAvailabilityMutation,
  useDeleteMenuCategoryMutation,
} = menuApi;
