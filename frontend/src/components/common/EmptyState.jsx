export default function EmptyState({
  title = "Chưa có dữ liệu",
  message = "Nội dung sẽ xuất hiện khi hệ thống có dữ liệu phù hợp.",
  action,
}) {
  return (
    <div className="state-card panel state-card--empty">
      <div className="state-card__icon" aria-hidden="true">
        ☐
      </div>
      <div className="state-card__content">
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
      {action ? <div className="state-card__actions">{action}</div> : null}
    </div>
  );
}
