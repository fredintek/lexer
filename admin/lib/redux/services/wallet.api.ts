import { lexerApi } from ".";

export const walletApi = lexerApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getTxStats: builder.query<
      { pendingCount: number; totalValue: number },
      any
    >({
      query: (type) => ({
        url: "/wallet/tx/stats/pending",
        params: { type },
      }),
      providesTags: ["Transactions"],
    }),

    getAllTx: builder.query<
      any[],
      { search?: string; status?: string; type?: string; userId?: string }
    >({
      query: (params) => ({
        url: "/wallet/tx",
        params,
      }),
      providesTags: ["Transactions"],
    }),
    approveTransaction: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/wallet/tx/${id}/approve`,
        method: "PATCH",
        params: { id },
      }),
      invalidatesTags: ["Transactions"],
    }),

    rejectTransaction: builder.mutation<
      any,
      { id: string; adminNote?: string }
    >({
      query: ({ id, adminNote }) => ({
        url: `/wallet/tx/${id}/reject`,
        method: "PATCH",
        params: { id },
        body: { adminNote },
      }),
      invalidatesTags: ["Transactions"],
    }),
    getFlowStats: builder.query<any[], void>({
      query: () => "/wallet/withdrawal/stats/flow",
      providesTags: ["Transactions"],
    }),
  }),
});

export const {
  useGetAllTxQuery,
  useApproveTransactionMutation,
  useRejectTransactionMutation,
  useGetTxStatsQuery,
  useGetFlowStatsQuery,
} = walletApi;
