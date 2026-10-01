import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/**
 * Enterprise Axios HTTP client with auto-injected bearer tokens and centralized 401 redirection.
 */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach JWT authorization token
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      localStorage.getItem("schoolpro_access_token") ||
      sessionStorage.getItem("schoolpro_access_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Global error handler & 401 session expiration handling
httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear all stored authentication credentials
      localStorage.removeItem("schoolpro_access_token");
      localStorage.removeItem("schoolpro_refresh_token");
      localStorage.removeItem("schoolpro_user");
      localStorage.removeItem("schoolpro_role");

      sessionStorage.removeItem("schoolpro_access_token");
      sessionStorage.removeItem("schoolpro_refresh_token");
      sessionStorage.removeItem("schoolpro_user");
      sessionStorage.removeItem("schoolpro_role");

      // Redirect to login if not already on the login page
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    return Promise.reject(error);
  }
);
