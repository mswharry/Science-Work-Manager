import { useEffect, useState } from "react";
import { getProjectLevelStatistics, getPaperLevelStatistics } from "../../services/statisticsService";
import { getApiErrorMessage } from "../../utils/apiError";

export default function LevelStatistics() {
  const [projectLevelStats, setProjectLevelStats] = useState([]);
  const [paperLevelStats, setPaperLevelStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLevelStats = async () => {
    setLoading(true);
    setError("");

    try {
      const [projectStats, paperStats] = await Promise.all([
        getProjectLevelStatistics(),
        getPaperLevelStatistics(),
      ]);
      setProjectLevelStats(projectStats);
      setPaperLevelStats(paperStats);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải thống kê phân cấp."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLevelStats();
  }, []);

  const renderLevelPanel = (title, description, stats) => {
    const maxCount = Math.max(...stats.map((item) => item.count), 1);

    return (
      <section className="panel stack-md">
        <div className="section-heading">
          <div>
            <h2 className="section-title">{title}</h2>
            <p className="section-description">{description}</p>
          </div>
        </div>

        {!stats.length ? (
          <div className="inline-empty">Chưa có dữ liệu để hiển thị.</div>
        ) : (
          <div className="progress-list">
            {stats.map((item) => (
              <div key={item.level_id} className="progress-row">
                <div className="progress-row__head">
                  <span>{item.level_name}</span>
                  <strong>{item.count}</strong>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${(item.count / maxCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  if (loading) {
    return <div className="panel">Đang tải thống kê cấp độ...</div>;
  }

  if (error) {
    return <div className="notice notice--danger">{error}</div>;
  }

  return (
    <div className="grid grid--2">
      {renderLevelPanel(
        "Đề tài theo cấp độ",
        "Số lượng đề tài được ghi nhận theo từng cấp độ quản lý.",
        projectLevelStats,
      )}
      {renderLevelPanel(
        "Bài báo theo cấp độ",
        "Số lượng bài báo được ghi nhận theo từng cấp độ công bố.",
        paperLevelStats,
      )}
    </div>
  );
}
