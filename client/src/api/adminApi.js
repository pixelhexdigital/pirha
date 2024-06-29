import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `http://localhost:8080/api/v1/admin`,
    credentials: "include",
    jsonContentType: "application/json",
  }),
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
          url: "/update-cover-image",
          method: "POST",
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
  }),
});

export const {
  useUpdateLogoMutation,
  useUpdateProfileMutation,
  useUpdateCoverImageMutation,
} = adminApi;
