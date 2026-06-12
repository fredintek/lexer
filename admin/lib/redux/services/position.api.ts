import { lexerApi } from ".";

export const postionApi = lexerApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllPositions: builder.query<any, void>({
      query: () => "positions/all",
      providesTags: ["POSITIONS"],
    }),
    getUserPositions: builder.query<any, string>({
      query: (userId) => `positions/user/${userId}`,
      providesTags: ["POSITIONS"],
    }),
    editUserPosition: builder.mutation<
      any,
      { userId: string; positionId: string; data: any }
    >({
      query: ({ userId, positionId, data }) => ({
        url: `positions/${positionId}/user/${userId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["POSITIONS"],
    }),
    deletePosition: builder.mutation<
      any,
      { userId: string; positionId: string }
    >({
      query: ({ userId, positionId }) => ({
        url: `positions/${userId}/${positionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["POSITIONS"],
    }),
  }),
});

export const {
  useGetAllPositionsQuery,
  useEditUserPositionMutation,
  useGetUserPositionsQuery,
  useDeletePositionMutation,
} = postionApi;
