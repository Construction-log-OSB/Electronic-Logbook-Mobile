/**
 * Regulatory form status (M01/M02/M03) → maritime palette mapping.
 */

import { DARK_COLORS, LIGHT_COLORS, type Palette } from './palette';

export type FormStatus =
  | 'NOT_STARTED'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export const FORM_STATUS_LABELS: Record<FormStatus, string> = {
  NOT_STARTED: 'Chưa tạo',
  DRAFT: 'Bản nháp',
  SUBMITTED: 'Đã gửi',
  UNDER_REVIEW: 'Đang duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Bị từ chối',
  CANCELLED: 'Đã huỷ',
};

export function formStatusColor(
  status: FormStatus,
  palette: Palette
): string {
  switch (status) {
    case 'APPROVED':
      return palette.success;
    case 'REJECTED':
      return palette.danger;
    case 'UNDER_REVIEW':
      return palette.warning;
    case 'SUBMITTED':
      return palette.info;
    case 'DRAFT':
      return palette.textMuted;
    case 'CANCELLED':
      return palette.textMuted;
    case 'NOT_STARTED':
      return palette.borderStrong;
  }
}

export function formStatusSurface(
  status: FormStatus,
  palette: Palette
): string {
  return formStatusColor(status, palette) + '22';
}

export const FORM_STATUS_COLORS_LEGACY: Record<FormStatus, string> = {
  NOT_STARTED: LIGHT_COLORS.borderStrong,
  DRAFT: LIGHT_COLORS.textMuted,
  SUBMITTED: LIGHT_COLORS.info,
  UNDER_REVIEW: LIGHT_COLORS.warning,
  APPROVED: LIGHT_COLORS.success,
  REJECTED: LIGHT_COLORS.danger,
  CANCELLED: LIGHT_COLORS.textMuted,
};

export const FORM_STATUS_COLORS_DARK_LEGACY: Record<FormStatus, string> = {
  NOT_STARTED: DARK_COLORS.borderStrong,
  DRAFT: DARK_COLORS.textMuted,
  SUBMITTED: DARK_COLORS.info,
  UNDER_REVIEW: DARK_COLORS.warning,
  APPROVED: DARK_COLORS.success,
  REJECTED: DARK_COLORS.danger,
  CANCELLED: DARK_COLORS.textMuted,
};
