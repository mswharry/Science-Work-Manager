import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NotificationFeed from "../components/admin/NotificationFeed";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import MetricStrip from "../components/common/MetricStrip";
import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import { listNotifications } from "../services/notificationService";
import { listPapers } from "../services/paperService";
import { listProjects } from "../services/projectService";
import { listUsers } from "../services/userService";
import { getApiErrorMessage } from "../utils/apiError";
import { countByStatus, sortByDateDesc, truncateText } from "../utils/formatters";

const publicModules = [
  "Tiếp nhận và theo dõi đề tài nghiên cứu theo quy trình phê duyệt hiện hành.",
  "Khai báo hồ sơ bài báo khoa học với DOI, nơi công bố và trạng thái xử lý.",
  "Điều hành tài khoản, thông báo và hàng đợi phê duyệt cho quản trị viên.",
];

const publicWorkflow = [
  "Tạo tài khoản sinh viên hoặc giảng viên theo đúng vai trò sử dụng.",
  "Khai báo đề tài hoặc bài báo sau khi đăng nhập thành công.",
  "Theo dõi trạng thái xử lý và bổ sung thông tin khi có phản hồi.",
  "Nhận thông báo hệ thống về thời hạn, yêu cầu hồ sơ và thay đổi quy trình.",
];

const workflowNotes = {
  admin: [
    "Phê duyệt tài khoản giảng viên mới trước khi cấp quyền truy cập đầy đủ.",
    "Rà soát đề tài và bài báo đang ở trạng thái chờ duyệt trong khu vực quản trị.",
    "Cập nhật thông báo nội bộ khi có thay đổi về biểu mẫu, mốc thời gian hoặc quy trình.",
  ],
  lecturer: [
    "Theo dõi các hồ sơ đang chờ duyệt để bổ sung thông tin khi được yêu cầu.",
    "Điều chỉnh hồ sơ bị từ chối và gửi lại để tiếp tục quy trình phê duyệt.",
    "Sử dụng bảng điều khiển để theo dõi tiến độ xử lý và số liệu tổng hợp cá nhân.",
  ],
  student: [
    "Theo dõi đề tài và bài báo cá nhân trực tiếp từ trang chủ hoặc bảng điều khiển.",
    "Khi hồ sơ bị từ chối, chỉnh sửa theo ghi chú rồi gửi lại từ màn hình cập nhật.",
    "Kiểm tra thông báo thường xuyên để không bỏ lỡ hạn nộp hoặc yêu cầu bổ sung.",
  ],
};

const roleActions = {
  admin: [
    { to: "/admin", label: "Mở khu vực quản trị", description: "Phê duyệt tài khoản, hồ sơ và quản lý danh mục hệ thống." },
    { to: "/dashboard", label: "Xem báo cáo tổng hợp", description: "Theo dõi số liệu toàn hệ thống và bảng xếp hạng giảng viên." },
    { to: "/projects", label: "Tra cứu đề tài", description: "Rà soát đề tài theo trạng thái, năm thực hiện hoặc từ khóa." },
    { to: "/papers", label: "Tra cứu bài báo", description: "Kiểm tra hồ sơ bài báo và các ghi chú xử lý liên quan." },
  ],
  lecturer: [
    { to: "/projects/new", label: "Tạo đề tài mới", description: "Khởi tạo hồ sơ đề tài nghiên cứu và gửi vào quy trình phê duyệt." },
    { to: "/papers/new", label: "Khai báo bài báo", description: "Tạo hồ sơ bài báo hoặc công bố khoa học mới." },
    { to: "/projects", label: "Quản lý đề tài", description: "Theo dõi đề tài do bạn phụ trách và trạng thái xét duyệt." },
    { to: "/papers", label: "Quản lý bài báo", description: "Rà soát hồ sơ bài báo, DOI và phản hồi từ quản trị viên." },
  ],
  student: [
    { to: "/projects/new", label: "Đăng ký đề tài", description: "Khởi tạo hồ sơ đề tài nghiên cứu mới trên hệ thống." },
    { to: "/papers/new", label: "Khai báo bài báo", description: "Cập nhật hồ sơ bài báo và theo dõi kết quả xử lý." },
    { to: "/projects", label: "Xem đề tài của tôi", description: "Lọc danh sách đề tài cá nhân và kiểm tra trạng thái hiện tại." },
    { to: "/papers", label: "Xem bài báo của tôi", description: "Tra cứu bài báo đã khai báo và các lần cập nhật gần đây." },
  ],
};

