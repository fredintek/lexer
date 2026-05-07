import { apiReducer } from ".";

export const userApi = apiReducer.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    updateAvatar: builder.mutation({
      query: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return { url: "/user/avatar", method: "PATCH", body: formData };
      },
      invalidatesTags: ["User"],
    }),
    getMe: builder.query({
      query: () => "/user/me",
      providesTags: ["User"],
    }),
    getMyStats: builder.query({
      query: () => "/user/me/statistics",
      providesTags: ["User"],
    }),
    getUserActivity: builder.query({
      query: () => "/activity",
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query: (credentials) => {
        return { url: "/user/profile", method: "PATCH", body: credentials };
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useUpdateAvatarMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useGetUserActivityQuery,
  useGetMyStatsQuery,
} = userApi;
