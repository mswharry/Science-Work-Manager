import { Link } from "react-router-dom";
import { canManageProject } from "../../utils/permissions";
import { formatCurrency, formatDate, formatDateTime, truncateText } from "../../utils/formatters";
import EmptyState from "../common/EmptyState";
import StatusBadge from "../common/StatusBadge";

export default function ProjectList({ projects, currentUser, deletingId, onDelete }) {
  if (!projects.length) {
    return (
      <EmptyState
        title="Chưa có đề tài phù hợp"
        message="Hãy thử thay đổi bộ lọc hoặc tạo hồ sơ đề tài mới nếu bạn có quyền khai báo."
      />
    );
  }

  return (
    <section className="panel stack-md">
      <div className="section-heading">
        <div>
          <h2 className="section-title">Danh sách đề tài</h2>
          <p className="section-description">Các đề tài được hiển thị theo quyền truy cập và bộ lọc hiện tại.</p>
        </div>
      </div>

      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Đề tài</th>
              <th>Trạng thái</th>
              <th>Danh mục</th>
              <th>Kinh phí</th>
              <th>Thời gian</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const canManage = canManageProject(project, currentUser);

              return (
                <tr key={project.id}>
                  <td>
                    <div className="table-primary">{project.name}</div>
                    <div className="table-secondary">Mã hồ sơ: {project.code || `#${project.id}`}</div>
                    <div className="table-secondary">Chủ nhiệm: Người dùng #{project.leader_id}</div>
                    {project.review_note ? (
                      <div className="table-note">Ghi chú duyệt: {truncateText(project.review_note, 88)}</div>
                    ) : null}
                  </td>
                  <td>
                    <StatusBadge value={project.status} />
                  </td>
                  <td>Danh mục #{project.category_id}</td>
                  <td>{formatCurrency(project.budget)}</td>
                  <td>
                    <div>{formatDate(project.start_date)}</div>
                    <div className="table-secondary">đến {formatDate(project.end_date)}</div>
                  </td>
                  <td>{formatDateTime(project.updated_at)}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/projects/${project.id}`} className="button button--secondary button--small nav-button-link">
                        Chi tiết
                      </Link>
                      {canManage ? (
                        <>
                          <Link
                            to={`/projects/${project.id}/edit`}
                            className="button button--ghost button--small nav-button-link"
                          >
                            Chỉnh sửa
                          </Link>
                          <button
                            type="button"
                            className="button button--danger button--small"
                            disabled={deletingId === project.id}
                            onClick={() => onDelete(project.id)}
                          >
                            {deletingId === project.id ? "Đang xóa..." : "Xóa"}
                          </button>
                        </>
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
