import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import PageHeader from "../components/common/PageHeader";
import PaperForm from "../components/papers/PaperForm";
import { useAuth } from "../contexts/AuthContext";
import { listPaperCategories } from "../services/categoryService";
import { listPaperClassificationGroups } from "../services/classificationService";
import { getPublicPaperLevels } from "../services/levelService";
import { createPaper, getPaper, updatePaper } from "../services/paperService";
import { uploadPaperFile } from "../services/uploadService";
import { listLecturers } from "../services/userService";
import { getApiErrorMessage } from "../utils/apiError";
import { CATEGORY_ACCESS_NOTE, ROLES } from "../utils/constants";

export default function PaperFormPage({ mode }) {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [initialValues, setInitialValues] = useState(null);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [classificationGroups, setClassificationGroups] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [categoryMode, setCategoryMode] = useState("select");
  const [categoryNote, setCategoryNote] = useState("");
  const [pageLoading, setPageLoading] = useState(mode === "edit");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [classificationLoading, setClassificationLoading] = useState(true);
  const [lecturersLoading, setLecturersLoading] = useState(user?.role === ROLES.STUDENT);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadPaperData = async () => {
    if (mode !== "edit") return;
    setPageLoading(true);
    setSubmitError("");
    try {
      const data = await getPaper(paperId);
      setInitialValues(data);
    } catch (requestError) {
      setSubmitError(getApiErrorMessage(requestError, "Không thể tải thông tin bài báo."));
    } finally {
      setPageLoading(false);
    }
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await listPaperCategories();
      setCategories(data);
      setCategoryMode(data.length ? "select" : "manual");
      setCategoryNote(data.length ? "Chọn danh mục bài báo phù hợp từ danh sách đã được quản trị viên khai báo." : CATEGORY_ACCESS_NOTE);
    } catch (requestError) {
      setCategoryMode("manual");
      setCategoryNote(getApiErrorMessage(requestError, CATEGORY_ACCESS_NOTE));
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadLecturerOptions = async () => {
    if (user?.role !== ROLES.STUDENT) {
      setLecturers([]);
      setLecturersLoading(false);
      return;
    }

    setLecturersLoading(true);
    try {
      const data = await listLecturers();
      setLecturers(data);
    } catch (requestError) {
      setSubmitError(getApiErrorMessage(requestError, "Không thể tải danh sách giảng viên hướng dẫn."));
    } finally {
      setLecturersLoading(false);
    }
  };

  const loadLevels = async () => {
    setLevelsLoading(true);
    try {
      const data = await getPublicPaperLevels();
      setLevels(data);
    } catch (requestError) {
      setLevels([]);
    } finally {
      setLevelsLoading(false);
    }
  };

  const loadClassificationGroups = async () => {
    setClassificationLoading(true);
    try {
      const data = await listPaperClassificationGroups();
      setClassificationGroups(data);
    } catch (requestError) {
      setClassificationGroups([]);
    } finally {
      setClassificationLoading(false);
    }
  };

  useEffect(() => {
    loadPaperData();
  }, [mode, paperId]);

  useEffect(() => {
    loadCategories();
    loadLevels();
    loadClassificationGroups();
    loadLecturerOptions();
  }, [user?.role]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setSubmitError("");

    const { file_upload, ...basePayload } = payload;

    try {
      let resolvedFileUrl = basePayload.file_url || null;
      if (file_upload) {
        const uploaded = await uploadPaperFile(file_upload);
        resolvedFileUrl = uploaded.file_url;
      }

      let saved;
      if (mode === "edit") {
        saved = await updatePaper(paperId, { ...basePayload, file_url: resolvedFileUrl });
      } else {
        saved = await createPaper({ ...basePayload, file_url: resolvedFileUrl });
      }

      navigate(`/papers/${saved.id}`);
    } catch (requestError) {
      setSubmitError(getApiErrorMessage(requestError, "Không thể lưu bài báo."));
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) return <LoadingState title="Đang chuẩn bị biểu mẫu" message="Hệ thống đang tải dữ liệu bài báo cần chỉnh sửa." />;
  if (mode === "edit" && submitError && !initialValues) {
    return <ErrorState title="Không thể mở biểu mẫu bài báo" message={submitError} onRetry={loadPaperData} />;
  }

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Bài báo"
        title={mode === "edit" ? "Chỉnh sửa bài báo" : "Khai báo bài báo mới"}
        description="Điền đầy đủ thông tin để khai báo hoặc cập nhật hồ sơ bài báo khoa học. Sinh viên bắt buộc phải chọn giảng viên hướng dẫn khi tạo hồ sơ."
      />
      <PaperForm
        initialValues={initialValues}
        mode={mode}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoryMode={categoryMode}
        categoryNote={categoryNote}
        levels={levels}
        levelsLoading={levelsLoading}
        classificationGroups={classificationGroups}
        classificationLoading={classificationLoading}
        currentUser={user}
        lecturers={lecturers}
        lecturersLoading={lecturersLoading}
        onSubmit={handleSubmit}
        onCancel={() => navigate(mode === "edit" ? `/papers/${paperId}` : "/papers")}
        submitting={submitting}
        submitError={submitError}
      />
    </div>
  );
}
