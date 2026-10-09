/**
 * Domain types for the mobile logbook application.
 *
 * These mirror the backend entity / DTO shapes exposed via the Gateway
 * aggregator endpoints. The mobile app should NEVER hit downstream
 * services directly — it only consumes aggregated responses.
 */

// ── Trip status (mirrors FishingTripStatus enum) ─────────────────────
export type TripStatus =
  | 'DRAFT'
  | 'PREPARING'
  | 'DEPARTED'
  | 'FISHING'
  | 'RETURNING'
  | 'COMPLETED'
  | 'CANCELLED';

export const TERMINAL_TRIP_STATUSES: ReadonlyArray<TripStatus> = [
  'COMPLETED',
  'CANCELLED',
];

export const ACTIVE_TRIP_STATUSES: ReadonlyArray<TripStatus> = [
  'DRAFT',
  'PREPARING',
  'DEPARTED',
  'FISHING',
  'RETURNING',
];

export const isActiveTrip = (s: string | null | undefined): boolean =>
  !!s && ACTIVE_TRIP_STATUSES.includes(s as TripStatus);

export const isTerminalTrip = (s: string | null | undefined): boolean =>
  !!s && TERMINAL_TRIP_STATUSES.includes(s as TripStatus);

// ── Trip status transitions ─────────────────────────────────────────
export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  DRAFT: 'Nháp',
  PREPARING: 'Chuẩn bị',
  DEPARTED: 'Đã khởi hành',
  FISHING: 'Đang đánh bắt',
  RETURNING: 'Đang quay về',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export const TRIP_STATUS_COLORS: Record<TripStatus, string> = {
  DRAFT: '#94a3b8', // slate
  PREPARING: '#f59e0b', // amber
  DEPARTED: '#0ea5e9', // sky
  FISHING: '#10b981', // emerald
  RETURNING: '#f97316', // orange
  COMPLETED: '#6366f1', // indigo
  CANCELLED: '#ef4444', // red
};

export const TRIP_STATUS_LABEL_VI = TRIP_STATUS_LABELS;

// Allowed transition (current → next action label + endpoint suffix).
export const TRIP_NEXT_ACTIONS: Record<TripStatus, Array<{
  key: string;
  label: string;
  endpoint: string;
  destructive?: boolean;
  primary?: boolean;
}>> = {
  DRAFT: [
    { key: 'prepare', label: 'Chuẩn bị', endpoint: 'prepare', primary: true },
    { key: 'cancel', label: 'Hủy chuyến', endpoint: 'cancel', destructive: true },
  ],
  PREPARING: [
    { key: 'depart', label: 'Khởi hành', endpoint: 'depart', primary: true },
    { key: 'cancel', label: 'Hủy chuyến', endpoint: 'cancel', destructive: true },
  ],
  DEPARTED: [
    { key: 'start-fishing', label: 'Bắt đầu đánh bắt', endpoint: 'start-fishing', primary: true },
    { key: 'cancel', label: 'Hủy chuyến', endpoint: 'cancel', destructive: true },
  ],
  FISHING: [
    { key: 'start-returning', label: 'Bắt đầu quay về', endpoint: 'start-returning', primary: true },
    { key: 'cancel', label: 'Hủy chuyến', endpoint: 'cancel', destructive: true },
  ],
  RETURNING: [
    { key: 'complete', label: 'Hoàn thành chuyến', endpoint: 'complete', primary: true },
    { key: 'cancel', label: 'Hủy chuyến', endpoint: 'cancel', destructive: true },
  ],
  COMPLETED: [],
  CANCELLED: [],
};

// ── Vessel status ────────────────────────────────────────────────────
export type VesselStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DECOMMISSIONED';

export const VESSEL_STATUS_LABELS: Record<VesselStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Không hoạt động',
  SUSPENDED: 'Tạm ngưng',
  DECOMMISSIONED: 'Ngừng hoạt động',
};

