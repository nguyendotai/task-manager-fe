import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from "axios";
import { logout, setCredentials } from "@/modules/auth/store/auth-slice";
import { env } from "@/lib/env";
import { store } from "@/store";
import {
  getAccessToken,
  removeAccessTokenFromStorage,
  setAccessTokenToStorage
} from "@/services/token";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

type RefreshTokenResponse = {
  accessToken?: string;
  data?: {
    accessToken?: string;
  };
};

let refreshPromise: Promise<string> | null = null;

function readAccessTokenFromRefreshResponse(response: AxiosResponse<RefreshTokenResponse>) {
  return response.data.accessToken ?? response.data.data?.accessToken ?? null;
}

async function refreshAccessToken() {
  refreshPromise ??= axios
    .post<RefreshTokenResponse>(
      "/auth/refresh-token",
      undefined,
      {
        baseURL: env.apiBaseUrl,
        withCredentials: true
      }
    )
    .then((response) => {
      const accessToken = readAccessTokenFromRefreshResponse(response);

      if (!accessToken) {
        throw new Error("Refresh token response did not include accessToken");
      }

      store.dispatch(setCredentials({ accessToken }));
      setAccessTokenToStorage(accessToken);

      return accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function handleLogout() {
  store.dispatch(logout());
  removeAccessTokenFromStorage();

  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

function attachAuthorizationHeader(config: InternalAxiosRequestConfig) {
  const accessToken = getAccessToken(store.getState());

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
}

export function attachAuthInterceptor(api: AxiosInstance) {
  api.interceptors.request.use(attachAuthorizationHeader);

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const originalRequest = error.config as RetriableRequestConfig | undefined;

      if (
        !originalRequest ||
        status !== 401 ||
        originalRequest._retry ||
        originalRequest._skipAuthRefresh
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        handleLogout();
        return Promise.reject(refreshError);
      }
    }
  );
}
