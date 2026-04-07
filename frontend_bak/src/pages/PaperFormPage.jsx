import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import PageHeader from "../components/common/PageHeader";
import PaperForm from "../components/papers/PaperForm";
import { listPaperCategories } from "../services/categoryService";
import { createPaper, getPaper, updatePaper } from "../services/paperService";
import { getApiErrorMessage } from "../utils/apiError";
import { CATEGORY_ACCESS_NOTE } from "../utils/constants";

export default function PaperFormPage({ mode }) {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryMode, setCategoryMode] = useState("select");
  const [categoryNote, setCategoryNote] = useState("");
  const [pageLoading, setPageLoading] = useState(mode === "edit");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadPaperData = async () => {
    if (mode !== "edit") {
      return;
    }

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
      setCategoryNote(
        data.length ? "Chọn danh mục bài báo phù hợp từ danh sách đã được quản trị viên khai báo." : CATEGORY_ACCESS_NOTE,
      );
    } catch (requestError) {
      setCategoryMode("manual");
      setCategoryNote(getApiErrorMessage(requestError, CATEGORY_ACCESS_NOTE));
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadPaperData();
  }, [mode, paperId]);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setSubmitError("");

    const { file_url, ...basePayload } = payload;
    const attachmentPayload = {
      file_url: file_url || null,
    };

    try {
      let saved;

      if (mode === "edit") {
        saved = await updatePaper(paperId, {
          ...basePayload,
          ...attachmentPayload,
        });
      } else {
        saved = await createPaper(basePayload);

        if (attachmentPayload.file_url) {
          saved = await updatePaper(saved.id, attachmentPayload);
        }
      }

      navigate(`/papers/${saved.id}`);
    } catch (requestError) {
      setSubmitError(getApiErrorMessage(requestError, "Không thể lưu bài báo."));
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return <LoadingState title="Đang chuẩn bị biểu mẫu" message="Hệ thống đang tải dữ liệu bài báo cần chỉnh sửa." />;
  }

  if (mode === "edit" && submitError && !initialValues) {
    return <ErrorState title="Không thể mở biểu mẫu bài báo" message={submitError} onRetry={loadPaperData} />;
  }

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Bài báo"
        title={mode === "edit" ? "Chỉnh sửa bài báo" : "Khai báo bài báo mới"}
        description="Điền đầy đủ thông tin để khai báo hoặc cập nhật hồ sơ bài báo khoa học, bao gồm cả liên kết tệp đính kèm nếu có."
      />
      <PaperForm
        initialValues={initialValues}
        mode={mode}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoryMode={categoryMode}
        categoryNote={categoryNote}
        onSubmit={handleSubmit}
        onCancel={() => navigate(mode === "edit" ? `/papers/${paperId}` : "/papers")}
        submitting={submitting}
        submitError={submitError}
      />
    </div>
  );
}
