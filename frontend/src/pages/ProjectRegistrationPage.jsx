import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import MetricStrip from "../components/common/MetricStrip";
import PageHeader from "../components/common/PageHeader";
import ProjectFilters from "../components/projects/ProjectFilters";
import ProjectRegistrationList from "../components/projects/ProjectRegistrationList";
import { useAuth } from "../contexts/AuthContext";
import { cancelProject, listProjects, submitProject } from "../services/projectService";
import { getApiErrorMessage } from "../utils/apiError";
import { countByStatus } from "../utils/formatters";
import { canCreateProject } from "../utils/permissions";

const DEFAULT_FILTERS = {
  keyword: "",
  status: "",
  year: "",
  mine: false,
};

export default function ProjectRegistrationPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  const loadData = async (activeFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const data = await listProjects(activeFilters);
      setProjects(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải danh sách hồ sơ."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(filters);
  }, [filters]);

  const summary = useMemo(() => countByStatus(projects), [projects]);

  const handleCancel = async (projectId) => {
    const confirmed = window.confirm("Hủy hồ sơ này? Dữ liệu sẽ được giữ lại trong lịch sử.");
    if (!confirmed) {
      return;
    }

    setCancelingId(projectId);
    setError("");

    try {
      await cancelProject(projectId);
      await loadData(filters);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể hủy hồ sơ."));
    } finally {
      setCancelingId(null);
    }
  };

  const handleSubmit = async (projectId) => {
    const confirmed = window.confirm("Nộp hồ sơ này lên hệ thống?");
    if (!confirmed) {
      return;
    }

    setSubmittingId(projectId);
    setError("");

    try {
      await submitProject(projectId);
      await loadData(filters);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể nộp hồ sơ."));
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Hồ sơ đề tài"
        title="Quản lý hồ sơ đăng ký đề tài"
        description="Tra cứu, lọc và quản lý các hồ sơ đề tài mà bạn được phép truy cập. Giảng viên tạo hồ sơ mới trên hệ thống."
        actions={
          <div className="button-row">
            {canCreateProject(user) ? (
              <Link to="/registration-periods" className="button nav-button-link">
                Xem đợt đăng ký / tạo đề tài mới
              </Link>
            ) : null}
          </div>
        }
      />

      <MetricStrip
        items={[
          { label: "Tổng số hồ sơ", value: summary.total || 0, hint: "Tổng số hồ sơ đang hiển thị trên màn hình này." },
          // { label: "Nháp", value: summary.draft || 0, hint: "Hồ sơ chưa nộp lên hệ thống." },
          { label: "Đã nộp", value: summary.submitted || 0, hint: "Hồ sơ đã nộp lên hệ thống." },
          { label: "Đã hủy", value: summary.canceled || 0, hint: "Hồ sơ đã bị hủy bỏ." },
          { label: "Hoàn thành", value: summary.completed || 0, hint: "Hồ sơ đã được đóng và lưu trữ." },
        ]}
        columns={4}
      />

      <ProjectFilters
        filters={draftFilters}
        onChange={(field, value) => setDraftFilters((previous) => ({ ...previous, [field]: value }))}
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draftFilters);
        }}
        onReset={() => {
          setDraftFilters(DEFAULT_FILTERS);
          setFilters(DEFAULT_FILTERS);
        }}
      />

      {loading ? <LoadingState title="Đang tải hồ sơ" message="Hệ thống đang lấy dữ liệu hồ sơ." /> : null}
      {!loading && error ? <ErrorState title="Không thể tải danh sách hồ sơ" message={error} onRetry={() => loadData(filters)} /> : null}
      {!loading && !error ? (
        <ProjectRegistrationList
          projects={projects}
          currentUser={user}
          cancelingId={cancelingId}
          submittingId={submittingId}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
