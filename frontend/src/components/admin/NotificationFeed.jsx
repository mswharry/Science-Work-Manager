import { formatDateTime, truncateText } from "../../utils/formatters";
import StatusBadge from "../common/StatusBadge";

export default function NotificationFeed({
  title = "Thông báo",
  description = "Danh sách thông báo hiện tại của hệ thống.",
  items = [],
  loading = false,
  error = "",
  onRefresh,
  compact = false,
  limit,
}) {
  const visibleItems = limit ? items.slice(0, limit) : items;

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

      {loading ? <div className="inline-empty">Đang tải thông báo...</div> : null}
      {!loading && error ? <div className="notice notice--danger">{error}</div> : null}
      {!loading && !error && !visibleItems.length ? (
        <div className="inline-empty">Chưa có thông báo nào phù hợp với tài khoản hiện tại.</div>
      ) : null}

      {!loading && !error && visibleItems.length ? (
        <div className="list-stack">
          {visibleItems.map((item) => (
            <article key={item.id} className="list-item">
              <div className="list-item__header">
                <div>
                  <div className="list-item__title-row">
                    <span className="list-item__title">{item.title}</span>
                    <StatusBadge value={item.target_role || "all"} />
                  </div>
                  <p className="list-item__body">
                    {compact ? truncateText(item.content, 150) : item.content}
                  </p>
                </div>
              </div>
              <div className="list-item__meta">
                <span>Thông báo #{item.id}</span>
                <span>Phát hành lúc {formatDateTime(item.created_at)}</span>
                <span>{item.is_active ? "Đang hiển thị" : "Đã ẩn"}</span>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
