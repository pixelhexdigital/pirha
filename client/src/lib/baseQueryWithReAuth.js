import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { BASE_URL } from "lib/constants";
import { loggedOut, setCredentials } from "store/AuthSlice";

const createDynamicBaseQuery = (baseUrl) => {
  return fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().Auth.accessToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include",
    jsonContentType: "application/json",
  });
};

const baseQueryForRefreshToken = fetchBaseQuery({
  baseUrl: `${BASE_URL}/api/v1/users/`,
  method: "POST",
  credentials: "include",
  jsonContentType: "application/json",
});

const handleReAuthentication = async (api, extraOptions, args, baseQuery) => {
  const refreshResult = await baseQueryForRefreshToken(
    "/refresh-token",
    api,
    extraOptions
  );
  console.log("Refresh result: ", refreshResult);

  if (refreshResult.data) {
    api.dispatch(setCredentials(refreshResult.data));
    return await baseQuery(args, api, extraOptions);
  } else {
    api.dispatch(loggedOut());
    return refreshResult;
  }
};

export const baseQueryWithReAuth =
  (baseUrl) => async (args, api, extraOptions) => {
    const baseQuery = createDynamicBaseQuery(baseUrl);
    let result = await baseQuery(args, api, extraOptions);

    if (result.error) {
      if (result.error.status === 401) {
        result = await handleReAuthentication(
          api,
          extraOptions,
          args,
          baseQuery
        );
      } else {
        console.error(`Error ${result.error.status}: `, result.error.data);
      }
    }

    return result;
  };
