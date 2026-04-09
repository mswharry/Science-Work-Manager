import { formatNumber } from "../../utils/formatters";

export default function TopLecturers({ items = [], loading = false, error = "", onRefresh }) {
  const maxCount = Math.max(...items.map((item) => item.paper_count), 1);

  return (
    <section className="panel stack-md">
      <div className="section-heading">
        <div>
          <h2 className="section-title">Xếp hạng giảng viên</h2>
          <p className="section-description">Xếp hạng giảng viên theo số lượng bài báo trong thống kê hiện tại.</p>
        </div>
        {onRefresh ? (
          <button type="button" className="button button--secondary button--small" onClick={onRefresh}>
            Làm mới
          </button>
        ) : null}
      </div>

      {loading ? <div className="inline-empty">Đang tải bảng xếp hạng...</div> : null}
      {!loading && error ? <div className="notice notice--danger">{error}</div> : null}
      {!loading && !error && !items.length ? <div className="inline-empty">Chưa có dữ liệu xếp hạng giảng viên.</div> : null}

      {!loading && !error && items.length ? (
        <div className="ranking-list">
          {items.map((item, index) => (
            <article key={item.lecturer_id} className="ranking-row">
              <div className="ranking-row__head">
                <div className="button-row">
                  <span className="ranking-rank">#{index + 1}</span>
                  <div>
                    <div className="table-primary">{item.full_name}</div>
                    <div className="table-secondary">{item.staff_id || item.department || "Giảng viên"}</div>
                  </div>
                </div>
                <strong>{formatNumber(item.paper_count)} bài báo</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-bar__fill" style={{ width: `${(item.paper_count / maxCount) * 100}%` }} />
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
