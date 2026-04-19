import { Link } from "react-router-dom";
import { formatDateTime, formatPaperRecordCode, resolvePaperCategoryName, resolvePaperCreatorName, truncateText } from "../../utils/formatters";
import { canManagePaperFromList } from "../../utils/permissions";
import EmptyState from "../common/EmptyState";
import StatusBadge from "../common/StatusBadge";

export default function PaperList({ papers, currentUser, deletingId, onDelete, isMineView }) {
  if (!papers.length) {
    return (
      <EmptyState
        title="Chưa có bài báo phù hợp"
        message="Thử thay đổi bộ lọc hoặc khai báo bài báo mới nếu bạn có quyền thao tác."
      />
    );
  }

  return (
    <section className="panel stack-md">
      <div className="section-heading">
        <div>
          <h2 className="section-title">Danh sách bài báo</h2>
          <p className="section-description">Các bài báo được hiển thị theo quyền truy cập và bộ lọc hiện tại.</p>
        </div>
      </div>

      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bài báo</th>
              <th>Trạng thái</th>
              <th>Danh mục</th>
              <th>Nơi công bố</th>
              <th>Năm</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((paper) => {
              const canManage = canManagePaperFromList(paper, currentUser, isMineView);

              return (
                <tr key={paper.id}>
                  <td>
                    <div className="table-primary">{paper.title}</div>
                    <div className="table-secondary">Mã hồ sơ: {formatPaperRecordCode(paper)}</div>
                    <div className="table-secondary">Người khai báo: {resolvePaperCreatorName(paper)}</div>
                    {paper.review_note ? <div className="table-note">Ghi chú duyệt: {truncateText(paper.review_note, 88)}</div> : null}
                  </td>
                  <td>
                    <StatusBadge value={paper.status} />
                  </td>
                  <td>{resolvePaperCategoryName(paper)}</td>
                  <td>
                    <div>{paper.journal_name || "—"}</div>
                    <div className="table-secondary">{paper.doi ? `DOI: ${paper.doi}` : "Chưa có DOI"}</div>
                  </td>
                  <td>{paper.publication_year || "—"}</td>
                  <td>{formatDateTime(paper.updated_at)}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/papers/${paper.id}`} className="button button--secondary button--small nav-button-link">
                        Chi tiết
                      </Link>
                      {canManage ? (
                        <>
                          <Link to={`/papers/${paper.id}/edit`} className="button button--ghost button--small nav-button-link">
                            Chỉnh sửa
                          </Link>
                          <button
                            type="button"
                            className="button button--danger button--small"
                            disabled={deletingId === paper.id}
                            onClick={() => onDelete(paper.id)}
                          >
                            {deletingId === paper.id ? "Đang xóa..." : "Xóa"}
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
