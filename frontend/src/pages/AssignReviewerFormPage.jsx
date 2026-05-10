import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import FormField from "../components/common/FormField";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { assignReviewers, getApprovalProject, listProjectAssignments, listReviewerCandidates } from "../services/approvalService";
import { getApiErrorMessage } from "../utils/apiError";

export default function AssignReviewerFormPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [projectData, candidateData, assignmentData] = await Promise.all([
        getApprovalProject(projectId),
        listReviewerCandidates(projectId),
        listProjectAssignments(projectId),
      ]);
      setProject(projectData);
      setCandidates(candidateData);
      setSelectedIds(assignmentData.map((assignment) => assignment.reviewer_id));
      setDueDate(assignmentData[0]?.due_date || "");
      setNote(assignmentData[0]?.note || "");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải danh sách phản biện."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const toggleReviewer = (reviewerId) => {
    setSelectedIds((previous) =>
      previous.includes(reviewerId)
        ? previous.filter((id) => id !== reviewerId)
        : [...previous, reviewerId],
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = selectedIds.map((reviewerId) => ({
        reviewer_id: reviewerId,
        due_date: dueDate || null,
        note: note.trim() || null,
      }));
      await assignReviewers(projectId, payload);
      navigate(`/approvals/${projectId}`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể lưu phân công."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState title="Đang tải" message="Đang lấy dữ liệu phân công phản biện." />;
  }

  if (error) {
    return <ErrorState title="Không thể tải" message={error} onRetry={loadData} />;
  }

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Xét duyệt"
        title={`Phân công phản biện${project ? `: ${project.name}` : ""}`}
        description="Chọn giảng viên phù hợp và đặt hạn nộp phiếu phản biện."
        actions={
          <Link className="button button--secondary" to={`/approvals/${projectId}`}>
            Quay lại
          </Link>
        }
      />

      <form className="panel form-panel stack-lg" onSubmit={handleSubmit}>
        <div className="form-grid form-grid--3">
          <FormField label="Hạn nộp phiếu">
            <input className="input" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </FormField>
          <FormField label="Ghi chú">
            <input className="input" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi chú cho phản biện" />
          </FormField>
        </div>

        <div className="section-heading">
          <div>
            <h2 className="section-title">Danh sách giảng viên</h2>
            <p className="section-description">Chọn ít nhất 2 giảng viên phản biện.</p>
          </div>
        </div>

        {!candidates.length ? (
          <div className="inline-empty">Không có giảng viên phù hợp.</div>
        ) : (
          <div className="form-grid form-grid--2">
            {candidates.map((reviewer) => (
              <label key={reviewer.id} className="checkbox-field">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(reviewer.id)}
                  onChange={() => toggleReviewer(reviewer.id)}
                />
                <span>
                  {reviewer.full_name} · {reviewer.department || "—"}
                </span>
              </label>
            ))}
          </div>
        )}

        {error ? <div className="notice notice--danger">{error}</div> : null}

        <div className="button-row">
          <button type="submit" className="button" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu phân công"}
          </button>
          <Link to={`/approvals/${projectId}`} className="button button--secondary">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