// ── Fishing operation type ──────────────────────────────────────────
export const OPERATION_TYPE_LABELS: Record<string, string> = {
  TRAWL: 'Lưới kéo',
  PURSE_SEINE: 'Lưới quây',
  SURROUNDING_NET: 'Lưới vây',
  HOOK_LINE: 'Câu',
  GILLNET: 'Lưới rê',
  TRAPS_CAGES: 'Lồng/Bẫy',
  LONGLINE: 'Câu dây dài',
  SQUID_JIGGING: 'Câu mực',
  OTHER: 'Khác',
};

// ── Fuel record type ────────────────────────────────────────────────
export const FUEL_TYPE_LABELS: Record<string, string> = {
  BEFORE_DEPARTURE: 'Trước khi rời cảng',
  REFUEL: 'Tiếp nhiên liệu',
  CONSUMPTION: 'Đã sử dụng',
  ARRIVAL: 'Khi cập cảng',
};

// ── Port call type ──────────────────────────────────────────────────
export const PORT_CALL_TYPE_LABELS: Record<string, string> = {
  DEPARTURE: 'Rời cảng',
  ARRIVAL: 'Cập cảng',
  TRANSIT: 'Quá cảnh',
  EMERGENCY: 'Khẩn cấp',
};

// ── Incident type / severity ────────────────────────────────────────
export const INCIDENT_TYPE_LABELS: Record<string, string> = {
  EQUIPMENT_FAILURE: 'Hỏng thiết bị',
  WEATHER: 'Thời tiết xấu',
  COLLISION: 'Va chạm',
  FIRE: 'Hỏa hoạn',
  MEDICAL: 'Y tế',
  PIRACY: 'Cướp biển',
  OTHER: 'Khác',
};

export const INCIDENT_SEVERITY_LABELS: Record<string, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  CRITICAL: 'Nghiêm trọng',
};

export const INCIDENT_SEVERITY_COLORS: Record<string, string> = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

// ── Crew role ───────────────────────────────────────────────────────
export const CREW_ROLE_LABELS: Record<string, string> = {
  CAPTAIN: 'Thuyền trưởng',
  CREW: 'Thuyền viên',
  OBSERVER: 'Quan sát viên',
};

// ── Vessel length category (M01 §6) ─────────────────────────────────
export const VESSEL_LENGTH_CATEGORIES: Array<{ key: string; label: string }> = [
  { key: '<6m', label: 'Dưới 6 mét' },
  { key: '6-12m', label: '6 – 12 mét' },
  { key: '12-15m', label: '12 – 15 mét' },
  { key: '>=15m', label: 'Từ 15 mét trở lên' },
];

// ── M03 equipment matrix (§4.1) ──────────────────────────────────────
export const M03_EQUIPMENT_CATEGORIES: Array<{ key: string; label: string }> = [
  { key: 'navigation', label: 'Trang thiết bị hàng hải' },
  { key: 'safety', label: 'Cứu sinh, cứu hỏa' },
  { key: 'communication', label: 'Thông tin liên lạc, tín hiệu' },
  { key: 'monitoring', label: 'Giám sát hành trình' },
];

// ── M03 documents (§3) ──────────────────────────────────────────────
export const M03_DOCUMENT_CHECKS: Array<{ key: string; label: string }> = [
  { key: 'vesselRegistrationCert', label: 'Giấy chứng nhận đăng ký tàu cá' },
  { key: 'crewManifest', label: 'Sổ danh bạ thuyền viên tàu cá' },
  { key: 'safetyCert', label: 'Giấy chứng nhận an toàn kỹ thuật tàu cá' },
  { key: 'captainCert', label: 'Văn bằng, chứng chỉ thuyền trưởng' },
  { key: 'fishingLicense', label: 'Giấy phép khai thác thủy sản' },
  { key: 'engineerCert', label: 'Văn bằng, chứng chỉ máy trưởng' },
  { key: 'fishingLogbook', label: 'Nhật ký khai thác / thu mua, chuyển tải' },
  { key: 'foodSafetyCert', label: 'Giấy chứng nhận ATTP' },
];

// ── Form codes (M01/M02/M03) ────────────────────────────────────────
export const FORM_CODE_LABELS: Record<string, string> = {
  M01: 'Giấy biên nhận bốc dỡ',
  M02: 'Biên bản kiểm tra cập cảng',
  M03: 'Biên bản kiểm tra rời cảng',
};
