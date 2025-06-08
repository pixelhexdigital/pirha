import { createApi } from "@reduxjs/toolkit/query/react";

import { BASE_URL } from "lib/constants";
import { baseQueryWithReAuth } from "lib/baseQueryWithReAuth";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReAuth(`${BASE_URL}/api/v1/users`),
  endpoints: (builder) => ({
    currentUser: builder.query({
      query: () => ({
        url: "/current-user",
        method: "GET",
      }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const { useCurrentUserQuery } = userApi;
