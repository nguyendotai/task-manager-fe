import type { AxiosError, AxiosRequestConfig } from "axios";
import axios from "axios";
import type { BaseQueryApi, BaseQueryFn } from "@reduxjs/toolkit/query";
import { env } from "@/lib/env";
import { setCredentials } from "@/modules/auth/store/auth-slice";
import {
  getAccessToken,
  setAccessTokenToStorage
} from "@/services/token";

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
};

type ApiErrorResponse = {
  message?: string;
  errors?: unknown;
};

type RefreshTokenResponse = {
  accessToken?: string;
  data?: {
    accessToken?: string;
  };
};

export type ApiQueryError = {
  status?: number;
  message: string;
  errors?: unknown;
};

export const axiosBaseQuery: BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  ApiQueryError
> = async (
  { url, method = "GET", data, params },
  baseQueryApi: BaseQueryApi
) => {
  try {
    const result = await requestWithAuth({ url, method, data, params });
    return { data: result.data };
  } catch (rawError) {
    const error = rawError as AxiosError<ApiErrorResponse>;

    if (error.response?.status === 401 && baseQueryApi) {
      try {
        const accessToken = await refreshAccessToken();
        baseQueryApi.dispatch(setCredentials({ accessToken }));
        setAccessTokenToStorage(accessToken);
        const retryResult = await requestWithAuth({
          url,
          method,
          data,
          params,
          accessToken
        });

        return { data: retryResult.data };
      } catch (refreshError) {
        const nextError = refreshError as AxiosError<ApiErrorResponse>;
        return {
          error: {
            status: nextError.response?.status ?? 401,
            message:
              nextError.response?.data?.message ??
              "Your session has expired. Please sign in again.",
            errors: nextError.response?.data?.errors
          } satisfies ApiQueryError
        };
      }
    }

    return {
      error: {
        status: error.response?.status,
        message:
          error.response?.data?.message ??
          error.message ??
          "Unable to complete request.",
        errors: error.response?.data?.errors
      } satisfies ApiQueryError
    };
  }
};

function requestWithAuth({
  url,
  method,
  data,
  params,
  accessToken = getAccessToken()
}: AxiosBaseQueryArgs & { accessToken?: string | null }): Promise<{
  data: unknown;
}> {
  return axios({
    baseURL: env.apiBaseUrl,
    url,
    method,
    data,
    params,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    }
  });
}

async function refreshAccessToken() {
  const response = await axios.post<RefreshTokenResponse>(
    "/auth/refresh-token",
    undefined,
    {
      baseURL: env.apiBaseUrl,
      withCredentials: true
    }
  );
  const accessToken = response.data.accessToken ?? response.data.data?.accessToken;

  if (!accessToken) {
    throw new Error("Refresh token response did not include accessToken");
  }

  return accessToken;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Unable to complete request."
) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as ApiQueryError).message);
  }

  return fallback;
}
