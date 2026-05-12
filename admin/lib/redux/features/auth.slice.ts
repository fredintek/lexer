import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type User = Record<string, any> | null;

interface AuthState {
  user: User;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
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
  isAdmin: false,
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
      state.isAdmin = user?.role?.name !== "TRADER";
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
    },

    setForgotPassword: (state, action) => {
      state.forgotPasswordEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") &&
          ["login"].includes(action.meta?.arg?.endpointName),
        (state, action: PayloadAction<AuthPayload>) => {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.isAuthenticated = true;
          state.isAdmin = (action.payload.user?.role as any)?.name !== "TRADER";
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") &&
          action.meta?.arg?.endpointName === "logout",
        (state) => {
          state.user = null;
          state.accessToken = null;
          state.isAuthenticated = false;
          state.isAdmin = false;
        },
      ) // Avatar updated
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
      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") &&
          action.meta?.arg?.endpointName === "updateProfile",
        (state, action: PayloadAction<{ url: string }>) => {
          if (state.user) {
            state.user = action.payload;
          }
        },
      );
  },
});

export const { setCredentials, logout, setForgotPassword } = authSlice.actions;

export default authSlice.reducer;

// Selectors for easy access in components
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectCurrentUserAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
