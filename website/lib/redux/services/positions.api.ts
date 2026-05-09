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
      invalidatesTags: ["POSITIONS", "Positions"],
    }),

    cancelPosition: builder.mutation({
      query: (body) => ({
        url: "/positions/cancel",
        method: "POST",
        body,
      }),
      invalidatesTags: ["POSITIONS", "Positions"],
    }),

    getMyAssets: builder.query({
      query: () => ({
        url: "/positions/my-assets",
        method: "GET",
      }),
      providesTags: ["POSITIONS", "Positions"],
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
      invalidatesTags: ["POSITIONS", "Positions"],
    }),
  }),
});

export const {
  useBuyPositionMutation,
  useGetMyAssetsQuery,
  useCancelPositionMutation,
  useSellPositionMutation,
} = positionApi;
