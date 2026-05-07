import { lexerApi } from ".";

export const authApi = lexerApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // --- Basic Auth ---
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: { ...credentials, isAdmin: true },
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
        body: { isAdmin: true },
      }),
    }),
    forgotPassword: builder.mutation({
      query: (credentials) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: credentials,
      }),
    }),
    resetPassword: builder.mutation({
      query: (credentials) => ({
        url: "/auth/reset-password",
        method: "PATCH",
        body: credentials,
      }),
    }),

    changePassword: builder.mutation({
      query: (body: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
      }) => ({
        url: "/auth/update-password",
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi;
