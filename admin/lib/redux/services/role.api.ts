import { lexerApi } from ".";

export const roleApi = lexerApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => "/role",
      providesTags: ["Roles"],
    }),

    getPermissions: builder.query({
      query: () => "/role/permissions",
    }),

    createRole: builder.mutation({
      query: (body) => ({
        url: "/role",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Roles"],
    }),

    updateRole: builder.mutation({
      query: ({ id, data }) => ({
        url: `/role/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Roles"],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
} = roleApi;
