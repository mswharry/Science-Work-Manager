import { formatLabel } from "../../utils/formatters";

const toneMap = {
  todo: "secondary",
  in_review: "warning",
  done: "success",
  submitted: "info",
  overdue: "danger",
  pending: "warning",
  approved: "success",
  rejected: "danger",
  completed: "info",
  admin: "neutral",
  lecturer: "info",
  student: "secondary",
  all: "neutral",
  active: "success",
  inactive: "danger",
};

export default function StatusBadge({ value, kind = "status" }) {
  if (value === null || value === undefined || value === "") {
    return <span className="badge badge--neutral">Chưa xác định</span>;
  }

  let normalized = value;

  if (kind === "active") {
    normalized = value ? "active" : "inactive";
  }

  const tone = toneMap[String(normalized).toLowerCase()] || "neutral";

  return <span className={`badge badge--${tone}`}>{formatLabel(normalized)}</span>;
}
