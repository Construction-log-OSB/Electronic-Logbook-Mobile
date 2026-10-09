/**
 * Form status UX helpers.
 *
 * Single source of truth for what action the user should see on a form row
 * given the backend lifecycle state. Used by both:
 *  - FormStatusRow (Trip Detail / Forms list — primary CTA per row)
 *  - forms/[code].tsx (full form screen — title-level action bar)
 */

import { FORM_STATUS_LABELS, type FormStatus } from '@/src/design-system/form-status';

export interface FormActionDescriptor {
  /** Short label shown next to the status pill ("Tạo biểu mẫu", "Xem", …) */
  label: string;
  /** Accessibility hint for screen readers */
  hint: string;
  /** Whether tapping the row should navigate to the editor (vs. read-only view) */
  openEditor: boolean;
  /** Whether the editor should be readonly (status is locked from client) */
  readOnly: boolean;
}

/**
 * Decide the primary action for a form given its lifecycle status.
 *
 *  - NOT_STARTED: create + open editor
 *  - DRAFT: open editor (continue editing)
 *  - SUBMITTED / UNDER_REVIEW / APPROVED / CANCELLED: read-only view
 *  - REJECTED: open editor in correction mode (backend's REJECTED -> DRAFT
 *    transition happens on submit, but we keep the editor open until then
 *    so the user can fix data before re-submitting).
 */
export function describeFormAction(
  status: FormStatus | string | null | undefined
): FormActionDescriptor {
  const s = (status ?? 'NOT_STARTED') as FormStatus;
  switch (s) {
    case 'NOT_STARTED':
      return {
        label: 'Tạo biểu mẫu',
        hint: 'Tạo và mở biểu mẫu để nhập nội dung',
        openEditor: true,
        readOnly: false,
      };
    case 'DRAFT':
      return {
        label: 'Tiếp tục',
        hint: 'Mở biểu mẫu đang soạn để tiếp tục chỉnh sửa',
        openEditor: true,
        readOnly: false,
      };
    case 'SUBMITTED':
      return {
        label: 'Xem',
        hint: 'Xem nội dung biểu mẫu đã gửi',
        openEditor: false,
        readOnly: true,
      };
    case 'UNDER_REVIEW':
      return {
        label: 'Xem',
        hint: 'Biểu mẫu đang được cơ quan chức năng kiểm tra',
        openEditor: false,
        readOnly: true,
      };
    case 'APPROVED':
      return {
        label: 'Xem',
        hint: 'Biểu mẫu đã được duyệt',
        openEditor: false,
        readOnly: true,
      };
    case 'REJECTED':
      return {
        label: 'Chỉnh sửa và gửi lại',
        hint: 'Biểu mẫu bị từ chối — mở để chỉnh sửa và gửi lại',
        openEditor: true,
        readOnly: false,
      };
    case 'CANCELLED':
      return {
        label: 'Xem',
        hint: 'Biểu mẫu đã bị huỷ',
        openEditor: false,
        readOnly: true,
      };
    default:
      return {
        label: 'Xem',
        hint: 'Xem biểu mẫu',
        openEditor: false,
        readOnly: true,
      };
  }
}

/** Label helper for any FormStatus (forward to centralised map). */
export function formStatusLabel(status: string | null | undefined): string {
  if (!status) return FORM_STATUS_LABELS.NOT_STARTED;
  return FORM_STATUS_LABELS[status as FormStatus] ?? status;
}