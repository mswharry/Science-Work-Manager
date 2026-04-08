import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import MetricStrip from "../components/common/MetricStrip";
import PageHeader from "../components/common/PageHeader";
import ProjectFilters from "../components/projects/ProjectFilters";
import ProjectList from "../components/projects/ProjectList";
import { useAuth } from "../contexts/AuthContext";
import { deleteProject, listProjects } from "../services/projectService";
import { getApiErrorMessage } from "../utils/apiError";
import { ROLES } from "../utils/constants";
import { countByStatus } from "../utils/formatters";

const DEFAULT_FILTERS = {
  keyword: "",
  status: "",
  year: "",
  mine: false,
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const canCreateProject = user?.role === ROLES.ADMIN || user?.role === ROLES.LECTURER;

  const loadData = async (activeFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const data = await listProjects(activeFilters);
      setProjects(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải danh sách đề tài."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(filters);
  }, [filters]);

  const summary = useMemo(() => countByStatus(projects), [projects]);

  const handleDelete = async (projectId) => {
    const confirmed = window.confirm("Xóa đề tài này? Thao tác không thể hoàn tác.");
    if (!confirmed) {
      return;
    }

    setDeletingId(projectId);
    setError("");

    try {
      await deleteProject(projectId);
      await loadData(filters);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể xóa đề tài."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Đề tài"
        title="Quản lý đề tài nghiên cứu"
        description="Tra cứu, lọc và quản lý các đề tài mà bạn được phép truy cập. Các thao tác chỉnh sửa chỉ hiển thị khi đúng quyền và trạng thái hồ sơ."
        actions={
          canCreateProject ? (
            <Link to="/projects/new" className="button nav-button-link">
              Tạo đề tài mới
            </Link>
          ) : null
        }
      />

      {!canCreateProject ? <div className="notice notice--info">Tài khoản sinh viên chỉ được theo dõi đề tài có liên quan và không thể tự tạo đề tài mới.</div> : null}

      <MetricStrip
        items={[
          {
            label: "Tổng số hồ sơ",
            value: summary.total || 0,
            hint: "Tổng số đề tài đang hiển thị trên màn hình này.",
          },
          {
            label: "Chờ duyệt",
            value: summary.pending || 0,
            hint: "Đề tài đang đợi quản trị viên phê duyệt.",
          },
          {
            label: "Đã duyệt",
            value: summary.approved || 0,
            hint: "Đề tài đã qua bước xét duyệt và đang được theo dõi tiếp.",
          },
          {
            label: "Hoàn thành",
            value: summary.completed || 0,
            hint: "Đề tài đã được đánh dấu hoàn tất trong hệ thống.",
          },
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

      {loading ? <LoadingState title="Đang tải đề tài" message="Hệ thống đang lấy dữ liệu đề tài." /> : null}
      {!loading && error ? <ErrorState title="Không thể tải danh sách đề tài" message={error} onRetry={() => loadData(filters)} /> : null}
      {!loading && !error ? (
        <ProjectList projects={projects} currentUser={user} deletingId={deletingId} onDelete={handleDelete} />
      ) : null}
    </div>
  );
}
