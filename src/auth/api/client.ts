/**
 * API Client — centralized HTTP layer.
 * All network requests go through this module.
 *
 * Security: Authorization header is NEVER logged.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import * as SecureStore from 'expo-secure-store';

import { ApiError, NetworkError } from '@/src/auth/types';

// ─── Config ───────────────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://underwear-genetics-lincoln-tape.trycloudflare.com/api';

const TOKEN_KEY = 'auth_tokens';
const REQUEST_ID_HEADER = 'x-request-id';

// ─── Axios instance ────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Token storage ────────────────────────────────────────────────────────

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export async function storeTokens(tokens: StoredTokens): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens));
}

export async function getStoredTokens(): Promise<StoredTokens | null> {
  const raw = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ─── Request interceptor — inject token + correlation ID ──────────────────

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const tokens = await getStoredTokens();
    if (tokens?.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    // Inject correlation ID
    if (config.headers && !config.headers[REQUEST_ID_HEADER]) {
      (config.headers as Record<string, string>)[REQUEST_ID_HEADER] = generateRequestId();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Auth bridge — allows the apiClient (which lives outside React's tree)
 * to notify the auth store about session events without creating a
 * circular dependency. The store registers these callbacks at boot.
 */

type TokensHandler = (tokens: { accessToken: string; refreshToken: string }) => void;
type SessionExpiredHandler = () => void;

let onTokensRefreshed: TokensHandler | null = null;
let onSessionExpired: SessionExpiredHandler | null = null;

export function setAuthBridge(handlers: {
  onTokensRefreshed?: TokensHandler;
  onSessionExpired?: SessionExpiredHandler;
}): void {
  onTokensRefreshed = handlers.onTokensRefreshed ?? null;
  onSessionExpired = handlers.onSessionExpired ?? null;
}

// ─── Response interceptor — handle 401 → refresh ──────────────────────────

let isRefreshing = false;
let refreshQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

function processRefreshQueue(token: string, error?: unknown) {
  refreshQueue.forEach((cb) => {
    if (error) {
      cb.reject(error);
    } else {
      cb.resolve(token);
    }
  });
  refreshQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 — attempt token refresh once
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue concurrent requests until refresh completes
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = await getStoredTokens();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${API_BASE_URL}/logbook/auth/refresh`,
          { refreshToken: tokens.refreshToken },
          { timeout: 30_000, headers: { 'Content-Type': 'application/json' } }
        );

        const newToken = data.accessToken;
        const newRefresh = data.refreshToken;
        await storeTokens({ accessToken: newToken, refreshToken: newRefresh });
        onTokensRefreshed?.({ accessToken: newToken, refreshToken: newRefresh });
        processRefreshQueue(newToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processRefreshQueue('', refreshError);
        isRefreshing = false;
        await clearTokens();
        onSessionExpired?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ─── Helpers ───────────────────────────────────────────────────────────────

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function isNetworkError(error: unknown): error is NetworkError {
  if (typeof error !== 'object' || error === null) return false;
  const e = error as Record<string, unknown>;
  return (
    typeof e.code === 'string' &&
    typeof e.message === 'string' &&
    (e.code === 'ECONNABORTED' ||
      e.code === 'ERR_NETWORK' ||
      e.code === 'ERR_CONNECTION_REFUSED' ||
      e.message.includes('Network') ||
      e.message.includes('timeout') ||
      e.message.includes('socket') ||
      e.message.includes('unavailable'))
  );
}

export function extractApiError(error: unknown): string {
  if (isNetworkError(error)) {
    if (error.code === 'ECONNABORTED') return 'Yêu cầu hết thời gian chờ. Vui lòng thử lại.';
    if (error.code === 'ERR_NETWORK') return 'Không có kết nối mạng. Kiểm tra internet.';
    return 'Không thể kết nối máy chủ.';
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.message) {
      const messages = Array.isArray(data.message) ? data.message : [data.message];
      return messages.join('. ') || 'Đã xảy ra lỗi.';
    }
  }

  if (error instanceof Error) {
    // Never expose sensitive info
    if (
      error.message.includes('token') ||
      error.message.includes('password') ||
      error.message.includes('OTP')
    ) {
      return 'Đã xảy ra lỗi xác thực.';
    }
    return error.message;
  }

  return 'Đã xảy ra lỗi không xác định.';
}

export { apiClient };
