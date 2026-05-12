import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import FormField from "../components/common/FormField";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDate, formatDateTime, formatProjectRecordCode } from "../utils/formatters";
import {
  getAssignmentFeedback,
  submitAssignmentFeedback,
} from "../services/approvalService";
import api from "../services/api";

async function getAssignment(assignmentId) {
  const response = await api.get(`/approval/assignments/${assignmentId}`);
  return response.data;
}

function isPastDueDate(value) {
  if (!value) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(`${value}T00:00:00`);
  return dueDate < today;
}

export default function ReviewFeedbackFormPage() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [form, setForm] = useState({
    score: "",
    comment: "",
    strengths: "",
    weaknesses: "",
    recommendation: "",
    attachment_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const loadData = async () => {
    setLoading(true);
    setLoadError("");
    setSubmitError("");

    try {
      const [assignmentData, feedbackData] = await Promise.all([
        getAssignment(assignmentId),
        getAssignmentFeedback(assignmentId).catch(() => null),
      ]);
      setAssignment(assignmentData);
      setFeedback(feedbackData);
      if (feedbackData) {
        setForm({
          score: feedbackData.score ?? "",
          comment: feedbackData.comment || "",
          strengths: feedbackData.strengths || "",
          weaknesses: feedbackData.weaknesses || "",
          recommendation: feedbackData.recommendation || "",
          attachment_url: feedbackData.attachment_url || "",
        });
      }
    } catch (requestError) {
      setLoadError(getApiErrorMessage(requestError, "Không thể tải dữ liệu phản biện."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  const renderMeetingLocation = (value) => {
    if (!value) {
      return "Chưa có";
    }

    const trimmed = String(value).trim();
    const isLink = /^https?:\/\//i.test(trimmed);
    if (!isLink) {
      return trimmed;
    }

    return (
      <a href={trimmed} target="_blank" rel="noreferrer" className="button button--secondary button--small nav-button-link">
        Mở link họp
      </a>
    );
  };

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setSubmitError("");
    setFieldErrors((previous) => ({ ...previous, [field]: "" }));
  };

  const validateForm = (submit) => {
    const nextErrors = {};
    const score = form.score === "" ? null : Number(form.score);

    if (form.score !== "" && (Number.isNaN(score) || score < 0 || score > 10)) {
      nextErrors.score = "Điểm đánh giá phải nằm trong khoảng 0 đến 10.";
    }

    if (submit && score === null) {
      nextErrors.score = "Vui lòng nhập điểm đánh giá.";
    }

    if (submit && !form.comment.trim()) {
      nextErrors.comment = "Vui lòng nhập nội dung nhận xét.";
    }

    if (submit && isPastDueDate(assignment?.due_date)) {
      nextErrors.due_date = "Đã quá hạn nộp phiếu phản biện.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event, submit = true) => {
    event.preventDefault();
    setSubmitError("");

    if (!validateForm(submit)) {
      return;
    }

    setSaving(true);

    try {
      await submitAssignmentFeedback(assignmentId, {
        score: form.score === "" ? null : Number(form.score),
        comment: form.comment.trim() || null,
        strengths: form.strengths.trim() || null,
        weaknesses: form.weaknesses.trim() || null,
        recommendation: form.recommendation.trim() || null,
        attachment_url: form.attachment_url.trim() || null,
        submit,
      });
      await loadData();
    } catch (requestError) {
      setSubmitError(getApiErrorMessage(requestError, "Không thể lưu phiếu nhận xét."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState title="Đang tải" message="Đang lấy dữ liệu phản biện." />;
  }

  if (loadError) {
    return <ErrorState title="Không thể tải" message={loadError} onRetry={loadData} />;
  }

  if (!assignment) {
    return <ErrorState title="Không tìm thấy" message="Không tìm thấy phân công phản biện." />;
  }

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Phản biện"
        title={`Nhập nhận xét: ${assignment.project_name || ""}`}
        description={`Mã đề tài: ${formatProjectRecordCode({ id: assignment.project_id, code: assignment.project_code })} · Hạn nộp: ${formatDate(assignment.due_date)}`}
        actions={
          <Link className="button button--secondary" to="/review-assignments">
            Quay lại
          </Link>
        }
      />

      <section className="panel form-panel">
        <div className="form-grid form-grid--2">
          <FormField label="Thời gian họp">
            <input className="input" value={assignment.meeting_at ? formatDateTime(assignment.meeting_at) : "Chưa đặt"} disabled readOnly />
          </FormField>
          <FormField label="Địa điểm họp">
            <div className="input">
              {renderMeetingLocation(assignment.meeting_location)}
            </div>
          </FormField>
        </div>
      </section>

      <form className="panel form-panel stack-lg" onSubmit={(event) => handleSubmit(event, true)}>
        <div className="form-grid form-grid--2">
          <FormField label="Điểm đánh giá" required error={fieldErrors.score}>
            <input className="input" type="number" min="0" max="10" step="0.1" value={form.score} onChange={(event) => handleChange("score", event.target.value)} />
          </FormField>
          <FormField label="Tệp nhận xét (link, không bắt buộc)" hint="Có thể bỏ trống hoặc nhập link tài liệu nhận xét." error={fieldErrors.attachment_url}>
            <input className="input" value={form.attachment_url} onChange={(event) => handleChange("attachment_url", event.target.value)} placeholder="https://..." />
          </FormField>
          <FormField label="Nhận xét tổng quan" required error={fieldErrors.comment}>
            <textarea className="input" rows="4" style={{ resize: "none" }} value={form.comment} onChange={(event) => handleChange("comment", event.target.value)} />
          </FormField>
          <FormField label="Ưu điểm">
            <textarea className="input" rows="3" style={{ resize: "none" }} value={form.strengths} onChange={(event) => handleChange("strengths", event.target.value)} />
          </FormField>
          <FormField label="Hạn chế">
            <textarea className="input" rows="3" style={{ resize: "none" }} value={form.weaknesses} onChange={(event) => handleChange("weaknesses", event.target.value)} />
          </FormField>
          <FormField label="Đề xuất">
            <textarea className="input" rows="3" style={{ resize: "none" }} value={form.recommendation} onChange={(event) => handleChange("recommendation", event.target.value)} />
          </FormField>
        </div>

        {fieldErrors.due_date ? <div className="notice notice--danger">{fieldErrors.due_date}</div> : null}
        {submitError ? <div className="notice notice--danger">{submitError}</div> : null}

        <div className="button-row">
          <button type="button" className="button button--secondary" disabled={saving} onClick={(event) => handleSubmit(event, false)}>
            Lưu nháp
          </button>
          <button type="submit" className="button" disabled={saving}>
            {saving ? "Đang lưu..." : "Nộp phiếu"}
          </button>
        </div>
      </form>
    </div>
  );
}
