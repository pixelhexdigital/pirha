import { createApi } from "@reduxjs/toolkit/query/react";

import { BASE_URL } from "lib/constants";
import { baseQueryWithReAuth } from "lib/baseQueryWithReAuth";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithReAuth(`${BASE_URL}/api/v1/admin`),
  // Tags must be declared here or RTK Query silently ignores every
  // providesTags/invalidatesTags referencing them.
  tagTypes: ["Order", "OrderCounts", "Tax"],
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response) => response,
    }),
    updateCoverImage: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("coverImage", file);
        return {
          url: "/cover-image",
          method: "PATCH",
          body: formData,
        };
      },
      transformResponse: (response) => response,
    }),
    updateLogo: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("avatar", file);
        return {
          url: "/avatar",
          method: "PATCH",
          body: formData,
        };
      },
      transformResponse: (response) => response,
    }),
    getDashBoardData: builder.query({
      query: () => "/dashboard",
      transformResponse: (response) => response.data,
    }),
    getOrdersData: builder.query({
      query: ({ page = 1, status }) => `/orders?page=${page}&status=${status}`,
      transformResponse: (response) => response.data,
    }),
    onboardDone: builder.mutation({
      query: () => ({
        url: "/onboard-done",
        method: "GET",
      }),
      transformResponse: (response) => response,
    }),

    getOrderList: builder.query({
      query: ({ page = 1, limit = 10, ...otherPrams }) => ({
        url: `/orders`,
        params: { page, limit, ...otherPrams },
      }),
      providesTags: (result) =>
        result?.data?.orders
          ? [
              ...result.data.orders.map(({ _id }) => ({
                type: "Order",
                id: _id,
              })),
              "Order",
            ]
          : ["Order"],
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // Exclude 'page' from cache key
        // eslint-disable-next-line no-unused-vars
        const { page, ...filterArgs } = queryArgs || {};
        return `${endpointName}-${JSON.stringify(filterArgs)}`;
      },
      merge(currentCache, newItems, { arg }) {
        if (arg.status !== currentCache.status) {
          return newItems; // Replace cache for different status
        }
        const uniqueOrdersMap = new Map();

        currentCache.data.orders.forEach((order) => {
          uniqueOrdersMap.set(order._id, order);
        });

        newItems.data.orders.forEach((order) => {
          if (!uniqueOrdersMap.has(order._id)) {
            uniqueOrdersMap.set(order._id, order);
          }
        });

        currentCache.data.orders = Array.from(uniqueOrdersMap.values());
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

    // Queue-depth per status, powering the count badges on the order tabs.
    getOrderStatusCounts: builder.query({
      query: () => "/orders/status-counts",
      transformResponse: (response) => response.data,
      providesTags: ["OrderCounts"],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}`,
        method: "PATCH",
        body: { status },
      }),
      // Invalidate the whole order list (not just this order) so the change
      // propagates across every status tab and the kitchen board, and refresh
      // the tab counts since the order just moved between statuses.
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Order", id: orderId },
        "Order",
        "OrderCounts",
      ],
    }),

    generateCustomerBill: builder.mutation({
      query: (customerId) => ({
        url: `/bills/${customerId}`,
        method: "PATCH",
      }),
    }),

    getTaxes: builder.query({
      query: () => "/taxes",
      providesTags: ["Tax"],
      transformResponse: (response) => response.data,
    }),
    createTax: builder.mutation({
      query: (data) => ({
        url: "/taxes",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tax"],
    }),
    updateTax: builder.mutation({
      query: (data) => ({
        url: "/taxes",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Tax"],
    }),
  }),
});

export const {
  useUpdateLogoMutation,
  useUpdateProfileMutation,
  useGetDashBoardDataQuery,
  useUpdateCoverImageMutation,
  useGetOrdersDataQuery,
  useOnboardDoneMutation,
  useGetOrderListQuery,
  useGetOrderStatusCountsQuery,
  useUpdateOrderStatusMutation,
  useGenerateCustomerBillMutation,
  useGetTaxesQuery,
  useCreateTaxMutation,
  useUpdateTaxMutation,
} = adminApi;
