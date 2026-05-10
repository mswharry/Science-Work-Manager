import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import PageHeader from "../components/common/PageHeader";
import FormField from "../components/common/FormField";
import { listApprovalProjects } from "../services/approvalService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDateTime, formatLabel, formatProjectRecordCode } from "../utils/formatters";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "form_check_pending", label: "Chờ kiểm tra hình thức" },
  { value: "form_check_failed", label: "Không đạt hình thức" },
  { value: "assignment_pending", label: "Chờ phân công phản biện" },
  { value: "in_review", label: "Đang phản biện" },
  { value: "council_scheduled", label: "Đã lên lịch hội đồng" },
  { value: "decision_pending", label: "Chờ ra quyết định" },
  { value: "revision_requested", label: "Yêu cầu chỉnh sửa" },
  { value: "revision_submitted", label: "Đã nộp chỉnh sửa" },
  { value: "decided", label: "Đã có quyết định" },
];

const DEFAULT_FILTERS = {
  status: "",
  keyword: "",
  department: "",
  start_date: "",
  end_date: "",
};

export default function ApprovalListPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjects = async (activeFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const data = await listApprovalProjects(activeFilters);
      setProjects(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải danh sách xét duyệt."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects(filters);
  }, [filters]);

  const summary = useMemo(() => projects.length, [projects]);

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Xét duyệt"
        title="Danh sách đề tài xét duyệt"
        description="Theo dõi hồ sơ đề tài, phân công phản biện và ra quyết định theo từng vòng xét duyệt."
        actions={
          <button type="button" className="button button--secondary" onClick={() => loadProjects(filters)}>
            Làm mới
          </button>
        }
      />

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Bộ lọc xét duyệt</h2>
            <p className="section-description">Lọc theo trạng thái, bộ môn và thời gian nộp hồ sơ.</p>
          </div>
        </div>
        <form
          className="filter-grid filter-grid--5"
          onSubmit={(event) => {
            event.preventDefault();
            setFilters(draftFilters);
          }}
        >
          <FormField label="Từ khóa">
            <input
              className="input"
              value={draftFilters.keyword}
              onChange={(event) => setDraftFilters((previous) => ({ ...previous, keyword: event.target.value }))}
              placeholder="Tên hoặc mã đề tài"
            />
          </FormField>
          <FormField label="Bộ môn">
            <input
              className="input"
              value={draftFilters.department}
              onChange={(event) => setDraftFilters((previous) => ({ ...previous, department: event.target.value }))}
              placeholder="Ví dụ: An toàn thông tin"
            />
          </FormField>
          <FormField label="Trạng thái">
            <select
              className="input"
              value={draftFilters.status}
              onChange={(event) => setDraftFilters((previous) => ({ ...previous, status: event.target.value }))}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Từ ngày">
            <input
              className="input"
              type="date"
              value={draftFilters.start_date}
              onChange={(event) => setDraftFilters((previous) => ({ ...previous, start_date: event.target.value }))}
            />
          </FormField>
          <FormField label="Đến ngày">
            <input
              className="input"
              type="date"
              value={draftFilters.end_date}
              onChange={(event) => setDraftFilters((previous) => ({ ...previous, end_date: event.target.value }))}
            />
          </FormField>
          <div className="button-row">
            <button type="button" className="button button--secondary" onClick={() => {
              setDraftFilters(DEFAULT_FILTERS);
              setFilters(DEFAULT_FILTERS);
            }}>
              Đặt lại
            </button>
            <button type="submit" className="button">Áp dụng</button>
          </div>
        </form>
        <p className="muted-text">Tổng hồ sơ: {summary}</p>
      </section>

      {loading ? <LoadingState title="Đang tải" message="Đang lấy danh sách đề tài." /> : null}
      {!loading && error ? <ErrorState title="Không thể tải dữ liệu" message={error} onRetry={() => loadProjects(filters)} /> : null}

      {!loading && !error ? (
        <section className="panel">
          {!projects.length ? (
            <div className="inline-empty">Chưa có đề tài phù hợp bộ lọc.</div>
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Đề tài</th>
                    <th>Chủ nhiệm</th>
                    <th>Bộ môn</th>
                    <th>Trạng thái</th>
                    <th>Thời điểm nộp</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>{formatProjectRecordCode(project)}</td>
                      <td>
                        <div className="table-primary">{project.name}</div>
                        <div className="table-secondary">{project.category_name || "—"}</div>
                      </td>
                      <td>{project.leader_name || "—"}</td>
                      <td>{project.leader_department || "—"}</td>
                      <td>{formatLabel(project.approval_status || project.status)}</td>
                      <td>{formatDateTime(project.submitted_at)}</td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/approvals/${project.id}`} className="button button--secondary button--small">
                            Chi tiết
                          </Link>
                          <Link to={`/approvals/${project.id}/assign`} className="button button--secondary button--small">
                            Phân công
                          </Link>
                          <Link to={`/approvals/${project.id}/decision`} className="button button--secondary button--small">
                            Ra quyết định
                          </Link>
                        </div>
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
