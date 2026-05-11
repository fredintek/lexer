import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { RootState } from "./../store";
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

const handleForceLogout = async (api: any, extraOptions: any) => {
  try {
    await baseQuery(
      {
        url: "/auth/logout",
        method: "POST",
      },
      api,
      extraOptions,
    );
  } catch (e) {
    console.error("Logout request failed, proceeding with local cleanup");
  }
  api.dispatch(logout());
  if (typeof window !== "undefined") {
    window.location.replace("/auth/login");
  }
};

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
          { url: "/auth/refresh-access-token", method: "POST" },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          // 4. Save the new tokens and user to Redux
          api.dispatch(setCredentials(refreshResult.data as any));

          // 5. Retry the original failed request
          result = await baseQuery(args, api, extraOptions);
          if (result.error && result.error.status === 401) {
            handleForceLogout(api, extraOptions);
          }
        } else {
          // 6. Refresh failed -> Force logout
          handleForceLogout(api, extraOptions);
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

export const apiReducer = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "PaymentMethods",
    "Transactions",
    "User",
    "Notifications",
    "Chat",
    "BANNER",
    "MARKETS",
    "BankAccount",
    "Positions",
    "Trades",
    "SETTINGS",
    "Favorites",
    "POSITIONS",
  ],
  endpoints: (builder) => ({}),
});
