import { useState } from "react";
import { formatDate, formatDateTime, truncateText } from "../../utils/formatters";
import StatusBadge from "../common/StatusBadge";
import FormField from "../common/FormField";

function canManageTaskBoard(project, currentUser) {
  return Boolean(
    currentUser &&
      project &&
      project.status === "approved" &&
      (currentUser.role === "admin" || currentUser.id === project.leader_id),
  );
}

function canSubmitTask(task, project, currentUser) {
  if (!task || !project || !currentUser) return false;
  if (project.status !== "approved") return false;
  const isLeaderOrAdmin = currentUser.role === "admin" || currentUser.id === project.leader_id;
  const isAssignee = task.assignee_id && task.assignee_id === currentUser.id;
  return (isLeaderOrAdmin || isAssignee) && ["todo", "rejected"].includes(task.status);
}

export default function ProjectTaskBoard({
  project,
  currentUser,
  tasks,
  loading,
  error,
  onRefresh,
  onCreateTask,
  onSubmitTask,
  onReviewTask,
  actionKey,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignee_id: "",
    due_date: "",
  });

  const canManage = canManageTaskBoard(project, currentUser);

  const handleCreate = async (event) => {
    event.preventDefault();
    await onCreateTask({
      title: form.title.trim(),
      description: form.description.trim() || null,
      assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
      due_date: form.due_date || null,
    });
    setForm({ title: "", description: "", assignee_id: "", due_date: "" });
  };

  const handleSubmitTask = async (task) => {
    const note = window.prompt("Nhập mô tả kết quả nộp task (có thể để trống):", task.submission_note || "");
    if (note === null) return;
    await onSubmitTask(task.id, { submission_note: note.trim() || null });
  };

  const handleReviewTask = async (task, action) => {
    const label = action === "approve" ? "phê duyệt" : "yêu cầu làm lại";
    const note = window.prompt(`Nhập ghi chú khi ${label} task:`, task.review_note || "");
    if (note === null) return;
    await onReviewTask(task.id, { action, note: note.trim() || null });
  };

  return (
    <section className="panel stack-md">
      <div className="section-heading">
        <div>
          <h2 className="section-title">Task board</h2>
          <p className="section-description">
            Quản lý công việc sau duyệt đề tài: giao task, nộp kết quả và leader duyệt theo trạng thái todo - in_review - done.
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
              <h3 className="section-title">Tạo task mới</h3>
              <p className="section-description">Leader/admin tạo và gán người phụ trách theo user_id nội bộ.</p>
            </div>
          </div>

          <div className="form-grid form-grid--2">
            <FormField label="Tiêu đề task" required>
              <input
                className="input"
                value={form.title}
                onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                placeholder="Ví dụ: Hoàn thiện module xử lý dữ liệu"
                required
              />
            </FormField>

            <FormField label="User ID người phụ trách">
              <input
                className="input"
                type="number"
                min="1"
                value={form.assignee_id}
                onChange={(event) => setForm((previous) => ({ ...previous, assignee_id: event.target.value }))}
                placeholder="Có thể để trống"
              />
            </FormField>

            <FormField label="Deadline">
              <input
                className="input"
                type="date"
                value={form.due_date}
                onChange={(event) => setForm((previous) => ({ ...previous, due_date: event.target.value }))}
              />
            </FormField>

            <FormField label="Mô tả">
              <input
                className="input"
                value={form.description}
                onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
                placeholder="Ghi chú phạm vi công việc"
              />
            </FormField>
          </div>

          <div className="button-row">
            <button type="submit" className="button" disabled={actionKey === "create-task"}>
              {actionKey === "create-task" ? "Đang tạo..." : "Tạo task"}
            </button>
          </div>
        </form>
      ) : null}

      {loading ? <div className="inline-empty">Đang tải task board...</div> : null}
      {!loading && error ? <div className="notice notice--danger">{error}</div> : null}
      {!loading && !error && !tasks.length ? <div className="inline-empty">Chưa có task nào cho đề tài này.</div> : null}

      {!loading && !error && tasks.length ? (
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Người phụ trách</th>
                <th>Deadline</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const canSubmit = canSubmitTask(task, project, currentUser);
                const canReview = canManage && task.status === "in_review";
                const submitKey = `submit-task-${task.id}`;
                const approveKey = `review-approve-task-${task.id}`;
                const rejectKey = `review-reject-task-${task.id}`;

                return (
                  <tr key={task.id}>
                    <td>
                      <div className="table-primary">{task.title}</div>
                      {task.description ? <div className="table-secondary">{truncateText(task.description, 120)}</div> : null}
                      {task.submission_note ? <div className="table-note">Nội dung nộp: {truncateText(task.submission_note, 120)}</div> : null}
                      {task.review_note ? <div className="table-note">Ghi chú duyệt: {truncateText(task.review_note, 120)}</div> : null}
                    </td>
                    <td>{task.assignee_name || (task.assignee_id ? `User #${task.assignee_id}` : "Chưa gán")}</td>
                    <td>
                      <div>{formatDate(task.due_date)}</div>
                      {task.is_overdue ? <div className="table-note">Quá hạn</div> : null}
                    </td>
                    <td>
                      <StatusBadge value={task.status} />
                    </td>
                    <td>{formatDateTime(task.updated_at)}</td>
                    <td>
                      <div className="table-actions">
                        {canSubmit ? (
                          <button
                            type="button"
                            className="button button--secondary button--small"
                            disabled={actionKey === submitKey}
                            onClick={() => handleSubmitTask(task)}
                          >
                            {actionKey === submitKey ? "Đang nộp..." : "Nộp task"}
                          </button>
                        ) : null}

                        {canReview ? (
                          <>
                            <button
                              type="button"
                              className="button button--small"
                              disabled={actionKey === approveKey}
                              onClick={() => handleReviewTask(task, "approve")}
                            >
                              {actionKey === approveKey ? "Đang duyệt..." : "Duyệt done"}
                            </button>
                            <button
                              type="button"
                              className="button button--danger button--small"
                              disabled={actionKey === rejectKey}
                              onClick={() => handleReviewTask(task, "reject")}
                            >
                              {actionKey === rejectKey ? "Đang xử lý..." : "Yêu cầu làm lại"}
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
