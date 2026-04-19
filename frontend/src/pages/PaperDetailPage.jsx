import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AddAuthorForm from "../components/papers/AddAuthorForm";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import { addPaperAuthor, deletePaper, getPaper } from "../services/paperService";
import { getApiErrorMessage } from "../utils/apiError";
import { buildAssetUrl } from "../services/uploadService";
import { formatDateTime, formatPaperRecordCode, resolveIdentityCode, resolvePaperCategoryName, resolvePaperCreatorName } from "../utils/formatters";
import { canManagePaperFromDetail } from "../utils/permissions";

function resolveDoiLink(doi) {
  if (!doi) {
    return null;
  }

  if (doi.startsWith("http://") || doi.startsWith("https://")) {
    return doi;
  }

  return `https://doi.org/${doi}`;
}

export default function PaperDetailPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [authorSubmitting, setAuthorSubmitting] = useState(false);
  const [authorError, setAuthorError] = useState("");
  const [authorSuccess, setAuthorSuccess] = useState("");

  const loadPaperData = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPaper(paperId);
      setPaper(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải chi tiết bài báo."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaperData();
  }, [paperId]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Xóa bài báo này? Thao tác không thể hoàn tác.");
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setActionError("");

    try {
      await deletePaper(paperId);
      navigate("/papers");
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, "Không thể xóa bài báo."));
    } finally {
      setDeleting(false);
    }
  };

  const handleAddAuthor = async (payload) => {
    setAuthorSubmitting(true);
    setAuthorError("");
    setAuthorSuccess("");

    try {
      await addPaperAuthor(paperId, payload);
      setAuthorSuccess("Đã thêm đồng tác giả vào hồ sơ bài báo.");
      return true;
    } catch (requestError) {
      setAuthorError(getApiErrorMessage(requestError, "Không thể thêm đồng tác giả."));
      return false;
    } finally {
      setAuthorSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState title="Đang tải bài báo" message="Hệ thống đang lấy thông tin chi tiết bài báo." />;
  }

  if (!paper) {
    return <ErrorState title="Không tìm thấy bài báo" message={error || "Hồ sơ bài báo không tồn tại hoặc bạn không có quyền truy cập."} onRetry={loadPaperData} />;
  }

  const canManage = canManagePaperFromDetail(paper, user);
  const canAddAuthor = Boolean(user && (isAdmin || paper.status !== "approved"));
  const doiLink = resolveDoiLink(paper.doi);

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Hồ sơ bài báo"
        title={paper.title}
        description="Thông tin chi tiết bài báo, trạng thái duyệt và các thông tin xuất bản hiện có."
        actions={
          <div className="button-row">
            <Link to="/papers" className="button button--secondary nav-button-link">
              Quay lại danh sách
            </Link>
            {canManage ? (
              <>
                <Link to={`/papers/${paper.id}/edit`} className="button nav-button-link">
                  Chỉnh sửa
                </Link>
                <button type="button" className="button button--danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Đang xóa..." : "Xóa bài báo"}
                </button>
              </>
            ) : null}
          </div>
        }
      />

      {actionError ? <div className="notice notice--danger">{actionError}</div> : null}

      <div className="grid grid--2">
        <section className="panel stack-md">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Thông tin công bố</h2>
              <p className="section-description">Thông tin xuất bản chính của bài báo đang lưu trên hệ thống.</p>
            </div>
            <StatusBadge value={paper.status} />
          </div>

          <div className="key-value-list">
            <div className="key-value-list__item">
              <span className="key-value-list__label">Mã hồ sơ</span>
              <span className="key-value-list__value">{formatPaperRecordCode(paper)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Danh mục</span>
              <span className="key-value-list__value">{resolvePaperCategoryName(paper)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Người khai báo</span>
              <span className="key-value-list__value">{resolvePaperCreatorName(paper)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Mã người khai báo</span>
              <span className="key-value-list__value">{resolveIdentityCode(paper.creator_staff_id, paper.creator_student_id)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Tạp chí / hội nghị</span>
              <span className="key-value-list__value">{paper.journal_name || "—"}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Năm công bố</span>
              <span className="key-value-list__value">{paper.publication_year || "—"}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Tập</span>
              <span className="key-value-list__value">{paper.volume || "—"}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Số</span>
              <span className="key-value-list__value">{paper.issue || "—"}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Trang</span>
              <span className="key-value-list__value">{paper.pages || "—"}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">DOI</span>
              <span className="key-value-list__value">
                {doiLink ? (
                  <a href={doiLink} target="_blank" rel="noreferrer" className="button button--secondary button--small nav-button-link">
                    Mở DOI
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Tệp đính kèm</span>
              <span className="key-value-list__value">
                {paper.file_url ? (
                  <a href={buildAssetUrl(paper.file_url)} target="_blank" rel="noreferrer" className="button button--secondary button--small nav-button-link">
                    Mở tệp
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>
          </div>
        </section>

        <section className="panel stack-md">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Thông tin xử lý hồ sơ</h2>
              <p className="section-description">Thông tin hướng dẫn và thời gian cập nhật của bài báo.</p>
            </div>
          </div>

          <div className="key-value-list">
            <div className="key-value-list__item">
              <span className="key-value-list__label">Giảng viên hướng dẫn</span>
              <span className="key-value-list__value">{paper.supervisor_full_name || "—"}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Mã cán bộ giảng viên</span>
              <span className="key-value-list__value">{paper.supervisor_staff_id || "—"}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Email giảng viên</span>
              <span className="key-value-list__value">{paper.supervisor_email || "—"}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Đơn vị công tác</span>
              <span className="key-value-list__value">{paper.supervisor_department || "—"}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Thời gian duyệt</span>
              <span className="key-value-list__value">{formatDateTime(paper.reviewed_at)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Tạo lúc</span>
              <span className="key-value-list__value">{formatDateTime(paper.created_at)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Cập nhật lúc</span>
              <span className="key-value-list__value">{formatDateTime(paper.updated_at)}</span>
            </div>
          </div>

          {paper.review_note ? <div className="inline-note">Ghi chú duyệt: {paper.review_note}</div> : null}
        </section>
      </div>

      {canAddAuthor ? <AddAuthorForm onSubmit={handleAddAuthor} submitting={authorSubmitting} error={authorError} success={authorSuccess} /> : null}

      {isAdmin && paper.status === "pending" ? (
        <div className="notice notice--info">
          Bài báo đang chờ duyệt. Vui lòng vào khu vực Quản trị để thực hiện phê duyệt hoặc từ chối hồ sơ này.
        </div>
      ) : null}
    </div>
  );
}
