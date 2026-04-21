import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import ProjectExecutionOverview from "../components/projects/ProjectExecutionOverview";
import ProjectReportBoard from "../components/projects/ProjectReportBoard";
import ProjectTaskBoard from "../components/projects/ProjectTaskBoard";
import { useAuth } from "../contexts/AuthContext";
import {
  createPeriodicReport,
  createProjectTask,
  getExecutionOverview,
  listPeriodicReports,
  listProjectTasks,
  reviewPeriodicReport,
  reviewProjectTask,
  submitPeriodicReport,
  submitProjectTask,
} from "../services/projectExecutionService";
import { deleteProject, getProject, requestProjectCompletion } from "../services/projectService";
import { getApiErrorMessage } from "../utils/apiError";
import { buildAssetUrl } from "../services/uploadService";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatProjectRecordCode,
  resolveProjectCategoryName,
  resolveProjectLeaderName,
} from "../utils/formatters";
import { canManageProject, canRequestProjectCompletion } from "../utils/permissions";

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [executionOverview, setExecutionOverview] = useState(null);
  const [executionTasks, setExecutionTasks] = useState([]);
  const [executionReports, setExecutionReports] = useState([]);
  const [executionLoading, setExecutionLoading] = useState(false);
  const [executionError, setExecutionError] = useState("");
  const [executionActionKey, setExecutionActionKey] = useState("");

  const shouldShowExecution = (projectStatus) => ["approved", "completed"].includes(projectStatus);

  const resetExecutionState = () => {
    setExecutionOverview(null);
    setExecutionTasks([]);
    setExecutionReports([]);
    setExecutionError("");
  };

  const loadExecutionData = async (targetProjectId = projectId) => {
    setExecutionLoading(true);
    setExecutionError("");

    try {
      const [overview, tasks, reports] = await Promise.all([
        getExecutionOverview(targetProjectId),
        listProjectTasks(targetProjectId),
        listPeriodicReports(targetProjectId),
      ]);
      setExecutionOverview(overview);
      setExecutionTasks(tasks);
      setExecutionReports(reports);
    } catch (requestError) {
      setExecutionError(getApiErrorMessage(requestError, "Không thể tải module triển khai đề tài."));
    } finally {
      setExecutionLoading(false);
    }
  };

  const loadProjectData = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getProject(projectId);
      setProject(data);
      if (shouldShowExecution(data.status)) {
        await loadExecutionData(data.id);
      } else {
        resetExecutionState();
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải chi tiết đề tài."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Xóa đề tài này? Thao tác không thể hoàn tác.");
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setActionError("");

    try {
      await deleteProject(projectId);
      navigate("/projects");
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, "Không thể xóa đề tài."));
    } finally {
      setDeleting(false);
    }
  };

  const handleRequestCompletion = async () => {
    const confirmed = window.confirm("Gửi yêu cầu xác nhận hoàn thành đề tài này tới quản trị viên?");
    if (!confirmed) {
      return;
    }

    setRequesting(true);
    setActionError("");

    try {
      const updated = await requestProjectCompletion(projectId);
      setProject(updated);
      if (shouldShowExecution(updated.status)) {
        await loadExecutionData(updated.id);
      }
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, "Không thể gửi yêu cầu hoàn thành đề tài."));
    } finally {
      setRequesting(false);
    }
  };

  const handleCreateTask = async (payload) => {
    setExecutionActionKey("create-task");
    setExecutionError("");
    try {
      await createProjectTask(projectId, payload);
      await loadExecutionData(projectId);
    } catch (requestError) {
      setExecutionError(getApiErrorMessage(requestError, "Không thể tạo task mới."));
    } finally {
      setExecutionActionKey("");
    }
  };

  const handleSubmitTask = async (taskId, payload) => {
    setExecutionActionKey(`submit-task-${taskId}`);
    setExecutionError("");
    try {
      await submitProjectTask(projectId, taskId, payload);
      await loadExecutionData(projectId);
    } catch (requestError) {
      setExecutionError(getApiErrorMessage(requestError, "Không thể nộp task."));
    } finally {
      setExecutionActionKey("");
    }
  };

  const handleReviewTask = async (taskId, payload) => {
    const key = `review-${payload.action}-task-${taskId}`;
    setExecutionActionKey(key);
    setExecutionError("");
    try {
      await reviewProjectTask(projectId, taskId, payload);
      await loadExecutionData(projectId);
    } catch (requestError) {
      setExecutionError(getApiErrorMessage(requestError, "Không thể duyệt task."));
    } finally {
      setExecutionActionKey("");
    }
  };

  const handleCreateReport = async (payload) => {
    setExecutionActionKey("create-report");
    setExecutionError("");
    try {
      await createPeriodicReport(projectId, payload);
      await loadExecutionData(projectId);
    } catch (requestError) {
      setExecutionError(getApiErrorMessage(requestError, "Không thể tạo mốc báo cáo."));
    } finally {
      setExecutionActionKey("");
    }
  };

  const handleSubmitReport = async (reportId, payload) => {
    setExecutionActionKey(`submit-report-${reportId}`);
    setExecutionError("");
    try {
      await submitPeriodicReport(projectId, reportId, payload);
      await loadExecutionData(projectId);
    } catch (requestError) {
      setExecutionError(getApiErrorMessage(requestError, "Không thể nộp báo cáo định kỳ."));
    } finally {
      setExecutionActionKey("");
    }
  };

  const handleReviewReport = async (reportId, payload) => {
    const key = `review-${payload.action}-report-${reportId}`;
    setExecutionActionKey(key);
    setExecutionError("");
    try {
      await reviewPeriodicReport(projectId, reportId, payload);
      await loadExecutionData(projectId);
    } catch (requestError) {
      setExecutionError(getApiErrorMessage(requestError, "Không thể duyệt báo cáo định kỳ."));
    } finally {
      setExecutionActionKey("");
    }
  };

  if (loading) {
    return <LoadingState title="Đang tải đề tài" message="Hệ thống đang lấy thông tin chi tiết đề tài." />;
  }

  if (!project) {
    return <ErrorState title="Không tìm thấy đề tài" message={error || "Hồ sơ đề tài không tồn tại hoặc bạn không có quyền truy cập."} onRetry={loadProjectData} />;
  }

  const canManage = canManageProject(project, user);
  const canRequestCompletion = canRequestProjectCompletion(project, user);

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
            {canRequestCompletion ? (
              <button type="button" className="button" onClick={handleRequestCompletion} disabled={requesting}>
                {requesting ? "Đang gửi..." : "Gửi yêu cầu hoàn thành"}
              </button>
            ) : null}
            {canManage ? (
              <>
                <Link to={`/projects/${project.id}/edit`} className="button nav-button-link">
                  Chỉnh sửa
                </Link>
                <button type="button" className="button button--danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Đang xóa..." : "Xóa đề tài"}
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
          </div>
        </section>

        <section className="panel stack-md">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Phê duyệt và tài liệu</h2>
              <p className="section-description">Thông tin xử lý hồ sơ và các đường dẫn tệp đính kèm nếu có.</p>
            </div>
          </div>

          <div className="key-value-list">
            <div className="key-value-list__item">
              <span className="key-value-list__label">Thời gian duyệt</span>
              <span className="key-value-list__value">{formatDateTime(project.reviewed_at)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Tệp đề cương</span>
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
              <span className="key-value-list__label">Báo cáo cuối kỳ</span>
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
              <span className="key-value-list__label">Tạo lúc</span>
              <span className="key-value-list__value">{formatDateTime(project.created_at)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Cập nhật lúc</span>
              <span className="key-value-list__value">{formatDateTime(project.updated_at)}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Yêu cầu hoàn thành</span>
              <span className="key-value-list__value">
                {project.completion_requested
                  ? `Đã gửi lúc ${formatDateTime(project.completion_requested_at)}`
                  : "Chưa gửi"}
              </span>
            </div>
          </div>

          {project.review_note ? <div className="inline-note">Ghi chú duyệt: {project.review_note}</div> : null}
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

      {shouldShowExecution(project.status) ? (
        <>
          <ProjectExecutionOverview
            overview={executionOverview}
            loading={executionLoading}
            error={executionError}
            onRefresh={() => loadExecutionData(project.id)}
          />

          <ProjectTaskBoard
            project={project}
            currentUser={user}
            tasks={executionTasks}
            loading={executionLoading}
            error={executionError}
            actionKey={executionActionKey}
            onRefresh={() => loadExecutionData(project.id)}
            onCreateTask={handleCreateTask}
            onSubmitTask={handleSubmitTask}
            onReviewTask={handleReviewTask}
          />

          <ProjectReportBoard
            project={project}
            currentUser={user}
            reports={executionReports}
            loading={executionLoading}
            error={executionError}
            actionKey={executionActionKey}
            onRefresh={() => loadExecutionData(project.id)}
            onCreateReport={handleCreateReport}
            onSubmitReport={handleSubmitReport}
            onReviewReport={handleReviewReport}
          />
        </>
      ) : null}

      {project.completion_requested ? (
        <div className="notice notice--info">
          Đề tài đã gửi yêu cầu xác nhận hoàn thành tới quản trị viên. Vui lòng chờ xử lý tại khu vực Quản trị.
        </div>
      ) : null}
    </div>
  );
}
