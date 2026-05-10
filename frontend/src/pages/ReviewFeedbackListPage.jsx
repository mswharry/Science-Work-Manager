import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import FormField from "../components/common/FormField";
import { listReviewerAssignments } from "../services/approvalService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDate, formatLabel, formatProjectRecordCode } from "../utils/formatters";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "assigned", label: "Đang phản biện" },
  { value: "submitted", label: "Đã nộp" },
  { value: "overdue", label: "Quá hạn" },
];

export default function ReviewFeedbackListPage() {
  const [status, setStatus] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAssignments = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await listReviewerAssignments({ status });
      setAssignments(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải danh sách phản biện."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [status]);

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Phản biện"
        title="Đề tài phản biện của tôi"
        description="Quản lý các đề tài được phân công phản biện và nộp phiếu nhận xét."
        actions={
          <button type="button" className="button button--secondary" onClick={loadAssignments}>
            Làm mới
          </button>
        }
      />

      <section className="panel">
        <div className="form-grid form-grid--2">
          <FormField label="Trạng thái">
            <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </section>

      {loading ? <LoadingState title="Đang tải" message="Đang lấy danh sách phản biện." /> : null}
      {!loading && error ? <ErrorState title="Không thể tải" message={error} onRetry={loadAssignments} /> : null}

      {!loading && !error ? (
        <section className="panel">
          {!assignments.length ? (
            <div className="inline-empty">Chưa có đề tài phản biện.</div>
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Đề tài</th>
                    <th>Hạn nộp</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td>{formatProjectRecordCode({ id: assignment.project_id, code: assignment.project_code })}</td>
                      <td>{assignment.project_name || "—"}</td>
                      <td>{formatDate(assignment.due_date)}</td>
                      <td>{formatLabel(assignment.status)}</td>
                      <td>
                        <Link className="button button--secondary button--small" to={`/review-assignments/${assignment.id}`}>
                          Nhập nhận xét
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
