import MetricStrip from "../common/MetricStrip";

export default function ProjectExecutionOverview({ overview, loading, error, onRefresh }) {
  return (
    <section className="panel stack-md">
      <div className="section-heading">
        <div>
          <h2 className="section-title">Tiến độ triển khai đề tài</h2>
          <p className="section-description">
            Tỷ lệ hoàn thành được tính theo công thức done_tasks / total_tasks và cảnh báo quá hạn theo deadline thực tế.
          </p>
        </div>
        <button type="button" className="button button--secondary button--small" onClick={onRefresh}>
          Làm mới
        </button>
      </div>

      {loading ? <div className="inline-empty">Đang tải tiến độ triển khai...</div> : null}
      {!loading && error ? <div className="notice notice--danger">{error}</div> : null}

      {!loading && !error && overview ? (
        <>
          <MetricStrip
            compact
            columns={4}
            items={[
              { label: "Tiến độ", value: `${overview.progress_percent}%`, hint: `${overview.done_tasks}/${overview.total_tasks} task hoàn thành` },
              { label: "Task quá hạn", value: overview.overdue_task_count, hint: "Task chưa done nhưng đã quá hạn" },
              { label: "Báo cáo quá hạn", value: overview.overdue_report_count, hint: "Mốc báo cáo bị overdue" },
              { label: "Cờ quá hạn", value: overview.is_project_overdue ? "Có" : "Không", hint: "Theo quy tắc UC-36" },
            ]}
          />

          <div className="stack-sm">
            <div className="progress-row__head">
              <span>Tỷ lệ hoàn thành</span>
              <strong>{overview.progress_percent}%</strong>
            </div>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: `${Math.min(Math.max(overview.progress_percent, 0), 100)}%` }} />
            </div>
          </div>

          {overview.warning_messages?.length ? (
            <div className="notice notice--warning">
              <strong>Cảnh báo:</strong>
              <ul className="simple-list">
                {overview.warning_messages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="notice notice--success">Chưa phát hiện cảnh báo quá hạn nào cho đề tài này.</div>
          )}
        </>
      ) : null}
    </section>
  );
}
