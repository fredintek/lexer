import { MFAEnum } from "@/lib/types";
import { apiReducer } from ".";

export const authApi = apiReducer.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // --- Basic Auth ---
    register: builder.mutation({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
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

    revokeOtherSessions: builder.mutation({
      query: () => ({
        url: "/auth/revoke-others",
        method: "POST",
      }),
    }),

    getLoginHistory: builder.query({
      query: () => ({
        url: "/auth/login-history",
      }),
    }),

    // --- MFA Control ---
    totpSetup: builder.mutation({
      query: () => ({
        url: "/auth/totp-setup",
        method: "POST",
      }),
    }),
    activateTotp: builder.mutation({
      query: (body: { code: string; secret: string }) => ({
        url: "/auth/activate-totp",
        method: "POST",
        body,
      }),
    }),
    toggleMfa: builder.mutation({
      query: (body: { method?: MFAEnum; status?: boolean }) => ({
        url: "/auth/toggle-mfa",
        method: "PATCH",
        body,
      }),
    }),

    // --- Email OTP ---
    requestEmailOtp: builder.mutation({
      query: () => ({
        url: "/auth/request-otp",
        method: "POST",
        body: { method: 2 }, // MFAEnum.EMAIL = 2
      }),
    }),
    verifyEmailOtp: builder.mutation({
      query: (body: { code: string }) => ({
        url: "/auth/verify-email-otp",
        method: "PATCH",
        body,
      }),
    }),
    verifyLoginOtp: builder.mutation({
      query: (credentials) => ({
        url: "/auth/verify-login-otp",
        method: "PATCH",
        body: credentials,
      }),
    }),
    verifyTotp: builder.mutation({
      query: (body: {
        userId: string;
        code: string;
        createTokens?: boolean;
      }) => ({
        url: "/auth/verify-totp",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useTotpSetupMutation,
  useActivateTotpMutation,
  useToggleMfaMutation,
  useRequestEmailOtpMutation,
  useVerifyEmailOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetLoginHistoryQuery,
  useRevokeOtherSessionsMutation,
  useVerifyLoginOtpMutation,
  useVerifyTotpMutation,
} = authApi;
