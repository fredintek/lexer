import { apiReducer } from ".";

export const walletApi = apiReducer.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getWalletHistory: builder.query<
      any[],
      { type?: string; status?: string } | void
    >({
      query: (params) => ({
        url: "/wallet/history",
        params: params || {},
      }),
      providesTags: ["User", "Transactions"],
    }),
    requestWithdrawal: builder.mutation({
      query: (body: { amount: number; paymentMethodId: string }) => ({
        url: "/wallet/withdraw",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Transactions", "User", "Notifications"],
    }),
    createDeposit: builder.mutation({
      query: (formData) => ({
        url: "/wallet/deposit",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Transactions", "User", "Notifications"],
    }),
  }),
});

export const {
  useGetWalletHistoryQuery,
  useRequestWithdrawalMutation,
  useCreateDepositMutation,
} = walletApi;
