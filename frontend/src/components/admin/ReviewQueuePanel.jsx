import { useState } from "react";
import { formatDateTime, truncateText } from "../../utils/formatters";
import StatusBadge from "../common/StatusBadge";

function resolveOwnerLabel(item, mode) {
  if (mode === "project") {
    return item.leader_name ? `Chủ nhiệm: ${item.leader_name}` : null;
  }
  if (mode === "paper") {
    return item.creator_name ? `Người khai báo: ${item.creator_name}` : null;
  }
  return null;
}

export default function ReviewQueuePanel({
  title,
  description,
  items,
  mode,
  loading,
  error,
  actionKey,
  onRefresh,
  onApprove,
  onReject,
  onComplete,
}) {
  const [notes, setNotes] = useState({});

  const handleNoteChange = (itemId, value) => {
    setNotes((previous) => ({ ...previous, [itemId]: value }));
  };

  const entityMode = title.toLowerCase().includes("bài báo") ? "paper" : "project";

  return (
    <section className="panel stack-md">
      <div className="section-heading">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="section-description">{description}</p>
        </div>
        {onRefresh ? (
          <button type="button" className="button button--secondary button--small" onClick={onRefresh}>
            Làm mới
          </button>
        ) : null}
      </div>

      {loading ? <div className="inline-empty">Đang tải hàng đợi xử lý...</div> : null}
      {!loading && error ? <div className="notice notice--danger">{error}</div> : null}
      {!loading && !error && !items.length ? <div className="inline-empty">Không có hồ sơ nào trong hàng đợi này.</div> : null}

      {!loading && !error && items.length ? (
        <div className="review-list">
          {items.map((item) => {
            const titleText = item.name || item.title;
            const approveKey = `approve-${item.id}`;
            const rejectKey = `reject-${item.id}`;
            const completeKey = `complete-${item.id}`;
            const ownerLabel = resolveOwnerLabel(item, entityMode);

            return (
              <article key={item.id} className="review-item">
                <div className="review-item__header">
                  <div>
                    <div className="list-item__title-row">
                      <span className="list-item__title">{titleText}</span>
                      <StatusBadge value={item.status} />
                    </div>
                    <p className="list-item__body">
                      {item.description
                        ? truncateText(item.description, 160)
                        : truncateText(item.journal_name || item.doi || "Chưa có mô tả bổ sung.", 160)}
                    </p>
                  </div>
                </div>

                <div className="review-meta">
                  <span>{item.category_name ? `Danh mục: ${item.category_name}` : "Danh mục: —"}</span>
                  {ownerLabel ? <span>{ownerLabel}</span> : null}
                  {item.completion_requested_at ? <span>Yêu cầu hoàn thành: {formatDateTime(item.completion_requested_at)}</span> : null}
                  <span>Cập nhật lúc {formatDateTime(item.updated_at)}</span>
                </div>

                {item.review_note ? <div className="inline-note">Ghi chú hiện tại: {item.review_note}</div> : null}

                {mode === "review" ? (
                  <div className="review-form">
                    <textarea
                      className="textarea textarea--small"
                      rows="3"
                      value={notes[item.id] || ""}
                      onChange={(event) => handleNoteChange(item.id, event.target.value)}
                      placeholder="Nhập ghi chú cho quyết định phê duyệt hoặc từ chối"
                    />
                    <div className="table-actions">
                      <button
                        type="button"
                        className="button button--secondary"
                        disabled={actionKey === approveKey}
                        onClick={() => onApprove(item.id, notes[item.id] || "")}
                      >
                        {actionKey === approveKey ? "Đang duyệt..." : "Phê duyệt"}
                      </button>
                      <button
                        type="button"
                        className="button button--danger"
                        disabled={actionKey === rejectKey}
                        onClick={() => onReject(item.id, notes[item.id] || "")}
                      >
                        {actionKey === rejectKey ? "Đang từ chối..." : "Từ chối"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="table-actions">
                    <button
                      type="button"
                      className="button"
                      disabled={actionKey === completeKey}
                      onClick={() => onComplete(item.id)}
                    >
                      {actionKey === completeKey ? "Đang xác nhận..." : "Xác nhận hoàn thành"}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
