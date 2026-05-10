import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import PageHeader from "../components/common/PageHeader";
import FormField from "../components/common/FormField";
import { getApiErrorMessage } from "../utils/apiError";
import { formatCurrency, formatDate, formatDateTime, formatLabel, formatNumber, formatProjectRecordCode } from "../utils/formatters";
import {
  cancelReviewRound,
  extendRoundDeadline,
  getApprovalProject,
  getApprovalRound,
  listProjectAssignments,
  listProjectFeedbacks,
  listApprovalDecisions,
  recordFormCheck,
  saveFeedbackSummary,
  scheduleCouncilMeeting,
} from "../services/approvalService";

function toDateTimeLocalValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function classifyRecommendation(value) {
  if (!value) {
    return "other";
  }

  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue.includes("không") || normalizedValue.includes("khong") || normalizedValue.includes("reject")) {
    return "reject";
  }
  if (normalizedValue.includes("duyệt") || normalizedValue.includes("duyet") || normalizedValue.includes("approve")) {
    return "approve";
  }
  return "other";
}

function formatScore(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}

export default function ApprovalDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [roundInfo, setRoundInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionKey, setActionKey] = useState("");
  const [meetingError, setMeetingError] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [summarySuccess, setSummarySuccess] = useState("");
  const [roundActionError, setRoundActionError] = useState("");
  const [roundActionSuccess, setRoundActionSuccess] = useState("");
  const [meetingForm, setMeetingForm] = useState({
    meeting_at: "",
    meeting_location: "",
  });
  const [deadlineForm, setDeadlineForm] = useState({
    revision_deadline: "",
    reason: "",
  });
  const [cancelReason, setCancelReason] = useState("");

  const loadDetail = async () => {
    setLoading(true);
    setError("");
    setMeetingError("");
    setSummaryError("");

    try {
      const [projectData, roundData, assignmentData, feedbackData, decisionData] = await Promise.all([
        getApprovalProject(projectId),
        getApprovalRound(projectId),
        listProjectAssignments(projectId),
        listProjectFeedbacks(projectId),
        listApprovalDecisions(projectId),
      ]);
      setProject(projectData);
      setRoundInfo(roundData);
      setMeetingForm({
        meeting_at: toDateTimeLocalValue(roundData?.meeting_at),
        meeting_location: roundData?.meeting_location || "",
      });
      setDeadlineForm((previous) => ({
        ...previous,
        revision_deadline: roundData?.revision_deadline || "",
      }));
      setAssignments(assignmentData);
      setFeedbacks(feedbackData);
      setDecisions(decisionData);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải hồ sơ xét duyệt."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [projectId]);

  const handleFormCheck = async (passed) => {
    setActionKey(passed ? "form-pass" : "form-fail");
    try {
      await recordFormCheck(projectId, { passed, note: passed ? "" : "Không đạt hình thức." });
      await loadDetail();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể lưu kết quả kiểm tra."));
    } finally {
      setActionKey("");
    }
  };

  const handleMeetingFieldChange = (field, value) => {
    setMeetingForm((previous) => ({ ...previous, [field]: value }));
    setMeetingError("");
  };

  const handleScheduleMeeting = async (event) => {
    event.preventDefault();

    if (!meetingForm.meeting_at || !meetingForm.meeting_location.trim()) {
      setMeetingError("Vui lòng chọn thời gian họp và nhập địa điểm.");
      return;
    }

    setActionKey("schedule-meeting");
    setMeetingError("");
    try {
      await scheduleCouncilMeeting(projectId, {
        meeting_at: meetingForm.meeting_at,
        meeting_location: meetingForm.meeting_location.trim(),
      });
      await loadDetail();
    } catch (requestError) {
      setMeetingError(getApiErrorMessage(requestError, "Không thể cập nhật lịch họp."));
    } finally {
      setActionKey("");
    }
  };

  const feedbackSummary = useMemo(() => {
    const submittedFeedbacks = feedbacks.filter((feedback) => feedback.submitted_at);
    const scores = submittedFeedbacks
      .map((feedback) => Number(feedback.score))
      .filter((score) => !Number.isNaN(score));
    const recommendations = submittedFeedbacks.map((feedback) => classifyRecommendation(feedback.recommendation));
    const totalScore = scores.reduce((sum, score) => sum + score, 0);

    return {
      submittedCount: submittedFeedbacks.length,
      scoredCount: scores.length,
      averageScore: scores.length ? totalScore / scores.length : null,
      minScore: scores.length ? Math.min(...scores) : null,
      maxScore: scores.length ? Math.max(...scores) : null,
      approveCount: recommendations.filter((item) => item === "approve").length,
      rejectCount: recommendations.filter((item) => item === "reject").length,
      otherCount: recommendations.filter((item) => item === "other").length,
    };
  }, [feedbacks]);

  const handleSaveFeedbackSummary = async () => {
    if (!feedbackSummary.submittedCount) {
      setSummaryError("Chưa có phiếu nhận xét để tổng hợp.");
      setSummarySuccess("");
      return;
    }

    setActionKey("save-feedback-summary");
    setSummaryError("");
    setSummarySuccess("");
    try {
      await saveFeedbackSummary(projectId);
      setSummarySuccess("Đã lưu kết quả tổng hợp phản biện vào lịch sử xét duyệt.");
    } catch (requestError) {
      setSummaryError(getApiErrorMessage(requestError, "Không thể lưu kết quả tổng hợp phản biện."));
    } finally {
      setActionKey("");
    }
  };

  const handleDeadlineFieldChange = (field, value) => {
    setDeadlineForm((previous) => ({ ...previous, [field]: value }));
    setRoundActionError("");
    setRoundActionSuccess("");
  };

  const handleExtendDeadline = async (event) => {
    event.preventDefault();

    if (!roundInfo?.id || !deadlineForm.revision_deadline || !deadlineForm.reason.trim()) {
      setRoundActionError("Vui lòng nhập hạn mới và lý do gia hạn.");
      setRoundActionSuccess("");
      return;
    }

    setActionKey("extend-deadline");
    setRoundActionError("");
    setRoundActionSuccess("");
    try {
      await extendRoundDeadline(roundInfo.id, {
        revision_deadline: deadlineForm.revision_deadline,
        reason: deadlineForm.reason.trim(),
      });
      setDeadlineForm((previous) => ({ ...previous, reason: "" }));
      setRoundActionSuccess("Đã gia hạn thời hạn chỉnh sửa.");
      await loadDetail();
    } catch (requestError) {
      setRoundActionError(getApiErrorMessage(requestError, "Không thể gia hạn thời hạn."));
    } finally {
      setActionKey("");
    }
  };

  const handleCancelRound = async (event) => {
    event.preventDefault();

    if (!roundInfo?.id || !cancelReason.trim()) {
      setRoundActionError("Vui lòng nhập lý do hủy/thu hồi.");
      setRoundActionSuccess("");
      return;
    }

    const confirmed = window.confirm("Hủy phiên xét duyệt hoặc thu hồi quyết định hiện tại?");
    if (!confirmed) {
      return;
    }

    setActionKey("cancel-round");
    setRoundActionError("");
    setRoundActionSuccess("");
    try {
      await cancelReviewRound(roundInfo.id, { reason: cancelReason.trim() });
      setCancelReason("");
      setRoundActionSuccess("Đã hủy phiên xét duyệt/thu hồi quyết định.");
      await loadDetail();
    } catch (requestError) {
      setRoundActionError(getApiErrorMessage(requestError, "Không thể hủy phiên xét duyệt."));
    } finally {
      setActionKey("");
    }
  };

  const handleExportDecision = () => {
    const latestDecision = decisions[0];
    if (!latestDecision) {
      setRoundActionError("Chưa có quyết định để xuất.");
      setRoundActionSuccess("");
      return;
    }

    const documentHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Quyet dinh xet duyet - ${project.name}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.5; padding: 32px; }
    h1 { text-align: center; font-size: 22px; text-transform: uppercase; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    td { border: 1px solid #444; padding: 8px; vertical-align: top; }
    .label { width: 32%; font-weight: 700; }
  </style>
</head>
<body>
  <h1>Biên bản / quyết định xét duyệt đề tài</h1>
  <table>
    <tr><td class="label">Mã hồ sơ</td><td>${formatProjectRecordCode(project)}</td></tr>
    <tr><td class="label">Tên đề tài</td><td>${project.name || ""}</td></tr>
    <tr><td class="label">Chủ nhiệm</td><td>${project.leader_name || ""}</td></tr>
    <tr><td class="label">Loại quyết định</td><td>${formatLabel(latestDecision.decision_type)}</td></tr>
    <tr><td class="label">Kinh phí được duyệt</td><td>${formatCurrency(latestDecision.approved_budget)}</td></tr>
    <tr><td class="label">Thời gian thực hiện</td><td>${formatDate(latestDecision.start_date)} - ${formatDate(latestDecision.end_date)}</td></tr>
    <tr><td class="label">Điều kiện</td><td>${latestDecision.conditions || "—"}</td></tr>
    <tr><td class="label">Ghi chú</td><td>${latestDecision.note || "—"}</td></tr>
    <tr><td class="label">Người ra quyết định</td><td>${latestDecision.decided_by_name || "—"}</td></tr>
    <tr><td class="label">Thời điểm quyết định</td><td>${formatDateTime(latestDecision.decided_at)}</td></tr>
  </table>
</body>
</html>`;
    const blob = new Blob([documentHtml], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quyet-dinh-xet-duyet-${project.id}.doc`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setRoundActionError("");
    setRoundActionSuccess("Đã tạo file quyết định xét duyệt.");
  };

  if (loading) {
    return <LoadingState title="Đang tải" message="Đang lấy dữ liệu xét duyệt đề tài." />;
  }

  if (error) {
    return <ErrorState title="Không thể tải" message={error} onRetry={loadDetail} />;
  }

  if (!project) {
    return <ErrorState title="Không tìm thấy" message="Không tìm thấy hồ sơ đề tài." />;
  }

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Xét duyệt"
        title={`Chi tiết xét duyệt: ${project.name}`}
        description={`Mã hồ sơ: ${formatProjectRecordCode(project)} · Trạng thái: ${formatLabel(project.approval_status || project.status)}`}
        actions={
          <div className="button-row">
            <Link className="button button--secondary" to={`/approvals/${project.id}/history`}>
              Lịch sử
            </Link>
            <Link className="button button--secondary" to={`/approvals/${project.id}/assign`}>
              Phân công phản biện
            </Link>
            <Link className="button button--secondary" to={`/approvals/${project.id}/decision`}>
              Ra quyết định
            </Link>
            <Link className="button button--secondary" to={`/approvals/${project.id}/revision-request`}>
              Yêu cầu chỉnh sửa
            </Link>
          </div>
        }
      />

      <section className="panel form-panel stack-md">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Thông tin đề tài</h2>
            <p className="section-description">Tóm tắt thông tin hồ sơ và trạng thái xét duyệt hiện tại.</p>
          </div>
        </div>
        <div className="form-grid form-grid--3">
          <FormField label="Chủ nhiệm">
            <input className="input" value={project.leader_name || "—"} disabled readOnly />
          </FormField>
          <FormField label="Email">
            <input className="input" value={project.leader_email || "—"} disabled readOnly />
          </FormField>
          <FormField label="Danh mục">
            <input className="input" value={project.category_name || "—"} disabled readOnly />
          </FormField>
          <FormField label="Ngày nộp">
            <input className="input" value={formatDateTime(project.submitted_at)} disabled readOnly />
          </FormField>
          <FormField label="Thời gian thực hiện">
            <input className="input" value={`${formatDate(project.start_date)} - ${formatDate(project.end_date)}`} disabled readOnly />
          </FormField>
          <FormField label="Trạng thái xét duyệt">
            <input className="input" value={formatLabel(project.approval_status || project.status)} disabled readOnly />
          </FormField>
        </div>
        <div className="button-row">
          <button type="button" className="button button--secondary" disabled={actionKey === "form-pass"} onClick={() => handleFormCheck(true)}>
            Đạt hình thức
          </button>
          <button type="button" className="button button--secondary" disabled={actionKey === "form-fail"} onClick={() => handleFormCheck(false)}>
            Không đạt hình thức
          </button>
        </div>
        <form className="form-grid form-grid--3" onSubmit={handleScheduleMeeting}>
          <FormField label="Thời gian họp" required>
            <input
              className="input"
              type="datetime-local"
              value={meetingForm.meeting_at}
              onChange={(event) => handleMeetingFieldChange("meeting_at", event.target.value)}
              required
            />
          </FormField>
          <FormField label="Địa điểm họp" required>
            <input
              className="input"
              value={meetingForm.meeting_location}
              onChange={(event) => handleMeetingFieldChange("meeting_location", event.target.value)}
              placeholder="Phòng họp, link họp trực tuyến..."
              required
            />
          </FormField>
          <div className="button-row">
            <button type="submit" className="button" disabled={actionKey === "schedule-meeting"}>
              {actionKey === "schedule-meeting" ? "Đang cập nhật..." : "Cập nhật lịch họp"}
            </button>
          </div>
        </form>
        {meetingError ? <div className="notice notice--danger">{meetingError}</div> : null}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Vòng xét duyệt hiện tại</h2>
            <p className="section-description">Thông tin về vòng xét duyệt và yêu cầu chỉnh sửa (nếu có).</p>
          </div>
        </div>
        {roundInfo ? (
          <div className="form-grid form-grid--3">
            <FormField label="Vòng">
              <input className="input" value={`Vòng ${roundInfo.round_number}`} disabled readOnly />
            </FormField>
            <FormField label="Trạng thái">
              <input className="input" value={formatLabel(roundInfo.status)} disabled readOnly />
            </FormField>
            <FormField label="Lịch họp">
              <input className="input" value={roundInfo.meeting_at ? `${formatDateTime(roundInfo.meeting_at)} - ${roundInfo.meeting_location || "—"}` : "Chưa đặt"} disabled readOnly />
            </FormField>
            <FormField label="Yêu cầu chỉnh sửa">
              <input className="input" value={roundInfo.revision_request_content || "—"} disabled readOnly />
            </FormField>
            <FormField label="Hạn chỉnh sửa">
              <input className="input" value={formatDate(roundInfo.revision_deadline)} disabled readOnly />
            </FormField>
            <FormField label="Tệp chỉnh sửa">
              <input className="input" value={roundInfo.revision_files || "—"} disabled readOnly />
            </FormField>
          </div>
        ) : (
          <div className="inline-empty">Chưa có vòng xét duyệt.</div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Phân công phản biện</h2>
            <p className="section-description">Danh sách các giảng viên đã được phân công phản biện.</p>
          </div>
        </div>
        {!assignments.length ? (
          <div className="inline-empty">Chưa có phân công phản biện.</div>
        ) : (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Giảng viên</th>
                  <th>Email</th>
                  <th>Hạn nộp</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>{assignment.reviewer_name || "—"}</td>
                    <td>{assignment.reviewer_email || "—"}</td>
                    <td>{formatDate(assignment.due_date)}</td>
                    <td>{formatLabel(assignment.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Tổng hợp kết quả phản biện</h2>
            <p className="section-description">Tính toán từ các phiếu nhận xét đã nộp và lưu kết quả tổng hợp vào lịch sử xét duyệt.</p>
          </div>
        </div>
        <div className="metric-strip metric-strip--4">
          <div className="metric-card">
            <span className="metric-card__label">Số phiếu đã nộp</span>
            <strong className="metric-card__value">{formatNumber(feedbackSummary.submittedCount)}</strong>
            <span className="metric-card__hint">Tổng số phiếu phản biện hợp lệ để tổng hợp.</span>
          </div>
          <div className="metric-card">
            <span className="metric-card__label">Điểm trung bình</span>
            <strong className="metric-card__value">{formatScore(feedbackSummary.averageScore)}</strong>
            <span className="metric-card__hint">{formatNumber(feedbackSummary.scoredCount)} phiếu có điểm.</span>
          </div>
          <div className="metric-card">
            <span className="metric-card__label">Điểm thấp nhất / cao nhất</span>
            <strong className="metric-card__value">{formatScore(feedbackSummary.minScore)} / {formatScore(feedbackSummary.maxScore)}</strong>
            <span className="metric-card__hint">Khoảng điểm phản biện đã ghi nhận.</span>
          </div>
          <div className="metric-card">
            <span className="metric-card__label">Đề xuất</span>
            <strong className="metric-card__value">{feedbackSummary.approveCount} / {feedbackSummary.rejectCount}</strong>
            <span className="metric-card__hint">Duyệt / không duyệt, khác: {feedbackSummary.otherCount}.</span>
          </div>
        </div>
        <div className="button-row">
          <button
            type="button"
            className="button"
            disabled={actionKey === "save-feedback-summary" || !feedbackSummary.submittedCount}
            onClick={handleSaveFeedbackSummary}
          >
            {actionKey === "save-feedback-summary" ? "Đang lưu..." : "Lưu kết quả tổng hợp"}
          </button>
        </div>
        {summaryError ? <div className="notice notice--danger">{summaryError}</div> : null}
        {summarySuccess ? <div className="notice notice--success">{summarySuccess}</div> : null}
      </section>

      <section className="panel form-panel stack-md">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Gia hạn, hủy và xuất quyết định</h2>
            <p className="section-description">Các thao tác bổ sung cho vòng xét duyệt hiện tại.</p>
          </div>
        </div>
        <form className="form-grid form-grid--3" onSubmit={handleExtendDeadline}>
          <FormField label="Hạn chỉnh sửa mới" required>
            <input
              className="input"
              type="date"
              value={deadlineForm.revision_deadline}
              onChange={(event) => handleDeadlineFieldChange("revision_deadline", event.target.value)}
              disabled={!roundInfo}
              required
            />
          </FormField>
          <FormField label="Lý do gia hạn" required>
            <input
              className="input"
              value={deadlineForm.reason}
              onChange={(event) => handleDeadlineFieldChange("reason", event.target.value)}
              placeholder="Nhập lý do gia hạn"
              disabled={!roundInfo}
              required
            />
          </FormField>
          <div className="button-row">
            <button type="submit" className="button" disabled={!roundInfo || actionKey === "extend-deadline"}>
              {actionKey === "extend-deadline" ? "Đang lưu..." : "Lưu gia hạn"}
            </button>
          </div>
        </form>
        <form className="form-grid form-grid--3" onSubmit={handleCancelRound}>
          <FormField label="Lý do hủy/thu hồi" required>
            <input
              className="input"
              value={cancelReason}
              onChange={(event) => {
                setCancelReason(event.target.value);
                setRoundActionError("");
                setRoundActionSuccess("");
              }}
              placeholder="Nhập lý do hủy phiên xét duyệt hoặc thu hồi quyết định"
              disabled={!roundInfo || roundInfo.status === "canceled"}
              required
            />
          </FormField>
          <div className="button-row">
            <button type="submit" className="button button--danger" disabled={!roundInfo || roundInfo.status === "canceled" || actionKey === "cancel-round"}>
              {actionKey === "cancel-round" ? "Đang hủy..." : "Hủy/thu hồi"}
            </button>
            <button type="button" className="button button--secondary" disabled={!decisions.length} onClick={handleExportDecision}>
              Xuất quyết định Word
            </button>
          </div>
        </form>
        {roundActionError ? <div className="notice notice--danger">{roundActionError}</div> : null}
        {roundActionSuccess ? <div className="notice notice--success">{roundActionSuccess}</div> : null}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Phiếu nhận xét</h2>
            <p className="section-description">Danh sách phiếu nhận xét đã nộp.</p>
          </div>
        </div>
        {!feedbacks.length ? (
          <div className="inline-empty">Chưa có phiếu nhận xét.</div>
        ) : (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Giảng viên</th>
                  <th>Điểm</th>
                  <th>Nhận xét</th>
                  <th>Ngày nộp</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((feedback) => (
                  <tr key={feedback.id}>
                    <td>{feedback.reviewer_name || "—"}</td>
                    <td>{feedback.score ?? "—"}</td>
                    <td>{feedback.comment || "—"}</td>
                    <td>{formatDateTime(feedback.submitted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Quyết định xét duyệt</h2>
            <p className="section-description">Các quyết định đã ghi nhận cho đề tài.</p>
          </div>
        </div>
        {!decisions.length ? (
          <div className="inline-empty">Chưa có quyết định.</div>
        ) : (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loại quyết định</th>
                  <th>Kinh phí</th>
                  <th>Thời gian</th>
                  <th>Người ra quyết định</th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((decision) => (
                  <tr key={decision.id}>
                    <td>{formatLabel(decision.decision_type)}</td>
                    <td>{decision.approved_budget ?? "—"}</td>
                    <td>{decision.start_date ? `${formatDate(decision.start_date)} - ${formatDate(decision.end_date)}` : "—"}</td>
                    <td>{decision.decided_by_name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
