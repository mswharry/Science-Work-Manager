export const APP_NAME = "Science Work Manager";
export const APP_SHORT_NAME = "SWM";
export const APP_DESCRIPTION = "Hệ thống quản lý nghiên cứu khoa học";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";
export const STORAGE_TOKEN_KEY = "swm_access_token";

export const ROLES = {
  ADMIN: "admin",
  LECTURER: "lecturer",
  STUDENT: "student",
};

export const ROLE_OPTIONS = [
  { value: ROLES.STUDENT, label: "Sinh viên" },
  { value: ROLES.LECTURER, label: "Giảng viên" },
  { value: ROLES.ADMIN, label: "Quản trị viên" },
];

export const PROJECT_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "draft", label: "Nháp" },
  { value: "submitted", label: "Đã nộp" },
  { value: "canceled", label: "Đã hủy" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
  { value: "completed", label: "Hoàn thành" },
];

export const PAPER_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

export const PLAN_STATUS_OPTIONS = [
  { value: "draft", label: "Bản nháp" },
  { value: "active", label: "Đang áp dụng" },
  { value: "closed", label: "Đã đóng" },
];

export const TARGET_ROLE_OPTIONS = [
  { value: "all", label: "Toàn bộ người dùng" },
  { value: ROLES.LECTURER, label: "Giảng viên" },
  { value: ROLES.STUDENT, label: "Sinh viên" },
];

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Quản trị viên",
  [ROLES.LECTURER]: "Giảng viên",
  [ROLES.STUDENT]: "Sinh viên",
};

export const STATUS_LABELS = {
  draft: "Nháp",
  submitted: "Đã nộp",
  canceled: "Đã hủy",
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  completed: "Hoàn thành",
  draft: "Bản nháp",
  active: "Đang áp dụng",
  closed: "Đã đóng",
  all: "Toàn bộ người dùng",
  inactive: "Đã khóa",
  true: "Có",
  false: "Không",
};

export const PLAN_STATUS_LABELS = {
  draft: "Bản nháp",
  active: "Đang áp dụng",
  closed: "Đã đóng",
};

export const TARGET_ROLE_LABELS = {
  all: "Toàn bộ người dùng",
  [ROLES.LECTURER]: "Giảng viên",
  [ROLES.STUDENT]: "Sinh viên",
};

export const CATEGORY_ACCESS_NOTE =
  "Hệ thống chưa tải được danh mục. Bạn có thể thử tải lại trang hoặc liên hệ quản trị viên để kiểm tra danh mục hợp lệ.";
