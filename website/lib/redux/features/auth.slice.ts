import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type User = Record<string, unknown> | null;

interface AuthState {
  user: User;
  accessToken: string | null;
  isAuthenticated: boolean;
  forgotPasswordEmail?: string | null;
}

type AuthPayload = {
  message: string;
  user: Record<string, unknown>;
  accessToken: string;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user?: User;
        accessToken: string;
      }>,
    ) => {
      const { user, accessToken } = action.payload;

      if (user) state.user = user;
      state.accessToken = accessToken;

      state.isAuthenticated = true;
    },

    // Clears everything - useful for unauthorized errors or manual logout
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.forgotPasswordEmail = null;
    },

    setForgotPassword: (state, action) => {
      state.forgotPasswordEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Match successful Login, Register
      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") &&
          ["login", "register", "verifyLoginOtp", "verifyTotp"].includes(
            action.meta?.arg?.endpointName,
          ),
        (state, action: PayloadAction<AuthPayload>) => {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.isAuthenticated = true;
        },
      )
      // Match Logout
      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") &&
          action.meta?.arg?.endpointName === "logout",
        (state) => {
          state.user = null;
          state.accessToken = null;
          state.isAuthenticated = false;
        },
      )
      // Avatar updated
      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") &&
          action.meta?.arg?.endpointName === "updateAvatar",
        (state, action: PayloadAction<{ url: string }>) => {
          if (state.user) {
            state.user.avatar = action.payload;
          }
        },
      )
      // Profile updated
      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") &&
          action.meta?.arg?.endpointName === "updateProfile",
        (state, action: PayloadAction<{ url: string }>) => {
          if (state.user) {
            state.user = action.payload;
          }
        },
      )
      // Get Current User
      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") &&
          action.meta?.arg?.endpointName === "getMe",
        (state, action: PayloadAction<any>) => {
          state.user = action.payload;
        },
      );
  },
});

export const { setCredentials, logout, setForgotPassword } = authSlice.actions;

export default authSlice.reducer;

// Selectors for easy access in components
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth;
