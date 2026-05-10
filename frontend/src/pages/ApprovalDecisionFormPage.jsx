import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import FormField from "../components/common/FormField";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { getApprovalProject, makeApprovalDecision } from "../services/approvalService";
import { getApiErrorMessage } from "../utils/apiError";

const DECISION_OPTIONS = [
  { value: "approved", label: "Được duyệt" },
  { value: "rejected", label: "Không duyệt" },
  { value: "revision_required", label: "Duyệt có chỉnh sửa" },
];

export default function ApprovalDecisionFormPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [form, setForm] = useState({
    decision_type: "approved",
    approved_budget: "",
    start_date: "",
    end_date: "",
    conditions: "",
    note: "",
    attachment_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProject = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getApprovalProject(projectId);
      setProject(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải đề tài."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await makeApprovalDecision(projectId, {
        decision_type: form.decision_type,
        approved_budget: form.approved_budget ? Number(form.approved_budget) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        conditions: form.conditions.trim() || null,
        note: form.note.trim() || null,
        attachment_url: form.attachment_url.trim() || null,
      });
      navigate(`/approvals/${projectId}`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể lưu quyết định."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState title="Đang tải" message="Đang lấy thông tin đề tài." />;
  }

  if (error) {
    return <ErrorState title="Không thể tải" message={error} onRetry={loadProject} />;
  }

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Xét duyệt"
        title={`Ra quyết định: ${project?.name || ""}`}
        description="Nhập kết luận xét duyệt, kinh phí và các điều kiện đi kèm."
        actions={
          <Link className="button button--secondary" to={`/approvals/${projectId}`}>
            Quay lại
          </Link>
        }
      />

      <form className="panel form-panel stack-lg" onSubmit={handleSubmit}>
        <div className="form-grid form-grid--2">
          <FormField label="Loại quyết định" required>
            <select className="input" value={form.decision_type} onChange={(event) => handleChange("decision_type", event.target.value)}>
              {DECISION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Kinh phí duyệt">
            <input className="input" type="number" min="0" value={form.approved_budget} onChange={(event) => handleChange("approved_budget", event.target.value)} />
          </FormField>
          <FormField label="Ngày bắt đầu">
            <input className="input" type="date" value={form.start_date} onChange={(event) => handleChange("start_date", event.target.value)} />
          </FormField>
          <FormField label="Ngày kết thúc">
            <input className="input" type="date" value={form.end_date} onChange={(event) => handleChange("end_date", event.target.value)} />
          </FormField>
          <FormField label="Điều kiện kèm theo">
            <textarea className="input" rows="3" style={{ resize: "none" }} value={form.conditions} onChange={(event) => handleChange("conditions", event.target.value)} />
          </FormField>
          <FormField label="Ghi chú">
            <textarea className="input" rows="3" value={form.note} onChange={(event) => handleChange("note", event.target.value)} />
          </FormField>
          <FormField label="Tệp quyết định (link)">
            <input className="input" value={form.attachment_url} onChange={(event) => handleChange("attachment_url", event.target.value)} placeholder="https://..." />
          </FormField>
        </div>

        {error ? <div className="notice notice--danger">{error}</div> : null}

        <div className="button-row">
          <button type="submit" className="button" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu quyết định"}
          </button>
          <Link className="button button--secondary" to={`/approvals/${projectId}`}>
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
