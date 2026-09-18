/**
 * Auth API — functions mapping 1:1 to backend endpoints.
 * Security: password/OTP/token NEVER logged.
 */

import { apiClient, storeTokens, clearTokens } from './client';
import {
  LoginDto,
  LoginResponse,
  RegisterDto,
  RegisterResponse,
  ForgotPasswordDto,
  ForgotPasswordResponse,
  ResetPasswordDto,
} from '@/src/auth/types';

// ─── Auth endpoints ────────────────────────────────────────────────────────

export async function login(dto: LoginDto): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/logbook/auth/login', dto);
  await storeTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

export async function register(dto: RegisterDto): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>('/logbook/auth/register', dto);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/logbook/auth/logout', {});
  } catch {
    // Logout should never fail — always clear local state
  } finally {
    await clearTokens();
  }
}

export async function forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
  const { data } = await apiClient.post<ForgotPasswordResponse>(
    '/logbook/auth/forgot-password',
    dto
  );
  return data;
}

export async function resetPassword(dto: ResetPasswordDto): Promise<void> {
  await apiClient.post('/logbook/auth/reset-password', dto);
}

// ─── Account profile ───────────────────────────────────────────────────────

export interface AccountProfileResponse {
  id: string;
  status: string;
  accountType: string;
  passwordChangedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FishermanProfileResponse {
  id: string;
  accountId: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  profileStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountIdentifier {
  id: string;
  type: string;
  value: string;
  isPrimary: boolean;
  isVerified: boolean;
}

export async function getAccountProfile(accountId: string): Promise<AccountProfileResponse> {
  const { data } = await apiClient.get<AccountProfileResponse>(`/logbook/accounts/${accountId}`);
  return data;
}

export async function getFishermanProfile(accountId: string): Promise<FishermanProfileResponse> {
  const { data } = await apiClient.get<FishermanProfileResponse>(
    `/logbook/fisherman-profiles/${accountId}/profile`
  );
  return data;
}

export async function getAccountIdentifiers(accountId: string): Promise<AccountIdentifier[]> {
  const { data } = await apiClient.get<AccountIdentifier[]>(
    `/logbook/account-identifiers/${accountId}/identifiers`
  );
  return data;
}
