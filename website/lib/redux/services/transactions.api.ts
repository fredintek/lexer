import { apiReducer } from ".";

export const transactionsApi = apiReducer.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getTxHistory: builder.query({
      query: () => `/transactions/my-history`,
      providesTags: ["TRANSACTIONS"],
    }),
  }),
});

export const { useGetTxHistoryQuery } = transactionsApi;
