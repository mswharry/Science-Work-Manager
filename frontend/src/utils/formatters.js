import { ROLE_LABELS, STATUS_LABELS, TARGET_ROLE_LABELS } from "./constants";

export function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);
  if (Number.isNaN(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(number);
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const number = Number(value);
  if (Number.isNaN(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("vi-VN").format(number);
}

export function formatLabel(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const normalized = String(value).trim().toLowerCase();

  if (ROLE_LABELS[normalized]) {
    return ROLE_LABELS[normalized];
  }

  if (STATUS_LABELS[normalized]) {
    return STATUS_LABELS[normalized];
  }

  if (TARGET_ROLE_LABELS[normalized]) {
    return TARGET_ROLE_LABELS[normalized];
  }

  return normalized
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function truncateText(text, maxLength = 140) {
  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}…`;
}

export function normalizeOptionalText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

export function normalizeOptionalNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

export function toBooleanQuery(value) {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

export function countByStatus(items = [], key = "status") {
  return items.reduce(
    (accumulator, item) => {
      const status = item?.[key] || "unknown";
      accumulator[status] = (accumulator[status] || 0) + 1;
      accumulator.total = (accumulator.total || 0) + 1;
      return accumulator;
    },
    { total: 0 },
  );
}

export function sortByDateDesc(items = [], key = "updated_at") {
  return [...items].sort((first, second) => {
    const firstDate = new Date(first?.[key] || first?.created_at || 0).getTime();
    const secondDate = new Date(second?.[key] || second?.created_at || 0).getTime();
    return secondDate - firstDate;
  });
}
