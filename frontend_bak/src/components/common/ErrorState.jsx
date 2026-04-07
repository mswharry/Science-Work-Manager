export default function ErrorState({
  title = "Không thể tải dữ liệu",
  message,
  onRetry,
  retryLabel = "Tải lại",
}) {
  return (
    <div className="state-card panel state-card--error">
      <div className="state-card__icon" aria-hidden="true">
        !
      </div>
      <div className="state-card__content">
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
      {onRetry ? (
        <button type="button" className="button button--secondary" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
