import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { RootState } from "../store";
import { logout, setCredentials } from "../features/auth.slice";

// Create a lock to prevent multiple simultaneous refresh calls
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // 1. Automatically attach the Access Token to every request
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait until the mutex is available (no refresh in progress)
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  // 2. If a request fails with 401, start the refresh logic
  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        // Attempt to refresh the token
        const refreshResult = await baseQuery(
          {
            url: "/auth/refresh-access-token",
            method: "POST",
            body: { isAdmin: true },
          },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          // 4. Save the new tokens and user to Redux
          api.dispatch(setCredentials(refreshResult.data as any));

          // 5. Retry the original failed request
          result = await baseQuery(args, api, extraOptions);
        } else {
          // 6. Refresh failed -> Force logout
          await baseQuery(
            { url: "/auth/logout", method: "POST", body: { isAdmin: true } },
            api,
            extraOptions,
          );
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      // If another request is already refreshing, wait for it and then retry
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const lexerApi = createApi({
  reducerPath: "lexerApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Roles",
    "BankAccount",
    "Transactions",
    "Banner",
    "Chat",
    "Room",
    "KYC",
    "Stocks",
    "SETTINGS",
  ],
  endpoints: (builder) => ({}),
});
