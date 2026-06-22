import axios from "axios";
import { attachAuthInterceptor } from "@/services/auth-interceptor";
import { env } from "@/lib/env";

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

attachAuthInterceptor(api);

export default api;
