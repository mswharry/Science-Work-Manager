export default function LoadingState({
  title = "Đang tải dữ liệu",
  message = "Vui lòng chờ trong giây lát.",
  fullHeight = false,
}) {
  return (
    <div className={`state-card panel ${fullHeight ? "state-card--full" : ""}`}>
      <div className="loader" aria-hidden="true" />
      <div className="state-card__content">
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </div>
  );
}
