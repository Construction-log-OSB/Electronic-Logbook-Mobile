/**
 * Auth Store — centralized state management for authentication.
 *
 * State machine:
 *   initializing → unauthenticated | authenticated
 *   unauthenticated → authenticating (login) | submitting (register/forgot)
 *   authenticating → authenticated | error
 *   error → unauthenticated (on retry)
 *   submitting → unauthenticated (success) | error (failure)
 *   logging_out → unauthenticated
 *
 * AuthGate redirect logic:
 *   status === 'initializing' → render splash
 *   status === 'authenticated' → redirect to /(app)/home if not in app group
 *   status === 'unauthenticated' → redirect to /(auth)/login if not in auth group
 *   status === 'error' → STAY on current screen (no redirect)
 */

import { create } from 'zustand';

import {
  AuthStatus,
  AccountInfo,
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AccountStatus,
  AccountType,
  IdentifierType,
} from '@/src/auth/types';

import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  forgotPassword as forgotPasswordApi,
  resetPassword as resetPasswordApi,
  getAccountProfile,
  getFishermanProfile,
  getAccountIdentifiers,
  AccountProfileResponse,
  FishermanProfileResponse,
  AccountIdentifier,
} from '@/src/auth/api/auth.service';
import { getStoredTokens, clearTokens, storeTokens, extractApiError } from '@/src/auth/api/client';
import { AxiosError } from 'axios';

// ─── State ────────────────────────────────────────────────────────────────

export interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  account: AccountInfo | null;
  error: string | null;
}

// ─── Actions ───────────────────────────────────────────────────────────────

export interface AuthActions {
  hydrate: () => Promise<void>;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (dto: ForgotPasswordDto) => Promise<{ expiresIn: number }>;
  resetPassword: (dto: ResetPasswordDto) => Promise<void>;
  clearError: () => void;
  isAuthenticated: () => boolean;
  isInitializing: () => boolean;
}

export type AuthStore = AuthState & AuthActions;

const INITIAL_STATE: AuthState = {
  status: 'initializing',
  accessToken: null,
  refreshToken: null,
  account: null,
  error: null,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...INITIAL_STATE,

  // ── Hydrate ─────────────────────────────────────────────────────────
  hydrate: async () => {
    try {
      const tokens = await getStoredTokens();
      if (!tokens?.accessToken) {
        set({ status: 'unauthenticated', accessToken: null, refreshToken: null, account: null });
        return;
      }

      set({
        status: 'authenticating',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      const payload = decodeJwtPayload(tokens.accessToken);
      const accountId = payload?.accountId ?? payload?.sub;
      if (!accountId || typeof accountId !== 'string') {
        await clearTokens();
        set({ status: 'unauthenticated', accessToken: null, refreshToken: null, account: null });
        return;
      }

      const account = await loadAccountInfo(accountId);
      set({
        status: 'authenticated',
        account,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch {
      await clearTokens();
      set({ status: 'unauthenticated', accessToken: null, refreshToken: null, account: null });
    }
  },

  // ── Login ───────────────────────────────────────────────────────────
  login: async (dto: LoginDto) => {
    set({ status: 'authenticating', error: null });
    try {
      const result = await loginApi(dto);
      // loginApi stores tokens internally

      const payload = decodeJwtPayload(result.accessToken);
      const accountId = payload?.accountId ?? payload?.sub;
      let account: AccountInfo | null = null;

      if (typeof accountId === 'string') {
        try {
          account = await loadAccountInfo(accountId);
        } catch {
          // Profile fetch failed — still authenticate with token
        }
      }

      set({
        status: 'authenticated',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        account,
      });
    } catch (err) {
      let message = 'Đăng nhập thất bại.';
      if (err instanceof AxiosError && err.response?.status === 401) {
        message = 'Tài khoản hoặc mật khẩu không chính xác.';
      } else {
        message = extractApiError(err);
      }
      // Stay on login screen — AuthGate sees 'unauthenticated' → stays on /(auth)/login
      set({ status: 'unauthenticated', error: message, accessToken: null, refreshToken: null });
    }
  },

  // ── Register ────────────────────────────────────────────────────────
  register: async (dto: RegisterDto) => {
    set({ status: 'submitting', error: null });
    try {
      await registerApi(dto);
      // Registration successful — go back to login
      set({ status: 'unauthenticated', error: null });
    } catch (err) {
      const message = extractApiError(err);
      // Stay on register screen — AuthGate sees 'unauthenticated' → stays on /(auth)/register
      set({ status: 'unauthenticated', error: message });
    }
  },

  // ── Logout ────────────────────────────────────────────────────────
  logout: async () => {
    set({ status: 'logging_out' });
    try {
      await logoutApi();
    } finally {
      // logoutApi clears tokens internally
      set({
        status: 'unauthenticated',
        accessToken: null,
        refreshToken: null,
        account: null,
        error: null,
      });
    }
  },

  // ── Forgot Password ───────────────────────────────────────────────
  forgotPassword: async (dto: ForgotPasswordDto): Promise<{ expiresIn: number }> => {
    try {
      const result = await forgotPasswordApi(dto);
      // OTP sent — caller handles navigation
      return { expiresIn: result.expiresIn ?? 5 };
    } catch (err) {
      const message = extractApiError(err);
      throw new Error(message);
    }
  },

  // ── Reset Password ────────────────────────────────────────────────
  resetPassword: async (dto: ResetPasswordDto): Promise<void> => {
    try {
      await resetPasswordApi(dto);
    } catch (err) {
      const message = extractApiError(err);
      throw new Error(message);
    }
  },

  // ── Clear Error ─────────────────────────────────────────────────
  clearError: () => set({ error: null }),

  // ── Derived selectors ────────────────────────────────────────────
  isAuthenticated: () => get().status === 'authenticated',
  isInitializing: () => get().status === 'initializing',
}));

// ─── Helpers ────────────────────────────────────────────────────────────

async function loadAccountInfo(accountId: string): Promise<AccountInfo> {
  const [account, profile, identifiers] = await Promise.all([
    getAccountProfile(accountId),
    getFishermanProfileSafe(accountId),
    getAccountIdentifiersSafe(accountId),
  ]);

  const primaryIdentifier = identifiers.find((i) => i.isPrimary);

  return {
    id: account.id,
    status: account.status as AccountStatus,
    accountType: account.accountType as AccountType,
    identifierType: (primaryIdentifier?.type ?? 'EMAIL') as IdentifierType,
    identifier: primaryIdentifier?.value ?? '',
    fullName: profile?.fullName,
  };
}

async function getFishermanProfileSafe(
  accountId: string
): Promise<FishermanProfileResponse | null> {
  try {
    return await getFishermanProfile(accountId);
  } catch {
    return null;
  }
}

async function getAccountIdentifiersSafe(accountId: string): Promise<AccountIdentifier[]> {
  try {
    return await getAccountIdentifiers(accountId);
  } catch {
    return [];
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const decoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}
