import type { User } from "@/types";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AuthUser = User;

export type AuthPayload = {
  user: AuthUser;
  accessToken: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};
