import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import FormField from "../components/common/FormField";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { getApiErrorMessage } from "../utils/apiError";
import { getApprovalProject, getApprovalRound, requestRevision } from "../services/approvalService";

export default function RevisionRequestFormPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [roundInfo, setRoundInfo] = useState(null);
  const [form, setForm] = useState({ content: "", deadline: "", required_files: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [projectData, roundData] = await Promise.all([
        getApprovalProject(projectId),
        getApprovalRound(projectId),
      ]);
      setProject(projectData);
      setRoundInfo(roundData);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải dữ liệu."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!roundInfo) {
      setError("Chưa xác định vòng xét duyệt.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await requestRevision(roundInfo.id, {
        content: form.content.trim(),
        deadline: form.deadline,
        required_files: form.required_files.trim() || null,
      });
      navigate(`/approvals/${projectId}`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể gửi yêu cầu chỉnh sửa."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState title="Đang tải" message="Đang lấy thông tin đề tài." />;
  }

  if (error) {
    return <ErrorState title="Không thể tải" message={error} onRetry={loadData} />;
  }

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Xét duyệt"
        title={`Gửi yêu cầu chỉnh sửa: ${project?.name || ""}`}
        description="Gửi nội dung yêu cầu chỉnh sửa và hạn nộp bản chỉnh sửa cho chủ nhiệm đề tài."
        actions={
          <Link className="button button--secondary" to={`/approvals/${projectId}`}>
            Quay lại
          </Link>
        }
      />

      <form className="panel form-panel stack-lg" onSubmit={handleSubmit}>
        <div className="form-grid form-grid--2">
          <FormField label="Nội dung yêu cầu" required>
            <textarea className="input" rows="5" style={{ resize: "none" }} value={form.content} onChange={(event) => handleChange("content", event.target.value)} required />
          </FormField>
          <FormField label="Hạn nộp" required>
            <input className="input" type="date" value={form.deadline} onChange={(event) => handleChange("deadline", event.target.value)} required />
          </FormField>
          <FormField label="Tài liệu cần nộp lại">
            <textarea className="input" rows="3" style={{ resize: "none" }} value={form.required_files} onChange={(event) => handleChange("required_files", event.target.value)} placeholder="Ví dụ: thuyết minh, dự toán" />
          </FormField>
        </div>

        {error ? <div className="notice notice--danger">{error}</div> : null}

        <div className="button-row">
          <button type="submit" className="button" disabled={saving}>
            {saving ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
          <Link className="button button--secondary" to={`/approvals/${projectId}`}>
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