function PreviewList({ title, description, items, type, emptyMessage }) {
  const prefix = type === "project" ? "/projects" : "/papers";

  return (
    <section className="panel stack-md">
      <div className="section-heading">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="section-description">{description}</p>
        </div>
      </div>

      {!items.length ? (
        <div className="inline-empty">{emptyMessage}</div>
      ) : (
        <div className="list-stack">
          {items.map((item) => {
            const heading = type === "project" ? item.name : item.title;
            const metaText =
              type === "project"
                ? truncateText(item.description || "Chưa có mô tả chi tiết.", 140)
                : truncateText(item.journal_name || item.doi || "Chưa có thông tin nơi công bố.", 140);

            return (
              <article key={item.id} className="list-item">
                <div className="list-item__header">
                  <div>
                    <div className="list-item__title-row">
                      <Link to={`${prefix}/${item.id}`} className="list-item__title">
                        {heading}
                      </Link>
                      <StatusBadge value={item.status} />
                    </div>
                    <p className="list-item__body">{metaText}</p>
                  </div>
                </div>
                <div className="list-item__meta">
                  <span>Hồ sơ #{item.id}</span>
                  <span>Danh mục #{item.category_id}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [papers, setPapers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [pendingPapers, setPendingPapers] = useState([]);

  const loadHomeData = async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setProjects([]);
      setPapers([]);
      setPendingUsers([]);
      setPendingProjects([]);
      setPendingPapers([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isAdmin) {
        const [notificationData, usersData, projectData, paperData] = await Promise.all([
          listNotifications(),
          listUsers({ is_approved: "false" }),
          listProjects({ status: "pending" }),
          listPapers({ status: "pending" }),
        ]);

        setNotifications(notificationData);
        setPendingUsers(usersData);
        setPendingProjects(projectData);
        setPendingPapers(paperData);
        setProjects([]);
        setPapers([]);
      } else {
        const [notificationData, projectData, paperData] = await Promise.all([
          listNotifications(),
          listProjects({ mine: true }),
          listPapers({ mine: true }),
        ]);

        setNotifications(notificationData);
        setProjects(projectData);
        setPapers(paperData);
        setPendingUsers([]);
        setPendingProjects([]);
        setPendingPapers([]);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải dữ liệu trang chủ."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, [isAuthenticated, isAdmin]);

  const projectSummary = useMemo(() => countByStatus(projects), [projects]);
  const paperSummary = useMemo(() => countByStatus(papers), [papers]);
  const pendingProjectSummary = useMemo(() => countByStatus(pendingProjects), [pendingProjects]);
  const pendingPaperSummary = useMemo(() => countByStatus(pendingPapers), [pendingPapers]);

  const recentProjects = useMemo(() => sortByDateDesc(isAdmin ? pendingProjects : projects).slice(0, 4), [isAdmin, pendingProjects, projects]);
  const recentPapers = useMemo(() => sortByDateDesc(isAdmin ? pendingPapers : papers).slice(0, 4), [isAdmin, pendingPapers, papers]);

  const quickActions = roleActions[user?.role] || [];
  const notes = workflowNotes[user?.role] || [];

  if (!isAuthenticated) {
    return (
      <div className="stack-xl">
        <PageHeader
          eyebrow="Cổng truy cập hệ thống"
          title="Hệ thống quản lý nghiên cứu khoa học"
          description="Nền tảng phục vụ tiếp nhận hồ sơ, theo dõi phê duyệt đề tài và bài báo, đồng thời hỗ trợ quản trị thông báo nội bộ cho hoạt động nghiên cứu khoa học."
          actions={
            <div className="button-row">
              <Link to="/login" className="button nav-button-link">
                Đăng nhập
              </Link>
              <Link to="/register" className="button button--secondary nav-button-link">
                Đăng ký tài khoản
              </Link>
            </div>
          }
        />

        <section className="panel home-public-grid">
          <div className="stack-lg">
            <div>
              <h2 className="section-title">Phạm vi chức năng</h2>
              <p className="section-description">
                Hệ thống được thiết kế cho quy trình quản lý đề tài, công bố khoa học và điều hành hồ sơ theo vai trò.
              </p>
            </div>
            <ul className="simple-list">
              {publicModules.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="surface-divider" />

            <div>
              <h2 className="section-title">Quy trình sử dụng cơ bản</h2>
              <ol className="workflow-list">
                {publicWorkflow.map((step) => (
                  <li key={step}>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="stack-lg">
            <div>
              <h2 className="section-title">Lưu ý đăng ký</h2>
              <p className="section-description">Chuẩn bị đúng loại thông tin theo vai trò để quá trình tiếp nhận tài khoản diễn ra thuận lợi.</p>
            </div>
            <ul className="simple-list">
              <li>Mỗi tài khoản cần một địa chỉ email duy nhất.</li>
              <li>Sinh viên cần khai báo mã sinh viên khi đăng ký.</li>
              <li>Giảng viên cần khai báo mã cán bộ và chờ phê duyệt trước khi đăng nhập.</li>
              <li>Các chức năng hiển thị sau đăng nhập phụ thuộc vào vai trò của tài khoản.</li>
            </ul>

            <div className="surface-divider" />

            <div className="stack-md">
              <div>
                <h2 className="section-title">Truy cập hệ thống</h2>
                <p className="section-description">Nếu đã có tài khoản, bạn có thể đăng nhập ngay để tiếp tục làm việc với hồ sơ nghiên cứu.</p>
              </div>
              <div className="button-row">
                <Link to="/login" className="button nav-button-link">
                  Đi tới đăng nhập
                </Link>
                <Link to="/register" className="button button--secondary nav-button-link">
                  Tạo tài khoản mới
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const pendingCount = (projectSummary.pending || 0) + (paperSummary.pending || 0);
  const rejectedCount = (projectSummary.rejected || 0) + (paperSummary.rejected || 0);
  const overviewMetrics = isAdmin
    ? [
        {
          label: "Tài khoản chờ duyệt",
          value: pendingUsers.length,
          hint: "Ưu tiên xử lý các tài khoản giảng viên mới đăng ký.",
        },
        {
          label: "Đề tài chờ duyệt",
          value: pendingProjectSummary.total || 0,
          hint: "Các hồ sơ đề tài đang nằm trong hàng đợi phê duyệt.",
        },
        {
          label: "Bài báo chờ duyệt",
          value: pendingPaperSummary.total || 0,
          hint: "Các bài báo mới nộp cần được rà soát và phản hồi.",
        },
        {
          label: "Thông báo hiện hành",
          value: notifications.length,
          hint: "Số thông báo đang được hiển thị cho người dùng phù hợp.",
        },
      ]
    : [
        {
          label: "Đề tài của tôi",
          value: projectSummary.total || 0,
          hint: "Tổng số đề tài cá nhân đang được lưu trên hệ thống.",
        },
        {
          label: "Bài báo của tôi",
          value: paperSummary.total || 0,
          hint: "Tổng số hồ sơ bài báo bạn đã khai báo.",
        },
        {
          label: "Hồ sơ chờ duyệt",
          value: pendingCount,
          hint: "Bao gồm đề tài và bài báo đang trong hàng đợi xử lý.",
        },
        {
          label: "Cần chỉnh sửa",
          value: rejectedCount,
          hint: "Các hồ sơ bị từ chối có thể cập nhật và gửi lại.",
        },
      ];

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Trang chủ"
        title={`Xin chào, ${user?.full_name || "người dùng"}`}
        description={
          isAdmin
            ? "Đây là màn hình tổng quan vận hành hiện tại của hệ thống. Các số liệu và danh sách dưới đây giúp bạn ưu tiên xử lý những hồ sơ cần phê duyệt."
            : "Đây là không gian tổng quan cá nhân, tập trung vào hồ sơ gần đây, thông báo mới và những công việc cần theo dõi trong phiên làm việc hiện tại."
        }
        actions={
          <div className="button-row">
            <Link to="/dashboard" className="button nav-button-link">
              Mở bảng điều khiển
            </Link>
            {isAdmin ? (
              <Link to="/admin" className="button button--secondary nav-button-link">
                Khu vực quản trị
              </Link>
            ) : (
              <Link to="/profile" className="button button--secondary nav-button-link">
                Thông tin tài khoản
              </Link>
            )}
          </div>
        }
      />

      {loading ? <LoadingState title="Đang tải trang chủ" message="Hệ thống đang tổng hợp dữ liệu mới nhất." /> : null}
      {!loading && error ? <ErrorState title="Không thể tải trang chủ" message={error} onRetry={loadHomeData} /> : null}

      {!loading && !error ? (
        <>
          <MetricStrip items={overviewMetrics} columns={4} />

          <section className="panel home-workspace">
            <div className="stack-lg">
              <div>
                <h2 className="section-title">Công việc ưu tiên</h2>
                <p className="section-description">Các lối tắt được sắp theo vai trò hiện tại để bạn truy cập nhanh vào khu vực đang cần xử lý.</p>
              </div>

              <div className="action-list">
                {quickActions.map((action) => (
                  <Link key={action.label} to={action.to} className="action-item">
                    <div className="action-item__content">
                      <span className="action-item__title">{action.label}</span>
                      <span className="action-item__description">{action.description}</span>
                    </div>
                    <span className="button button--secondary button--small nav-button-link">Mở</span>
                  </Link>
                ))}
              </div>

              <div className="surface-divider" />

              <div>
                <h2 className="section-title">Lưu ý vận hành</h2>
                <ul className="simple-list">
                  {notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="stack-lg">
              <div>
                <h2 className="section-title">Phiên đăng nhập hiện tại</h2>
                <p className="section-description">Các trạng thái tài khoản và quyền sử dụng được áp dụng cho phiên làm việc này.</p>
              </div>

              <div className="status-summary">
                <div className="status-summary__row">
                  <span>Vai trò</span>
                  <StatusBadge value={user?.role} kind="role" />
                </div>
                <div className="status-summary__row">
                  <span>Kích hoạt</span>
                  <StatusBadge value={user?.is_active} kind="active" />
                </div>
                <div className="status-summary__row">
                  <span>Phê duyệt</span>
                  <StatusBadge value={user?.is_approved ? "approved" : "pending"} />
                </div>
              </div>

              <div className="surface-divider" />

              <div>
                <h2 className="section-title">Nhắc việc</h2>
                {isAdmin ? (
                  <ul className="simple-list">
                    <li>Kiểm tra tài khoản giảng viên mới và xử lý phê duyệt trong mục Quản trị.</li>
                    <li>Rà soát đề tài, bài báo đang chờ duyệt và cập nhật ghi chú phản hồi khi cần.</li>
                    <li>Phát hành thông báo nếu có thay đổi về thời hạn hoặc yêu cầu hồ sơ.</li>
                  </ul>
                ) : (
                  <ul className="simple-list">
                    <li>Kiểm tra các hồ sơ đang chờ duyệt để bổ sung thông tin khi được yêu cầu.</li>
                    <li>Chỉnh sửa và nộp lại các hồ sơ bị từ chối sau khi đã hoàn thiện nội dung.</li>
                    <li>Theo dõi thông báo mới để nắm rõ quy định và mốc thời gian tiếp nhận hồ sơ.</li>
                  </ul>
                )}
              </div>
            </div>
          </section>

          <div className="grid grid--2">
            <PreviewList
              title={isAdmin ? "Đề tài cần xử lý" : "Đề tài gần đây"}
              description={
                isAdmin
                  ? "Danh sách đề tài đang chờ duyệt để xử lý trong khu vực quản trị."
                  : "Các đề tài cá nhân vừa được cập nhật gần đây nhất."
              }
              items={recentProjects}
              type="project"
              emptyMessage={isAdmin ? "Không có đề tài nào trong hàng đợi phê duyệt." : "Bạn chưa có đề tài nào."}
            />
            <PreviewList
              title={isAdmin ? "Bài báo cần xử lý" : "Bài báo gần đây"}
              description={
                isAdmin
                  ? "Danh sách bài báo đang chờ duyệt để xử lý trong khu vực quản trị."
                  : "Các bài báo cá nhân vừa được cập nhật gần đây nhất."
              }
              items={recentPapers}
              type="paper"
              emptyMessage={isAdmin ? "Không có bài báo nào trong hàng đợi phê duyệt." : "Bạn chưa có bài báo nào."}
            />
          </div>

          <NotificationFeed
            title="Thông báo mới"
            description="Danh sách thông báo được hiển thị theo vai trò của tài khoản hiện tại."
            items={notifications}
            compact
            limit={6}
            onRefresh={loadHomeData}
          />
        </>
      ) : null}
    </div>
  );
}
