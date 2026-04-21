import { useState } from "react";
import { formatDate, formatDateTime, truncateText } from "../../utils/formatters";
import StatusBadge from "../common/StatusBadge";
import FormField from "../common/FormField";

function canManageReportBoard(project, currentUser) {
  return Boolean(
    currentUser &&
      project &&
      project.status === "approved" &&
      (currentUser.role === "admin" || currentUser.id === project.leader_id),
  );
}

export default function ProjectReportBoard({
  project,
  currentUser,
  reports,
  loading,
  error,
  onRefresh,
  onCreateReport,
  onSubmitReport,
  onReviewReport,
  actionKey,
}) {
  const [form, setForm] = useState({
    title: "",
    due_date: "",
    description: "",
  });

  const canManage = canManageReportBoard(project, currentUser);

  const handleCreate = async (event) => {
    event.preventDefault();
    await onCreateReport({
      title: form.title.trim(),
      due_date: form.due_date,
      description: form.description.trim() || null,
    });
    setForm({ title: "", due_date: "", description: "" });
  };

  const handleSubmitReport = async (report) => {
    const content = window.prompt("Nhập nội dung báo cáo định kỳ:", report.submission_content || "");
    if (content === null) return;
    await onSubmitReport(report.id, { content: content.trim() || "Báo cáo đã nộp." });
  };

  const handleReviewReport = async (report, action) => {
    const label = action === "approve" ? "phê duyệt" : "từ chối";
    const note = window.prompt(`Nhập ghi chú khi ${label} báo cáo:`, report.review_note || "");
    if (note === null) return;
    await onReviewReport(report.id, { action, note: note.trim() || null });
  };

  return (
    <section className="panel stack-md">
      <div className="section-heading">
        <div>
          <h2 className="section-title">Báo cáo định kỳ</h2>
          <p className="section-description">
            Leader tạo mốc báo cáo theo deadline, thành viên nộp nội dung và leader/admin duyệt theo quy trình pending - submitted - approved/rejected/overdue.
          </p>
        </div>
        <button type="button" className="button button--secondary button--small" onClick={onRefresh}>
          Làm mới
        </button>
      </div>

      {canManage ? (
        <form className="panel stack-md" onSubmit={handleCreate}>
          <div className="section-heading">
            <div>
              <h3 className="section-title">Tạo mốc báo cáo mới</h3>
              <p className="section-description">Thiết lập deadline để hệ thống theo dõi quá hạn tự động.</p>
            </div>
          </div>

          <div className="form-grid form-grid--3">
            <FormField label="Tiêu đề mốc" required>
              <input
                className="input"
                value={form.title}
                onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                placeholder="Ví dụ: Báo cáo tiến độ tháng 1"
                required
              />
            </FormField>

            <FormField label="Deadline" required>
              <input
                className="input"
                type="date"
                value={form.due_date}
                onChange={(event) => setForm((previous) => ({ ...previous, due_date: event.target.value }))}
                required
              />
            </FormField>

            <FormField label="Mô tả">
              <input
                className="input"
                value={form.description}
                onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
                placeholder="Phạm vi nội dung cần nộp"
              />
            </FormField>
          </div>

          <div className="button-row">
            <button type="submit" className="button" disabled={actionKey === "create-report"}>
              {actionKey === "create-report" ? "Đang tạo..." : "Tạo mốc báo cáo"}
            </button>
          </div>
        </form>
      ) : null}

      {loading ? <div className="inline-empty">Đang tải danh sách báo cáo...</div> : null}
      {!loading && error ? <div className="notice notice--danger">{error}</div> : null}
      {!loading && !error && !reports.length ? <div className="inline-empty">Chưa có mốc báo cáo nào cho đề tài này.</div> : null}

      {!loading && !error && reports.length ? (
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mốc báo cáo</th>
                <th>Deadline</th>
                <th>Trạng thái</th>
                <th>Người nộp</th>
                <th>Cập nhật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const canSubmit = project?.status === "approved" && ["pending", "rejected", "overdue"].includes(report.status);
                const canReview = canManage && ["submitted", "overdue"].includes(report.status);
                const submitKey = `submit-report-${report.id}`;
                const approveKey = `review-approve-report-${report.id}`;
                const rejectKey = `review-reject-report-${report.id}`;

                return (
                  <tr key={report.id}>
                    <td>
                      <div className="table-primary">{report.title}</div>
                      {report.description ? <div className="table-secondary">{truncateText(report.description, 120)}</div> : null}
                      {report.submission_content ? (
                        <div className="table-note">Nội dung nộp: {truncateText(report.submission_content, 120)}</div>
                      ) : null}
                      {report.review_note ? <div className="table-note">Ghi chú duyệt: {truncateText(report.review_note, 120)}</div> : null}
                    </td>
                    <td>
                      <div>{formatDate(report.due_date)}</div>
                      {report.is_overdue ? <div className="table-note">Quá hạn</div> : null}
                    </td>
                    <td>
                      <StatusBadge value={report.status} />
                    </td>
                    <td>{report.submitted_by_name || "Chưa nộp"}</td>
                    <td>{formatDateTime(report.updated_at)}</td>
                    <td>
                      <div className="table-actions">
                        {canSubmit ? (
                          <button
                            type="button"
                            className="button button--secondary button--small"
                            disabled={actionKey === submitKey}
                            onClick={() => handleSubmitReport(report)}
                          >
                            {actionKey === submitKey ? "Đang nộp..." : "Nộp báo cáo"}
                          </button>
                        ) : null}

                        {canReview ? (
                          <>
                            <button
                              type="button"
                              className="button button--small"
                              disabled={actionKey === approveKey}
                              onClick={() => handleReviewReport(report, "approve")}
                            >
                              {actionKey === approveKey ? "Đang duyệt..." : "Phê duyệt"}
                            </button>
                            <button
                              type="button"
                              className="button button--danger button--small"
                              disabled={actionKey === rejectKey}
                              onClick={() => handleReviewReport(report, "reject")}
                            >
                              {actionKey === rejectKey ? "Đang xử lý..." : "Từ chối"}
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
