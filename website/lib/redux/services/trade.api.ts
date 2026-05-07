import { apiReducer } from ".";

export const tradeApi = apiReducer.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Execute a trade
    placeOrder: builder.mutation({
      query: (body) => ({
        url: "/trade/execute",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Trades", "Positions", "User"],
    }),
    // Get current holdings (Positions)
    getPositions: builder.query<any[], void>({
      query: () => "/trade/positions",
      providesTags: ["Positions"],
    }),
    // Get history (Trades)
    getTradeHistory: builder.query<any[], { status?: string } | undefined>({
      query: (params) => ({
        url: "/trade/history",
        params: params ? { status: params.status } : {},
      }),
      providesTags: ["Trades"],
    }),
  }),
});

export const {
  useGetPositionsQuery,
  useGetTradeHistoryQuery,
  usePlaceOrderMutation,
} = tradeApi;
