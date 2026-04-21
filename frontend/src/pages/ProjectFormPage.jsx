import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import PageHeader from "../components/common/PageHeader";
import ProjectForm from "../components/projects/ProjectForm";
import { listProjectCategories } from "../services/categoryService";
import { getPublicProjectLevels } from "../services/levelService";
import { createProject, getProject, updateProject } from "../services/projectService";
import { uploadProjectFinalReport, uploadProjectProposal } from "../services/uploadService";
import { getApiErrorMessage } from "../utils/apiError";
import { CATEGORY_ACCESS_NOTE } from "../utils/constants";

export default function ProjectFormPage({ mode }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [categoryMode, setCategoryMode] = useState("select");
  const [categoryNote, setCategoryNote] = useState("");
  const [pageLoading, setPageLoading] = useState(mode === "edit");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadProjectData = async () => {
    if (mode !== "edit") return;
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
      setCategoryNote(data.length ? "Chọn danh mục đề tài phù hợp từ danh sách đã được quản trị viên khai báo." : CATEGORY_ACCESS_NOTE);
    } catch (requestError) {
      setCategoryMode("manual");
      setCategoryNote(getApiErrorMessage(requestError, CATEGORY_ACCESS_NOTE));
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadLevels = async () => {
    setLevelsLoading(true);
    try {
      const data = await getPublicProjectLevels();
      setLevels(data);
    } catch (requestError) {
      setLevels([]);
    } finally {
      setLevelsLoading(false);
    }
  };

  useEffect(() => { loadProjectData(); }, [mode, projectId]);
  useEffect(() => { loadCategories(); loadLevels(); }, []);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setSubmitError("");

    const { proposal_upload, final_report_upload, ...basePayload } = payload;

    try {
      let proposalFile = basePayload.proposal_file || null;
      let finalReportFile = basePayload.final_report_file || null;

      if (proposal_upload) {
        const uploaded = await uploadProjectProposal(proposal_upload);
        proposalFile = uploaded.file_url;
      }
      if (final_report_upload) {
        const uploaded = await uploadProjectFinalReport(final_report_upload);
        finalReportFile = uploaded.file_url;
      }

      let saved;
      if (mode === "edit") {
        saved = await updateProject(projectId, { ...basePayload, proposal_file: proposalFile, final_report_file: finalReportFile });
      } else {
        saved = await createProject({ ...basePayload, proposal_file: proposalFile, final_report_file: finalReportFile });
      }

      navigate(`/projects/${saved.id}`);
    } catch (requestError) {
      setSubmitError(getApiErrorMessage(requestError, "Không thể lưu đề tài."));
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) return <LoadingState title="Đang chuẩn bị biểu mẫu" message="Hệ thống đang tải dữ liệu đề tài cần chỉnh sửa." />;
  if (mode === "edit" && submitError && !initialValues) return <ErrorState title="Không thể mở biểu mẫu đề tài" message={submitError} onRetry={loadProjectData} />;

  return (
    <div className="stack-xl">
      <PageHeader eyebrow="Đề tài" title={mode === "edit" ? "Chỉnh sửa đề tài" : "Khai báo đề tài mới"} description="Điền đầy đủ thông tin để khai báo hoặc cập nhật hồ sơ đề tài nghiên cứu, bao gồm cả tệp đính kèm trực tiếp nếu có." />
      <ProjectForm
        initialValues={initialValues}
        mode={mode}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoryMode={categoryMode}
        categoryNote={categoryNote}
        levels={levels}
        levelsLoading={levelsLoading}
        onSubmit={handleSubmit}
        onCancel={() => navigate(mode === "edit" ? `/projects/${projectId}` : "/projects")}
        submitting={submitting}
        submitError={submitError}
      />
    </div>
  );
}
