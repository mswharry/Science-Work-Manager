export default function MetricStrip({ items = [], columns, compact = false }) {
  const safeColumns = Math.min(Math.max(columns || items.length || 1, 1), 4);

  return (
    <section className={`panel metric-strip metric-strip--${safeColumns}${compact ? " metric-strip--compact" : ""}`}>
      {items.map((item) => (
        <article key={item.label} className="metric-item">
          <span className="metric-item__label">{item.label}</span>
          <strong className="metric-item__value">{item.value}</strong>
          {item.hint ? <p className="metric-item__hint">{item.hint}</p> : null}
        </article>
      ))}
    </section>
  );
}
