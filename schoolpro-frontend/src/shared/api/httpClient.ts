import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/shared/store/useAuthStore";

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api/v1";

// Normalize baseURL without trailing slash
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

/**
 * Enterprise Axios HTTP client with auto-injected bearer tokens,
 * concurrency-safe silent token refresh, and centralized 401 expiration handling.
 */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Dedicated Axios instance for refreshing tokens to avoid cyclic interceptor loops.
 */
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Refresh token concurrency queue state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const safeGetStorageItem = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    if (typeof window.localStorage !== "undefined" && typeof window.localStorage.getItem === "function") {
      const val = window.localStorage.getItem(key);
      if (val) return val;
    }
  } catch {
    // Ignore storage read errors
  }
  try {
    if (typeof window.sessionStorage !== "undefined" && typeof window.sessionStorage.getItem === "function") {
      return window.sessionStorage.getItem(key);
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
};

const safeRemoveStorageItem = (key: string) => {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.localStorage !== "undefined" && typeof window.localStorage.removeItem === "function") {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore
  }
  try {
    if (typeof window.sessionStorage !== "undefined" && typeof window.sessionStorage.removeItem === "function") {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Ignore
  }
};

/**
 * Clears all authentication credentials and safely redirects to login page.
 */
export const clearAuthSessionAndRedirect = (reason?: string) => {
  [
    "schoolpro_access_token",
    "schoolpro_refresh_token",
    "schoolpro_user",
    "schoolpro_role",
    "schoolpro_role_detail",
  ].forEach(safeRemoveStorageItem);

  try {
    useAuthStore.getState().logout();
  } catch {
    // Ignore store error during teardown
  }

  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    const redirectParam = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    const reasonParam = reason ? `&reason=${encodeURIComponent(reason)}` : "";
    window.location.href = `/login?redirect=${redirectParam}${reasonParam}`;
  }
};

// Request interceptor: Attach JWT authorization token and prevent path duplication
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // If baseURL already includes "/api/v1" and request URL starts with "/api/v1/", strip it to prevent duplication
    if (API_BASE_URL.endsWith("/api/v1") && config.url?.startsWith("/api/v1/")) {
      config.url = config.url.replace(/^\/api\/v1/, "");
    }

    const token = safeGetStorageItem("schoolpro_access_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Response interceptor: Silent token refresh on 401 and fallback redirect when refresh token expires
httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryAxiosRequestConfig | undefined;

    // Check if error is 401 Unauthorized and config exists
    if (error.response?.status === 401 && originalRequest) {
      const url = originalRequest.url || "";
      const isAuthEndpoint =
        url.includes("/core/auth/login/") ||
        url.includes("/core/auth/refresh/") ||
        url.includes("/core/auth/logout/");

      // If refresh token endpoint itself returned 401, or auth endpoints failed, session is permanently expired
      if (isAuthEndpoint || originalRequest._retry) {
        if (url.includes("/core/auth/refresh/")) {
          clearAuthSessionAndRedirect("refresh_token_expired");
        }
        return Promise.reject(error);
      }

      const refreshToken = safeGetStorageItem("schoolpro_refresh_token");

      // No refresh token available, logout immediately
      if (!refreshToken) {
        clearAuthSessionAndRedirect("no_refresh_token");
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If another request is currently refreshing the token, enqueue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return httpClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Initiate token refresh
      isRefreshing = true;

      try {
        const refreshResponse = await refreshClient.post<{
          code: number;
          status: string;
          data: { access: string; expires_in?: number };
        }>("/core/auth/refresh/", {
          refresh: refreshToken,
        });

        const newAccessToken = refreshResponse.data?.data?.access;

        if (!newAccessToken) {
          throw new Error("Không nhận được token mới từ máy chủ");
        }

        // Persist new access token in state and storage
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Resume all queued requests waiting for new access token
        processQueue(null, newAccessToken);

        // Retry original failed request with the new access token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return httpClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthSessionAndRedirect("refresh_token_expired");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
