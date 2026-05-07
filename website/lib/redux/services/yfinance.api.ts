import { apiReducer } from "."; // Assuming this is your base API with the baseUrl

export const yfinanceApi = apiReducer.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getYfQuote: builder.query({
      query: (symbol: string) => `yfinance/quote/${symbol}`,
    }),

    getYfStocks: builder.query({
      query: () => `yfinance/turkish`,
    }),

    getYfDetails: builder.query({
      query: (symbol: string) => `yfinance/details/${symbol}`,
    }),

    getYfHistory: builder.query({
      query: ({
        symbol,
        from,
        interval,
      }: {
        symbol: string;
        from: string;
        interval: string;
      }) => ({
        url: `yfinance/history/${symbol}`,
        params: { from, interval },
      }),
    }),

    getNews: builder.query({
      query: (symbol) => `/yfinance/${symbol}/news`,
    }),

    getLiveMarkets: builder.query<any[], undefined>({
      query: () => "/yfinance/live-markets",
    }),

    getStaticStock: builder.query({
      query: (symbol) => `yfinance/static/stock/${symbol}`,
    }),

    getFavorites: builder.query<string[], void>({
      query: () => "yfinance/favorites",
      providesTags: ["Favorites"],
    }),

    toggleFavorite: builder.mutation<{ isFavorite: boolean }, string>({
      query: (symbol) => ({
        url: `yfinance/favorite/${symbol}`,
        method: "POST",
      }),
      invalidatesTags: ["Favorites"],
      async onQueryStarted(symbol, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          yfinanceApi.util.updateQueryData(
            "getFavorites",
            undefined,
            (draft) => {
              if (draft.includes(symbol)) {
                return draft.filter((s) => s !== symbol);
              } else {
                draft.push(symbol);
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetYfDetailsQuery,
  useGetYfHistoryQuery,
  useGetYfQuoteQuery,
  useGetYfStocksQuery,
  useGetNewsQuery,
  useGetLiveMarketsQuery,
  useGetStaticStockQuery,
  useGetFavoritesQuery,
  useToggleFavoriteMutation,
} = yfinanceApi;
