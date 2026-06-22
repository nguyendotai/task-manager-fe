import api from "@/services/api";
import type {
  ApiResponse,
  AuthPayload,
  LoginRequest,
  RegisterRequest
} from "@/modules/auth/types";

export const authService = {
  async login(payload: LoginRequest) {
    const response = await api.post<ApiResponse<AuthPayload>>(
      "/auth/login",
      payload,
      {
        _skipAuthRefresh: true
      }
    );

    return response.data;
  },

  async register(payload: RegisterRequest) {
    const response = await api.post<ApiResponse<AuthPayload>>(
      "/auth/register",
      payload,
      {
        _skipAuthRefresh: true
      }
    );

    return response.data;
  },

  async refreshToken() {
    const response = await api.post<ApiResponse<AuthPayload>>(
      "/auth/refresh-token",
      undefined,
      {
        _skipAuthRefresh: true
      }
    );

    return response.data;
  },

  async logout() {
    const response = await api.post<ApiResponse<Record<string, never>>>(
      "/auth/logout",
      undefined,
      {
        _skipAuthRefresh: true
      }
    );

    return response.data;
  }
};
