import { Link } from "react-router-dom";
import { canManageProject, canRequestProjectCompletion } from "../../utils/permissions";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatProjectRecordCode,
  resolveProjectCategoryName,
  resolveProjectLeaderName,
  truncateText,
} from "../../utils/formatters";
import EmptyState from "../common/EmptyState";
import StatusBadge from "../common/StatusBadge";

export default function ProjectList({ projects, currentUser, deletingId, requestingId, onDelete, onRequestCompletion }) {
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
              const canRequestCompletion = canRequestProjectCompletion(project, currentUser);

              return (
                <tr key={project.id}>
                  <td>
                    <div className="table-primary">{project.name}</div>
                    <div className="table-secondary">Mã hồ sơ: {formatProjectRecordCode(project)}</div>
                    <div className="table-secondary">Chủ nhiệm: {resolveProjectLeaderName(project)}</div>
                    {project.review_note ? (
                      <div className="table-note">Ghi chú duyệt: {truncateText(project.review_note, 88)}</div>
                    ) : null}
                    {project.completion_requested ? (
                      <div className="table-note">Đã gửi yêu cầu xác nhận hoàn thành vào {formatDateTime(project.completion_requested_at)}</div>
                    ) : null}
                  </td>
                  <td>
                    <StatusBadge value={project.status} />
                  </td>
                  <td>{resolveProjectCategoryName(project)}</td>
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
                      {canRequestCompletion ? (
                        <button
                          type="button"
                          className="button button--small"
                          disabled={requestingId === project.id}
                          onClick={() => onRequestCompletion(project.id)}
                        >
                          {requestingId === project.id ? "Đang gửi..." : "Hoàn thành"}
                        </button>
                      ) : null}
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
