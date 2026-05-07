import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const TWELVE_DATA_API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;

export const twelvedataApi = createApi({
  reducerPath: "twelvedataApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.twelvedata.com/",
  }),
  endpoints: (builder) => ({
    searchSymbols: builder.query({
      query: (text: string) =>
        `symbol_search?symbol=${text}&country=Turkey&apikey=${TWELVE_DATA_API_KEY}`,
      transformResponse: (response: any) => response.data || [],
    }),
    getStocks: builder.query({
      query: () =>
        `stocks?country=Turkey&apikey=${process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY}`,
      transformResponse: (response: any) => response.data || [],
    }),
    getQuote: builder.query({
      query: (symbol: string) =>
        `quote?symbol=${symbol}&country=Turkey&apikey=${TWELVE_DATA_API_KEY}`,
    }),
    getProfile: builder.query({
      query: (symbol: string) =>
        `profile?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
    }),
    getLogo: builder.query({
      query: (symbol: string) =>
        `profile?logo=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
    }),
    getStats: builder.query({
      query: (symbol: string) =>
        `statistics?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
    }),
    getHistory: builder.query({
      query: ({ symbol, interval }: { symbol: string; interval: string }) =>
        `time_series?symbol=${symbol}&interval=${interval}&outputsize=500&apikey=${TWELVE_DATA_API_KEY}`,
    }),
  }),
});

export const {
  useSearchSymbolsQuery,
  useGetQuoteQuery,
  useGetStocksQuery,
  useGetProfileQuery,
  useGetStatsQuery,
  useGetLogoQuery,
} = twelvedataApi;
