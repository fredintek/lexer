import { lexerApi } from ".";

export const userApi = lexerApi.injectEndpoints({
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
    updateProfile: builder.mutation({
      query: (credentials) => {
        return { url: "/user/profile", method: "PATCH", body: credentials };
      },
      invalidatesTags: ["User"],
    }),
    getUsers: builder.query<
      any,
      {
        search?: string;
        limit?: number;
        kycStatus?: string;
        accountStatus?: string;
        page?: number;
      }
    >({
      query: (params) => ({
        url: "user",
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),

    getUserMetrics: builder.query<
      {
        totalUsers: number;
        activeUsers: number;
        pendingKyc: number;
        suspendedUsers: number;
        totalBalance: number;
      },
      void
    >({
      query: () => ({
        url: "user/user-metrics",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    inviteUser: builder.mutation<
      any,
      { fullname: string; email: string; roleId: string }
    >({
      query: (body) => ({
        url: "/user",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    updateUser: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/user/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),
    deleteUser: builder.mutation<
      { message: string; deletedId: string },
      string
    >({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),
    getUserDetails: builder.query<any, string>({
      query: (id) => `/user/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
  }),
});

export const {
  useUpdateAvatarMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useGetUsersQuery,
  useInviteUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  useGetUserMetricsQuery,
} = userApi;
