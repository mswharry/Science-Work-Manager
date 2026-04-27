import { Link } from "react-router-dom";
import { canCancelProject, canManageProject, canSubmitProject } from "../../utils/permissions";
import {
  formatCurrency,
  formatDateTime,
  formatProjectRecordCode,
  resolveProjectCategoryName,
  resolveProjectLeaderName,
  truncateText,
} from "../../utils/formatters";
import EmptyState from "../common/EmptyState";
import StatusBadge from "../common/StatusBadge";

export default function ProjectRegistrationList({ projects, currentUser, cancelingId, submittingId, onCancel, onSubmit }) {
  if (!projects.length) {
    return (
      <EmptyState
        title="Chưa có hồ sơ phù hợp"
        message="Hãy thử thay đổi bộ lọc hoặc tạo hồ sơ đề tài mới nếu bạn có quyền khai báo."
      />
    );
  }

  return (
    <section className="panel stack-md">
      <div className="section-heading">
        <div>
          <h2 className="section-title">Danh sách hồ sơ</h2>
          <p className="section-description">Các hồ sơ được hiển thị theo quyền truy cập và bộ lọc hiện tại.</p>
        </div>
      </div>

      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Hồ sơ</th>
              <th>Trạng thái</th>
              <th>Danh mục</th>
              <th>Kinh phí</th>
              <th>Thời gian tạo</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const canManage = canManageProject(project, currentUser);
              const canSubmit = canSubmitProject(project, currentUser);
              const canCancel = canCancelProject(project, currentUser);

              return (
                <tr key={project.id}>
                  <td>
                    <div className="table-primary">{project.name}</div>
                    <div className="table-secondary">Mã hồ sơ: {formatProjectRecordCode(project)}</div>
                    <div className="table-secondary">Chủ nhiệm: {resolveProjectLeaderName(project)}</div>
                    {project.registration_period_name ? <div className="table-note">Đợt đăng ký: {project.registration_period_name}</div> : null}
                    {project.review_note ? <div className="table-note">Ghi chú: {truncateText(project.review_note, 88)}</div> : null}
                  </td>
                  <td>
                    <StatusBadge value={project.status} />
                  </td>
                  <td>{resolveProjectCategoryName(project)}</td>
                  <td>{formatCurrency(project.budget)}</td>
                  <td>{formatDateTime(project.created_at)}</td>
                  <td>{formatDateTime(project.updated_at)}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/projects/${project.id}`} className="button button--secondary button--small nav-button-link">
                        Chi tiết
                      </Link>
                      {canSubmit ? (
                        <button
                          type="button"
                          className="button button--small"
                          disabled={submittingId === project.id}
                          onClick={() => onSubmit(project.id)}
                        >
                          {submittingId === project.id ? "Đang nộp..." : "Nộp hồ sơ"}
                        </button>
                      ) : null}
                      {canCancel ? (
                        <button
                          type="button"
                          className="button button--danger button--small"
                          disabled={cancelingId === project.id}
                          onClick={() => onCancel(project.id)}
                        >
                          {cancelingId === project.id ? "Đang hủy..." : "Hủy"}
                        </button>
                      ) : null}
                      {canManage ? (
                        <Link to={`/projects/${project.id}/edit`} className="button button--ghost button--small nav-button-link">
                          Chỉnh sửa
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
