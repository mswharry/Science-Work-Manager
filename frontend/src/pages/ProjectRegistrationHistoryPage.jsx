import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import { getProject, listProjectHistory } from "../services/projectService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDateTime, resolveProjectCategoryName, resolveProjectLeaderName } from "../utils/formatters";

const ACTION_LABELS = {
  create: "Tạo mới",
  update: "Cập nhật",
  submit: "Nộp hồ sơ",
  cancel: "Hủy hồ sơ",
  review: "Duyệt hồ sơ",
  complete: "Hoàn tất",
};

function renderStatus(value) {
  return value ? <StatusBadge value={value} /> : "—";
}

export default function ProjectRegistrationHistoryPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [projectResult, historyResult] = await Promise.allSettled([getProject(projectId), listProjectHistory(projectId)]);

      if (projectResult.status === "fulfilled") {
        setProject(projectResult.value);
      } else {
        throw projectResult.reason;
      }

      if (historyResult.status === "fulfilled") {
        setHistories(historyResult.value);
      } else {
        setError(getApiErrorMessage(historyResult.reason, "Không thể tải lịch sử cập nhật hồ sơ đề tài."));
      }
    } catch (requestError) {
      setProject(null);
      setHistories([]);
      setError(getApiErrorMessage(requestError, "Không thể tải lịch sử cập nhật hồ sơ đề tài."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  if (loading) {
    return <LoadingState title="Đang tải lịch sử" message="Hệ thống đang lấy thông tin lịch sử của hồ sơ đề tài." />;
  }

  if (!project) {
    return <ErrorState title="Không thể mở lịch sử" message={error || "Không tìm thấy dữ liệu lịch sử."} onRetry={loadData} />;
  }

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Hồ sơ đề tài"
        title={`Lịch sử cập nhật: ${project.name}`}
        description="Theo dõi các lần tạo mới, chỉnh sửa, nộp hồ sơ và hủy hồ sơ."
        actions={
          <div className="button-row">
            <Link to={`/projects/${project.id}`} className="button button--secondary nav-button-link">
              Quay lại chi tiết
            </Link>
            <Link to="/projects" className="button button--ghost nav-button-link">
              Danh sách đề tài
            </Link>
          </div>
        }
      />

      <section className="panel stack-md">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Thông tin hồ sơ</h2>
            <p className="section-description">Tóm tắt nhanh về đề tài đang xem lịch sử.</p>
          </div>
          <StatusBadge value={project.status} />
        </div>

        <div className="key-value-list">
          <div className="key-value-list__item">
            <span className="key-value-list__label">Tên đề tài</span>
            <span className="key-value-list__value">{project.name}</span>
          </div>
          <div className="key-value-list__item">
            <span className="key-value-list__label">Danh mục</span>
            <span className="key-value-list__value">{resolveProjectCategoryName(project)}</span>
          </div>
          <div className="key-value-list__item">
            <span className="key-value-list__label">Chủ nhiệm</span>
            <span className="key-value-list__value">{resolveProjectLeaderName(project)}</span>
          </div>
        </div>
      </section>

      {error ? <div className="notice notice--danger">{error}</div> : null}

      {histories.length ? (
        <section className="panel stack-md">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Danh sách lịch sử</h2>
              <p className="section-description">Các sự kiện được ghi lại theo thứ tự mới nhất trước.</p>
            </div>
          </div>

          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Hành động</th>
                  <th>Trạng thái</th>
                  <th>Người thực hiện</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {histories.map((history) => (
                  <tr key={history.id}>
                    <td>{formatDateTime(history.created_at)}</td>
                    <td>{ACTION_LABELS[history.action] || history.action}</td>
                    <td>
                      <div className="stack-xs">
                        {renderStatus(history.previous_status)}
                        <span className="muted-text">→</span>
                        {renderStatus(history.new_status)}
                      </div>
                    </td>
                    <td>{history.performed_by_name || "Hệ thống"}</td>
                    <td>{history.detail || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <EmptyState
          title="Chưa có lịch sử"
          message="Hồ sơ này chưa ghi nhận sự kiện nào ngoài dữ liệu hiện tại."
          action={<Link to={`/projects/${project.id}`} className="button nav-button-link">Xem chi tiết hồ sơ</Link>}
        />
      )}
    </div>
  );
}
