import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import PageHeader from "../components/common/PageHeader";
import PaperForm from "../components/papers/PaperForm";
import { useAuth } from "../contexts/AuthContext";
import { listPaperCategories } from "../services/categoryService";
import { createPaper, getPaper, updatePaper } from "../services/paperService";
import { uploadPaperFile } from "../services/uploadService";
import { listLecturers } from "../services/userService";
import { getApiErrorMessage } from "../utils/apiError";
import { CATEGORY_ACCESS_NOTE, ROLES } from "../utils/constants";

export default function PaperFormPage({ mode }) {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStudent = user?.role === ROLES.STUDENT;
  const [initialValues, setInitialValues] = useState(null);
  const [categories, setCategories] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [categoryMode, setCategoryMode] = useState("select");
  const [categoryNote, setCategoryNote] = useState("");
  const [lecturerNote, setLecturerNote] = useState("Chọn giảng viên hướng dẫn phù hợp từ danh sách hiện có.");
  const [pageLoading, setPageLoading] = useState(mode === "edit");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [lecturersLoading, setLecturersLoading] = useState(isStudent);
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

  const loadLecturers = async () => {
    if (!isStudent) {
      setLecturers([]);
      setLecturersLoading(false);
      return;
    }

    setLecturersLoading(true);
    try {
      const data = await listLecturers();
      setLecturers(data);
      setLecturerNote(
        data.length
          ? "Chỉ hiển thị các giảng viên đã được phê duyệt và đang hoạt động trong hệ thống."
          : "Hiện chưa có giảng viên khả dụng để gán hướng dẫn. Vui lòng liên hệ quản trị viên.",
      );
    } catch (requestError) {
      setLecturers([]);
      setLecturerNote(getApiErrorMessage(requestError, "Không thể tải danh sách giảng viên hướng dẫn."));
    } finally {
      setLecturersLoading(false);
    }
  };

  useEffect(() => { loadPaperData(); }, [mode, paperId]);
  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadLecturers(); }, [isStudent]);

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
        description={
          isStudent
            ? "Sinh viên khai báo bài báo cần chọn đầy đủ giảng viên hướng dẫn, thông tin xuất bản và tệp đính kèm tương ứng."
            : "Điền đầy đủ thông tin để khai báo hoặc cập nhật hồ sơ bài báo khoa học, bao gồm cả tệp đính kèm trực tiếp nếu có."
        }
      />
      <PaperForm
        initialValues={initialValues}
        mode={mode}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoryMode={categoryMode}
        categoryNote={categoryNote}
        requireSupervisor={isStudent}
        lecturers={lecturers}
        lecturersLoading={lecturersLoading}
        lecturerNote={lecturerNote}
        onSubmit={handleSubmit}
        onCancel={() => navigate(mode === "edit" ? `/papers/${paperId}` : "/papers")}
        submitting={submitting}
        submitError={submitError}
      />
    </div>
  );
}
