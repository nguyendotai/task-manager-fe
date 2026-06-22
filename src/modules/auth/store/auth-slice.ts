import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types";
import {
  getAccessTokenFromStorage,
  removeAccessTokenFromStorage,
  setAccessTokenToStorage
} from "@/services/token";

const AUTH_USER_KEY = "authUser";

type AuthState = {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
};

type CredentialsPayload = {
  accessToken: string;
  user?: User | null;
};

function readUserFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = window.localStorage.getItem(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

function writeUserToStorage(user: User | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function normalizeUser(user: User) {
  return {
    ...user,
    id: user.id ?? user._id ?? user.email
  };
}

const initialAccessToken = getAccessTokenFromStorage();
const initialUser = readUserFromStorage();

const initialState: AuthState = {
  accessToken: initialAccessToken,
  user: initialUser,
  isAuthenticated: Boolean(initialAccessToken),
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authRequestStarted(state) {
      state.loading = true;
      state.error = null;
    },
    authRequestFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setCredentials(state, action: PayloadAction<CredentialsPayload>) {
      const nextUser = action.payload.user
        ? normalizeUser(action.payload.user)
        : state.user;

      state.accessToken = action.payload.accessToken;
      state.user = nextUser;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      setAccessTokenToStorage(action.payload.accessToken);
      writeUserToStorage(nextUser);
    },
    logout(state) {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      removeAccessTokenFromStorage();
      writeUserToStorage(null);
    },
    clearAuthError(state) {
      state.error = null;
    }
  }
});

export const {
  authRequestFailed,
  authRequestStarted,
  clearAuthError,
  logout,
  setCredentials
} = authSlice.actions;
export default authSlice.reducer;
