/**
 * Auth types — mirroring backend DTOs from gateway logbook-identity-api.
 * DO NOT add fields not present in backend contract.
 */

export enum IdentifierType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}

export enum AccountStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  SUSPENDED = 'SUSPENDED',
  DISABLED = 'DISABLED',
}

export enum AccountType {
  FISHERMAN = 'FISHERMAN',
  CAPTAIN = 'CAPTAIN',
  OWNER = 'OWNER',
}

export enum ProfileStatus {
  INCOMPLETE = 'INCOMPLETE',
  COMPLETE = 'COMPLETE',
}

// ─── Login ───────────────────────────────────────────────────────────────

export interface LoginDto {
  identifierType: IdentifierType;
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

// ─── Register ────────────────────────────────────────────────────────────

export interface RegisterDto {
  identifierType: IdentifierType;
  identifier: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  placeOfBirth?: string;
  identityDocumentNumber?: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
}

export interface RegisterResponse {
  account: {
    id: string;
    status: AccountStatus;
    accountType: AccountType;
  };
  identifier: {
    type: IdentifierType;
    value: string;
    isPrimary: boolean;
    isVerified: boolean;
  };
  profile: {
    fullName: string;
    profileStatus: ProfileStatus;
  };
}

// ─── Forgot Password ──────────────────────────────────────────────────────

export interface ForgotPasswordDto {
  identifierType: IdentifierType;
  identifier: string;
}

export interface ForgotPasswordResponse {
  message: string;
  expiresIn: number; // minutes
}

// ─── Reset Password ───────────────────────────────────────────────────────

export interface ResetPasswordDto {
  identifierType: IdentifierType;
  identifier: string;
  otp: string;
  newPassword: string;
}

// ─── Refresh Token ────────────────────────────────────────────────────────

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ─── Auth State ───────────────────────────────────────────────────────────

export type AuthStatus =
  | 'initializing'
  | 'unauthenticated'
  | 'authenticating'
  | 'submitting'
  | 'authenticated'
  | 'logging_out'
  | 'error';

export interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  account: AccountInfo | null;
  error: string | null;
}

export interface AccountInfo {
  id: string;
  status: AccountStatus;
  accountType: AccountType;
  identifierType: IdentifierType;
  identifier: string;
  fullName?: string;
}

// ─── API Error ────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface NetworkError {
  code: string;
  message: string;
}

// ─── Forgot Password Flow State ──────────────────────────────────────────

export type ForgotPasswordStatus =
  'idle' | 'sending' | 'otp_sent' | 'resetting' | 'success' | 'error';
