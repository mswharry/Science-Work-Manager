import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import PageHeader from "../components/common/PageHeader";
import ProjectForm from "../components/projects/ProjectForm";
import { listProjectCategories } from "../services/categoryService";
import { createProject, getProject, updateProject } from "../services/projectService";
import { getApiErrorMessage } from "../utils/apiError";
import { CATEGORY_ACCESS_NOTE } from "../utils/constants";

export default function ProjectFormPage({ mode }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryMode, setCategoryMode] = useState("select");
  const [categoryNote, setCategoryNote] = useState("");
  const [pageLoading, setPageLoading] = useState(mode === "edit");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
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
    setCategoriesLoading(true);

    try {
      const data = await listProjectCategories();
      setCategories(data);
      setCategoryMode(data.length ? "select" : "manual");
      setCategoryNote(
        data.length ? "Chọn danh mục đề tài phù hợp từ danh sách đã được quản trị viên khai báo." : CATEGORY_ACCESS_NOTE,
      );
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
  }, []);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setSubmitError("");

    const { proposal_file, final_report_file, ...basePayload } = payload;
    const attachmentPayload = {
      proposal_file: proposal_file || null,
      final_report_file: final_report_file || null,
    };
    const hasAttachments = Boolean(attachmentPayload.proposal_file || attachmentPayload.final_report_file);

    try {
      let saved;

      if (mode === "edit") {
        saved = await updateProject(projectId, {
          ...basePayload,
          ...attachmentPayload,
        });
      } else {
        saved = await createProject(basePayload);

        if (hasAttachments) {
          saved = await updateProject(saved.id, attachmentPayload);
        }
      }

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
        description="Điền đầy đủ thông tin cần thiết để tạo mới hoặc cập nhật hồ sơ đề tài, bao gồm cả liên kết tệp đính kèm nếu có."
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
