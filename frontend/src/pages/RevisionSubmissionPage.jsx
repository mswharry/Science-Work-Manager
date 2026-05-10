import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import FormField from "../components/common/FormField";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDate, formatDateTime, formatLabel } from "../utils/formatters";
import { getReviewRound, submitRevision } from "../services/approvalService";

export default function RevisionSubmissionPage() {
  const { roundId } = useParams();
  const [roundInfo, setRoundInfo] = useState(null);
  const [form, setForm] = useState({ revision_files: "", note: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getReviewRound(roundId);
      setRoundInfo(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải yêu cầu chỉnh sửa."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roundId]);

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await submitRevision(roundId, {
        revision_files: form.revision_files.trim() || null,
        note: form.note.trim() || null,
      });
      await loadData();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể nộp bản chỉnh sửa."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState title="Đang tải" message="Đang lấy yêu cầu chỉnh sửa." />;
  }

  if (error) {
    return <ErrorState title="Không thể tải" message={error} onRetry={loadData} />;
  }

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Chỉnh sửa hồ sơ"
        title="Nộp bản chỉnh sửa"
        description="Nộp lại tài liệu theo yêu cầu chỉnh sửa của hội đồng xét duyệt."
        actions={
          <Link className="button button--secondary" to="/projects">
            Quay lại đề tài
          </Link>
        }
      />

      <section className="panel stack-md">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Yêu cầu chỉnh sửa</h2>
            <p className="section-description">Thông tin yêu cầu chỉnh sửa từ hội đồng xét duyệt.</p>
          </div>
        </div>
        <div className="form-grid form-grid--2">
          <FormField label="Trạng thái">
            <input className="input" value={formatLabel(roundInfo.status)} disabled readOnly />
          </FormField>
          <FormField label="Hạn nộp">
            <input className="input" value={formatDate(roundInfo.revision_deadline)} disabled readOnly />
          </FormField>
          <FormField label="Nội dung yêu cầu">
            <textarea className="input" rows="4" value={roundInfo.revision_request_content || "—"} disabled readOnly />
          </FormField>
          <FormField label="Tài liệu cần nộp">
            <textarea className="input" rows="3" value={roundInfo.revision_required_files || "—"} disabled readOnly />
          </FormField>
          <FormField label="Đã nộp lúc">
            <input className="input" value={formatDateTime(roundInfo.revision_submitted_at)} disabled readOnly />
          </FormField>
        </div>
      </section>

      <form className="panel form-panel stack-lg" onSubmit={handleSubmit}>
        <div className="form-grid form-grid--2">
          <FormField label="Tệp chỉnh sửa (link)">
            <input className="input" value={form.revision_files} onChange={(event) => handleChange("revision_files", event.target.value)} placeholder="https://..." />
          </FormField>
          <FormField label="Ghi chú">
            <textarea className="input" rows="3" value={form.note} onChange={(event) => handleChange("note", event.target.value)} />
          </FormField>
        </div>
        {error ? <div className="notice notice--danger">{error}</div> : null}
        <div className="button-row">
          <button type="submit" className="button" disabled={saving}>
            {saving ? "Đang nộp..." : "Nộp bản chỉnh sửa"}
          </button>
        </div>
      </form>
    </div>
  );
}
