/**
 * Friendly Vietnamese error messages — map backend / network errors to
 * short, actionable phrases the user can act on.
 *
 * Order of resolution:
 *  1. Hard-coded business messages (conflict / validation) when matched.
 *  2. HTTP status code fallback.
 *  3. Original backend message (if Vietnamese-looking).
 *  4. Generic fallback.
 */

const KNOWN_BUSINESS_MESSAGES: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /tàu đang thuộc một chuyến biển khác/i,
    message: 'Tàu đang thuộc một chuyến biển khác. Không thể tạo chuyến biển mới cho đến khi chuyến hiện tại kết thúc hoặc bị hủy.',
  },
  {
    pattern: /thuyền viên.*đang thuộc một chuyến biển khác/i,
    message: 'Thuyền viên đang thuộc một chuyến biển khác. Không thể thêm vào chuyến biển hiện tại.',
  },
  {
    pattern: /user.*already a crew/i,
    message: 'Thuyền viên này đã có trong chuyến biển.',
  },
  {
    pattern: /invalid fishing trip status transition/i,
    message: 'Không thể chuyển trạng thái chuyến biển theo hướng này.',
  },
  {
    pattern: /cannot create a fishing trip for a decommissioned/i,
    message: 'Tàu đã ngừng hoạt động, không thể tạo chuyến biển.',
  },
  {
    pattern: /decommissioned vessel/i,
    message: 'Tàu đã ngừng hoạt động, không thể tạo chuyến biển.',
  },
  {
    pattern: /you do not have access to this vessel/i,
    message: 'Bạn không có quyền truy cập tàu này.',
  },
  {
    pattern: /fisherman with code.*not found/i,
    message: 'Không tìm thấy thuyền viên với mã đã nhập.',
  },
  {
    pattern: /fisherman with code.*inactive/i,
    message: 'Thuyền viên này hiện không hoạt động.',
  },
];

export function friendlyApiError(message: string | undefined | null): string {
  if (!message) return 'Đã xảy ra lỗi. Vui lòng thử lại.';
  for (const { pattern, message: friendly } of KNOWN_BUSINESS_MESSAGES) {
    if (pattern.test(message)) return friendly;
  }
  return message;
}

export function friendlyStatusError(status: number | undefined | null): string | null {
  if (!status) return null;
  if (status === 400) return 'Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.';
  if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
  if (status === 404) return 'Không tìm thấy dữ liệu.';
  if (status === 409) return 'Dữ liệu đã thay đổi trên hệ thống.';
  if (status === 422) return 'Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.';
  if (status >= 500) return 'Hệ thống đang bận. Vui lòng thử lại sau.';
  return null;
}
