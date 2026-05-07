import { lexerApi } from ".";

export const yfinanceApi = lexerApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getStocks: builder.query({
      query: () => `yfinance/turkish`,
    }),
    getStaticStocks: builder.query({
      query: () => `yfinance/static/stocks`,
      providesTags: ["Stocks"],
    }),
    updateLotSettings: builder.mutation({
      query: ({ symbol, ...patch }) => ({
        url: `/yfinance/${symbol}/lot-settings`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: ["Stocks"],
    }),
    updateStockAdj: builder.mutation<
      void,
      { symbol: string; buyAdj: number; sellAdj: number }
    >({
      query: ({ symbol, ...body }) => ({
        url: `/yfinance/${symbol}/adjustments`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Stocks"],
    }),
  }),
});

export const {
  useGetStocksQuery,
  useUpdateLotSettingsMutation,
  useGetStaticStocksQuery,
  useUpdateStockAdjMutation,
} = yfinanceApi;
