import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import PageHeader from "../components/common/PageHeader";
import ProjectForm from "../components/projects/ProjectForm";
import { useAuth } from "../contexts/AuthContext";
import { listProjectCategories } from "../services/categoryService";
import { createProject, getProject, updateProject } from "../services/projectService";
import { getApiErrorMessage } from "../utils/apiError";
import { CATEGORY_ACCESS_NOTE } from "../utils/constants";

export default function ProjectFormPage({ mode }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [initialValues, setInitialValues] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryMode, setCategoryMode] = useState(isAdmin ? "select" : "manual");
  const [categoryNote, setCategoryNote] = useState("");
  const [pageLoading, setPageLoading] = useState(mode === "edit");
  const [categoriesLoading, setCategoriesLoading] = useState(isAdmin);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadProjectData = async () => {
    if (mode !== "edit") {
      return;
    }

    setPageLoading(true);
    setSubmitError("");

    try {
      const data = await getProject(projectId);
      setInitialValues(data);
    } catch (requestError) {
      setSubmitError(getApiErrorMessage(requestError, "Không thể tải thông tin đề tài."));
    } finally {
      setPageLoading(false);
    }
  };

  const loadCategories = async () => {
    if (!isAdmin) {
      setCategoryMode("manual");
      setCategoryNote(CATEGORY_ACCESS_NOTE);
      setCategoriesLoading(false);
      return;
    }

    setCategoriesLoading(true);

    try {
      const data = await listProjectCategories();
      setCategories(data);
      setCategoryMode("select");
      setCategoryNote("");
    } catch (requestError) {
      setCategoryMode("manual");
      setCategoryNote(getApiErrorMessage(requestError, CATEGORY_ACCESS_NOTE));
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [mode, projectId]);

  useEffect(() => {
    loadCategories();
  }, [isAdmin]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setSubmitError("");

    try {
      const saved = mode === "edit" ? await updateProject(projectId, payload) : await createProject(payload);
      navigate(`/projects/${saved.id}`);
    } catch (requestError) {
      setSubmitError(getApiErrorMessage(requestError, "Không thể lưu đề tài."));
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return <LoadingState title="Đang chuẩn bị biểu mẫu" message="Hệ thống đang tải dữ liệu đề tài cần chỉnh sửa." />;
  }

  if (mode === "edit" && submitError && !initialValues) {
    return <ErrorState title="Không thể mở biểu mẫu đề tài" message={submitError} onRetry={loadProjectData} />;
  }

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Đề tài"
        title={mode === "edit" ? "Chỉnh sửa đề tài" : "Tạo đề tài mới"}
        description="Điền đầy đủ thông tin cần thiết để tạo mới hoặc cập nhật hồ sơ đề tài."
      />
      <ProjectForm
        initialValues={initialValues}
        mode={mode}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoryMode={categoryMode}
        categoryNote={categoryNote}
        onSubmit={handleSubmit}
        onCancel={() => navigate(mode === "edit" ? `/projects/${projectId}` : "/projects")}
        submitting={submitting}
        submitError={submitError}
      />
    </div>
  );
}
