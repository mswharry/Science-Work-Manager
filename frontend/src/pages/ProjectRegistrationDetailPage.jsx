import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import { listApprovalDecisions } from "../services/approvalService";
import { cancelProject, getProject, submitProject } from "../services/projectService";
import { getApiErrorMessage } from "../utils/apiError";
import { buildAssetUrl } from "../services/uploadService";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatProjectRecordCode,
  formatLabel,
  resolveProjectCategoryName,
  resolveProjectLeaderName,
} from "../utils/formatters";
import { canCancelProject, canManageProject, canSubmitProject } from "../utils/permissions";

export default function ProjectRegistrationDetailPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [canceling, setCanceling] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadProjectData = async () => {
    setLoading(true);
    setError("");

    try {
      const [projectResult, decisionResult] = await Promise.allSettled([
        getProject(projectId),
        listApprovalDecisions(projectId),
      ]);
      if (projectResult.status === "rejected") {
        throw projectResult.reason;
      }
      setProject(projectResult.value);
      setDecisions(decisionResult.status === "fulfilled" ? decisionResult.value : []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải chi tiết hồ sơ."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const handleCancel = async () => {
    const confirmed = window.confirm("Hủy hồ sơ này? Thao tác này sẽ giữ lịch sử.");
    if (!confirmed) return;

    setCanceling(true);
    setActionError("");

    try {
      const updated = await cancelProject(projectId);
      setProject(updated);
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, "Không thể hủy hồ sơ."));
    } finally {
      setCanceling(false);
    }
  };

  const handleSubmit = async () => {
    const confirmed = window.confirm("Nộp hồ sơ này lên hệ thống?");
    if (!confirmed) return;

    setSubmitting(true);
    setActionError("");

    try {
      const updated = await submitProject(projectId);
      setProject(updated);
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, "Không thể nộp hồ sơ."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState title="Đang tải hồ sơ" message="Hệ thống đang lấy thông tin chi tiết hồ sơ đề tài." />;
  }

  if (!project) {
    return <ErrorState title="Không tìm thấy hồ sơ" message={error || "Hồ sơ đề tài không tồn tại hoặc bạn không có quyền truy cập."} onRetry={loadProjectData} />;
  }

  const canManage = canManageProject(project, user);
  const canSubmit = canSubmitProject(project, user);
  const canCancel = canCancelProject(project, user);

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Hồ sơ đề tài"
        title={project.name}
        description="Thông tin chi tiết hồ sơ đề tài và trạng thái xử lý hiện tại."
        actions={
          <div className="button-row">
            <Link to="/projects" className="button button--secondary nav-button-link">
              Quay lại danh sách
            </Link>
            <Link to={`/projects/${project.id}/history`} className="button button--ghost nav-button-link">
              Lịch sử cập nhật
            </Link>
            {canSubmit ? (
              <button type="button" className="button" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Đang nộp..." : "Nộp hồ sơ"}
              </button>
            ) : null}
            {canCancel ? (
              <button type="button" className="button button--danger" onClick={handleCancel} disabled={canceling}>
                {canceling ? "Đang hủy..." : "Hủy hồ sơ"}
              </button>
            ) : null}
            {canManage ? (
              <Link to={`/projects/${project.id}/edit`} className="button nav-button-link">
                Chỉnh sửa
              </Link>
            ) : null}
          </div>
        }
      />

      {actionError ? <div className="notice notice--danger">{actionError}</div> : null}

      <div className="grid grid--2">
        <section className="panel stack-md">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Thông tin chung</h2>
              <p className="section-description">Thông tin cốt lõi của hồ sơ đề tài đang được lưu trên hệ thống.</p>
            </div>
            <StatusBadge value={project.status} />
          </div>

          <div className="key-value-list">
            <div className="key-value-list__item">
              <span className="key-value-list__label">Mã hồ sơ</span>
              <span className="key-value-list__value">{formatProjectRecordCode(project)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Đợt đăng ký</span>
              <span className="key-value-list__value">{project.registration_period_name || "—"}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Danh mục</span>
              <span className="key-value-list__value">{resolveProjectCategoryName(project)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Chủ nhiệm</span>
              <span className="key-value-list__value">{resolveProjectLeaderName(project)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Kinh phí</span>
              <span className="key-value-list__value">{formatCurrency(project.budget)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Ngày bắt đầu</span>
              <span className="key-value-list__value">{formatDate(project.start_date)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Ngày kết thúc</span>
              <span className="key-value-list__value">{formatDate(project.end_date)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Ngày tạo</span>
              <span className="key-value-list__value">{formatDateTime(project.created_at)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Cập nhật cuối</span>
              <span className="key-value-list__value">{formatDateTime(project.updated_at)}</span>
            </div>
          </div>
        </section>

        <section className="panel stack-md">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Tài liệu và trạng thái</h2>
              <p className="section-description">Tài liệu đính kèm và trạng thái nộp hồ sơ hiện tại.</p>
            </div>
          </div>

          <div className="key-value-list">
            <div className="key-value-list__item">
              <span className="key-value-list__label">Tài liệu đề cương</span>
              <span className="key-value-list__value">
                {project.proposal_file ? (
                  <a href={buildAssetUrl(project.proposal_file)} target="_blank" rel="noreferrer" className="button button--secondary button--small nav-button-link">
                    Mở tệp
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Báo cáo cuối cùng</span>
              <span className="key-value-list__value">
                {project.final_report_file ? (
                  <a href={buildAssetUrl(project.final_report_file)} target="_blank" rel="noreferrer" className="button button--secondary button--small nav-button-link">
                    Mở tệp
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Đã nộp lúc</span>
              <span className="key-value-list__value">{formatDateTime(project.submitted_at)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Đã hủy lúc</span>
              <span className="key-value-list__value">{formatDateTime(project.canceled_at)}</span>
            </div>
          </div>
        </section>
      </div>

      <section className="panel stack-md">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Mô tả đề tài</h2>
            <p className="section-description">Phần mô tả được khai báo bởi người tạo hồ sơ.</p>
          </div>
        </div>
        <p className="section-description">{project.description || "Chưa có mô tả chi tiết cho đề tài này."}</p>
      </section>

      {project.approval_status ? (
        <section className="panel stack-md">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Kết quả xét duyệt</h2>
              <p className="section-description">Theo dõi trạng thái xét duyệt và nộp bản chỉnh sửa nếu được yêu cầu.</p>
            </div>
          </div>
          <div className="key-value-list">
            <div className="key-value-list__item">
              <span className="key-value-list__label">Trạng thái xét duyệt</span>
              <span className="key-value-list__value">{formatLabel(project.approval_status)}</span>
            </div>
            {decisions[0] ? (
              <>
                <div className="key-value-list__item">
                  <span className="key-value-list__label">Kết luận</span>
                  <span className="key-value-list__value">{formatLabel(decisions[0].decision_type)}</span>
                </div>
                <div className="key-value-list__item">
                  <span className="key-value-list__label">Kinh phí duyệt</span>
                  <span className="key-value-list__value">{formatCurrency(decisions[0].approved_budget)}</span>
                </div>
                <div className="key-value-list__item">
                  <span className="key-value-list__label">Ghi chú quyết định</span>
                  <span className="key-value-list__value">{decisions[0].note || decisions[0].conditions || "—"}</span>
                </div>
              </>
            ) : null}
          </div>
          <div className="button-row">
            <Link to={`/projects/${project.id}/approval-history`} className="button button--secondary">
              Lịch sử xét duyệt
            </Link>
          </div>
          {project.approval_status === "revision_requested" && project.approval_round_id ? (
            <div className="button-row">
              <Link to={`/revisions/${project.approval_round_id}`} className="button">
                Nộp bản chỉnh sửa
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
