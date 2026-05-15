import { apiReducer } from ".";

export const positionApi = apiReducer.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    buyPosition: builder.mutation({
      query: (body) => ({
        url: "/positions/buy",
        method: "POST",
        body,
      }),
      invalidatesTags: ["POSITIONS", "Positions", "TRANSACTIONS"],
    }),

    cancelPosition: builder.mutation({
      query: (body) => ({
        url: "/positions/cancel",
        method: "POST",
        body,
      }),
      invalidatesTags: ["POSITIONS", "Positions", "TRANSACTIONS"],
    }),

    getMyAssets: builder.query({
      query: () => ({
        url: "/positions/my-assets",
        method: "GET",
      }),
      providesTags: ["POSITIONS", "Positions", "TRANSACTIONS"],
    }),

    sellPosition: builder.mutation<
      any,
      { positionId: string; lotsToSell: number }
    >({
      query: (body) => ({
        url: "positions/sell",
        method: "POST",
        body,
      }),
      invalidatesTags: ["POSITIONS", "Positions", "TRANSACTIONS"],
    }),

    getTransactionHistory: builder.query<any, void>({
      query: () => "/positions/transaction-history",
      providesTags: ["Positions", "POSITIONS"],
    }),
  }),
});

export const {
  useBuyPositionMutation,
  useGetMyAssetsQuery,
  useCancelPositionMutation,
  useSellPositionMutation,
  useGetTransactionHistoryQuery,
} = positionApi;
