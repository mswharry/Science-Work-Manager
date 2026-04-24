import { useEffect, useMemo, useState } from "react";
import LevelStatistics from "../components/admin/LevelStatistics";
import NotificationFeed from "../components/admin/NotificationFeed";
import TopLecturers from "../components/admin/TopLecturers";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import MetricStrip from "../components/common/MetricStrip";
import PageHeader from "../components/common/PageHeader";
import { useAuth } from "../contexts/AuthContext";
import { listNotifications } from "../services/notificationService";
import { listPapers } from "../services/paperService";
import { listProjects } from "../services/projectService";
import { getDashboardStats, getTopLecturers } from "../services/statisticsService";
import { getApiErrorMessage } from "../utils/apiError";
import { countByStatus, formatLabel } from "../utils/formatters";

function BreakdownPanel({ title, description, rows = [], kind = "status" }) {
  const maxCount = Math.max(...rows.map((row) => row.count), 1);

  return (
    <section className="panel stack-md">
      <div className="section-heading">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="section-description">{description}</p>
        </div>
      </div>

      {!rows.length ? (
        <div className="inline-empty">Chưa có dữ liệu để hiển thị.</div>
      ) : (
        <div className="progress-list">
          {rows.map((row) => (
            <div key={kind === "status" ? row.status : row.year} className="progress-row">
              <div className="progress-row__head">
                <span>{kind === "status" ? formatLabel(row.status) : `Năm ${row.year}`}</span>
                <strong>{row.count}</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-bar__fill" style={{ width: `${(row.count / maxCount) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [topLecturers, setTopLecturers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [personalProjects, setPersonalProjects] = useState([]);
  const [personalPapers, setPersonalPapers] = useState([]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      if (isAdmin) {
        const [statsData, lecturerData, notificationData] = await Promise.all([
          getDashboardStats(),
          getTopLecturers(),
          listNotifications(),
        ]);
        setStats(statsData);
        setTopLecturers(lecturerData);
        setNotifications(notificationData);
        setPersonalProjects([]);
        setPersonalPapers([]);
      } else {
        const [projectData, paperData, lecturerData, notificationData] = await Promise.all([
          listProjects({ mine: true }),
          listPapers({ mine: true }),
          getTopLecturers(),
          listNotifications(),
        ]);
        setPersonalProjects(projectData);
        setPersonalPapers(paperData);
        setTopLecturers(lecturerData);
        setNotifications(notificationData);
        setStats(null);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải bảng điều khiển."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [isAdmin]);

  const personalProjectSummary = useMemo(() => countByStatus(personalProjects), [personalProjects]);
  const personalPaperSummary = useMemo(() => countByStatus(personalPapers), [personalPapers]);

  if (loading) {
    return <LoadingState title="Đang tải bảng điều khiển" message="Hệ thống đang tổng hợp số liệu cho bạn." />;
  }

  if (error) {
    return <ErrorState title="Không thể tải bảng điều khiển" message={error} onRetry={loadDashboardData} />;
  }

  if (isAdmin) {
    const pendingProjects = stats?.project_counts_by_status?.find((item) => item.status === "pending")?.count || 0;
    const pendingPapers = stats?.paper_counts_by_status?.find((item) => item.status === "pending")?.count || 0;

    return (
      <div className="stack-xl">
        <PageHeader
          eyebrow="Bảng điều khiển"
          title="Báo cáo điều hành hệ thống"
          description="Theo dõi số liệu tổng hợp về người dùng, đề tài, bài báo và hoạt động nghiên cứu khoa học trên toàn hệ thống."
          actions={
            <button type="button" className="button button--secondary" onClick={loadDashboardData}>
              Làm mới dữ liệu
            </button>
          }
        />

        <MetricStrip
          items={[
            {
              label: "Tổng người dùng",
              value: stats?.total_users || 0,
              hint: "Số tài khoản đang tồn tại trong cơ sở dữ liệu.",
            },
            {
              label: "Tổng đề tài",
              value: stats?.total_projects || 0,
              hint: "Tổng số hồ sơ đề tài đã được khai báo.",
            },
            {
              label: "Tổng bài báo",
              value: stats?.total_papers || 0,
              hint: "Tổng số hồ sơ bài báo có trong hệ thống.",
            },
            {
              label: "Hồ sơ chờ duyệt",
              value: pendingProjects + pendingPapers,
              hint: "Bao gồm cả đề tài và bài báo đang chờ xử lý.",
            },
          ]}
          columns={4}
        />

        <div className="grid grid--2">
          <BreakdownPanel
            title="Phân bố đề tài theo trạng thái"
            description="Số lượng đề tài theo từng trạng thái xử lý hiện tại."
            rows={stats?.project_counts_by_status || []}
          />
          <BreakdownPanel
            title="Phân bố bài báo theo trạng thái"
            description="Số lượng bài báo theo từng trạng thái xử lý hiện tại."
            rows={stats?.paper_counts_by_status || []}
          />
        </div>

        <div className="grid grid--2">
          <BreakdownPanel
            title="Sản lượng đề tài theo năm"
            description="Xu hướng số lượng đề tài được ghi nhận theo từng năm."
            rows={stats?.yearly_project_counts || []}
            kind="year"
          />
          <BreakdownPanel
            title="Sản lượng bài báo theo năm"
            description="Xu hướng số lượng bài báo được ghi nhận theo từng năm."
            rows={stats?.yearly_paper_counts || []}
            kind="year"
          />
        </div>

        <LevelStatistics />

        <div className="grid grid--2">
          <TopLecturers items={topLecturers} onRefresh={loadDashboardData} />
          <NotificationFeed
            title="Thông báo hệ thống"
            description="Danh sách thông báo đang hiển thị cho tài khoản quản trị viên."
            items={notifications}
            limit={5}
            onRefresh={loadDashboardData}
          />
        </div>
      </div>
    );
  }

  const actionableCount = (personalProjectSummary.pending || 0) + (personalPaperSummary.pending || 0);
  const approvedCount =
    (personalProjectSummary.approved || 0) + (personalProjectSummary.completed || 0) + (personalPaperSummary.approved || 0);

  const projectRows = Object.entries(personalProjectSummary)
    .filter(([key]) => key !== "total")
    .map(([status, count]) => ({ status, count }));
  const paperRows = Object.entries(personalPaperSummary)
    .filter(([key]) => key !== "total")
    .map(([status, count]) => ({ status, count }));

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Bảng điều khiển"
        title="Bảng điều khiển cá nhân"
        description="Theo dõi tiến độ xử lý hồ sơ nghiên cứu của bạn và các thông tin tổng hợp quan trọng từ hệ thống."
        actions={
          <button type="button" className="button button--secondary" onClick={loadDashboardData}>
            Làm mới dữ liệu
          </button>
        }
      />

      <MetricStrip
        items={[
          {
            label: "Đề tài của tôi",
            value: personalProjectSummary.total || 0,
            hint: "Tổng số đề tài cá nhân đang theo dõi.",
          },
          {
            label: "Bài báo của tôi",
            value: personalPaperSummary.total || 0,
            hint: "Tổng số hồ sơ bài báo đã khai báo.",
          },
          {
            label: "Đang chờ duyệt",
            value: actionableCount,
            hint: "Các hồ sơ đang nằm trong hàng đợi xử lý.",
          },
          {
            label: "Đã duyệt / hoàn thành",
            value: approvedCount,
            hint: "Các hồ sơ đã được duyệt hoặc đã hoàn tất quy trình.",
          },
        ]}
        columns={4}
      />

      <div className="grid grid--2">
        <BreakdownPanel
          title="Đề tài theo trạng thái"
          description="Số lượng đề tài cá nhân theo từng trạng thái xử lý."
          rows={projectRows}
        />
        <BreakdownPanel
          title="Bài báo theo trạng thái"
          description="Số lượng bài báo cá nhân theo từng trạng thái xử lý."
          rows={paperRows}
        />
      </div>

      <div className="grid grid--2">
        <TopLecturers items={topLecturers} onRefresh={loadDashboardData} />
        <NotificationFeed
          title="Thông báo hệ thống"
          description="Thông báo mới áp dụng cho tài khoản hiện tại của bạn."
          items={notifications}
          limit={5}
          onRefresh={loadDashboardData}
        />
      </div>
    </div>
  );
}
