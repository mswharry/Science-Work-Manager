import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import CategoryManager from "../components/admin/CategoryManager";
import LevelManager from "../components/admin/LevelManager";
import RegistrationPeriodManager from "../components/admin/RegistrationPeriodManager";
import NotificationComposer from "../components/admin/NotificationComposer";
import NotificationFeed from "../components/admin/NotificationFeed";
import ReviewQueuePanel from "../components/admin/ReviewQueuePanel";
import UserManagementPanel from "../components/admin/UserManagementPanel";
import MetricStrip from "../components/common/MetricStrip";
import PageHeader from "../components/common/PageHeader";
import { listNotifications } from "../services/notificationService";
import { listPapers, reviewPaper } from "../services/paperService";
import { completeProject, listProjects, reviewProject } from "../services/projectService";
import { getApiErrorMessage } from "../utils/apiError";

const tabs = [
  { key: "users", label: "Người dùng" },
  { key: "projects", label: "Duyệt đề tài" },
  { key: "papers", label: "Duyệt bài báo" },
  { key: "categories", label: "Danh mục" },
  { key: "levels", label: "Phân cấp" },
  { key: "registration-periods", label: "Đợt đăng ký" },
  { key: "notifications", label: "Thông báo" },
];

export default function AdminPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => location.state?.activeTab || "users");
  const [pendingProjects, setPendingProjects] = useState([]);
  const [completionRequests, setCompletionRequests] = useState([]);
  const [pendingPapers, setPendingPapers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [queueLoading, setQueueLoading] = useState({ projects: true, papers: true });
  const [queueError, setQueueError] = useState({ projects: "", papers: "" });
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState("");
  const [actionKey, setActionKey] = useState("");

  const loadProjectQueues = async () => {
    setQueueLoading((previous) => ({ ...previous, projects: true }));
    setQueueError((previous) => ({ ...previous, projects: "" }));

    try {
      const [pendingData, completionData] = await Promise.all([
        listProjects({ status: "pending" }),
        listProjects({ status: "approved", completion_requested: true }),
      ]);
      setPendingProjects(pendingData);
      setCompletionRequests(completionData);
    } catch (requestError) {
      setQueueError((previous) => ({
        ...previous,
        projects: getApiErrorMessage(requestError, "Không thể tải hàng đợi đề tài."),
      }));
    } finally {
      setQueueLoading((previous) => ({ ...previous, projects: false }));
    }
  };

  const loadPaperQueue = async () => {
    setQueueLoading((previous) => ({ ...previous, papers: true }));
    setQueueError((previous) => ({ ...previous, papers: "" }));

    try {
      const data = await listPapers({ status: "pending" });
      setPendingPapers(data);
    } catch (requestError) {
      setQueueError((previous) => ({
        ...previous,
        papers: getApiErrorMessage(requestError, "Không thể tải hàng đợi bài báo."),
      }));
    } finally {
      setQueueLoading((previous) => ({ ...previous, papers: false }));
    }
  };

  const loadNotificationsData = async () => {
    setNotificationsLoading(true);
    setNotificationsError("");

    try {
      const data = await listNotifications();
      setNotifications(data);
    } catch (requestError) {
      setNotificationsError(getApiErrorMessage(requestError, "Không thể tải thông báo."));
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    loadProjectQueues();
    loadPaperQueue();
    loadNotificationsData();
  }, []);

  const handleProjectReview = async (projectId, action, note) => {
    const key = `${action}-${projectId}`;
    setActionKey(key);

    try {
      await reviewProject(projectId, {
        action,
        note: note.trim() || null,
      });
      await loadProjectQueues();
    } catch (requestError) {
      setQueueError((previous) => ({
        ...previous,
        projects: getApiErrorMessage(requestError, "Không thể cập nhật trạng thái đề tài."),
      }));
    } finally {
      setActionKey("");
    }
  };

  const handleProjectComplete = async (projectId) => {
    const confirmed = window.confirm("Xác nhận hoàn thành đề tài này? Quyết định sẽ kết thúc quy trình của hồ sơ.");
    if (!confirmed) {
      return;
    }

    const key = `complete-${projectId}`;
    setActionKey(key);

    try {
      await completeProject(projectId);
      await loadProjectQueues();
    } catch (requestError) {
      setQueueError((previous) => ({
        ...previous,
        projects: getApiErrorMessage(requestError, "Không thể đánh dấu hoàn thành đề tài."),
      }));
    } finally {
      setActionKey("");
    }
  };

  const handlePaperReview = async (paperId, action, note) => {
    const key = `${action}-${paperId}`;
    setActionKey(key);

    try {
      await reviewPaper(paperId, {
        action,
        note: note.trim() || null,
      });
      await loadPaperQueue();
    } catch (requestError) {
      setQueueError((previous) => ({
        ...previous,
        papers: getApiErrorMessage(requestError, "Không thể cập nhật trạng thái bài báo."),
      }));
    } finally {
      setActionKey("");
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        label: "Đề tài chờ duyệt",
        value: pendingProjects.length,
        hint: "Các đề tài đang chờ quyết định phê duyệt hoặc từ chối.",
      },
      {
        label: "Yêu cầu hoàn thành",
        value: completionRequests.length,
        hint: "Các đề tài đã gửi yêu cầu xác nhận hoàn thành tới quản trị viên.",
      },
      {
        label: "Bài báo chờ duyệt",
        value: pendingPapers.length,
        hint: "Các hồ sơ bài báo đang đợi rà soát từ quản trị viên.",
      },
      {
        label: "Thông báo hiện hành",
        value: notifications.length,
        hint: "Thông báo đang được hiển thị cho người dùng phù hợp.",
      },
    ],
    [completionRequests.length, notifications.length, pendingPapers.length, pendingProjects.length],
  );

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Quản trị"
        title="Điều hành và phê duyệt hệ thống"
        description="Xử lý tài khoản, duyệt hồ sơ, quản lý danh mục và phát hành thông báo nội bộ cho hoạt động nghiên cứu khoa học."
        actions={
          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              loadProjectQueues();
              loadPaperQueue();
              loadNotificationsData();
            }}
          >
            Làm mới toàn bộ
          </button>
        }
      />

      <MetricStrip items={summaryCards} columns={4} />

      <div className="tab-switcher">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-button ${activeTab === tab.key ? "tab-button--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "users" ? <UserManagementPanel /> : null}

      {activeTab === "projects" ? (
        <div className="stack-lg">
          <ReviewQueuePanel
            title="Hồ sơ đề tài chờ duyệt"
            description="Phê duyệt hoặc từ chối các hồ sơ đề tài mới gửi lên hệ thống."
            items={pendingProjects}
            mode="review"
            loading={queueLoading.projects}
            error={queueError.projects}
            actionKey={actionKey}
            onRefresh={loadProjectQueues}
            onApprove={(projectId, note) => handleProjectReview(projectId, "approve", note)}
            onReject={(projectId, note) => handleProjectReview(projectId, "reject", note)}
          />

          <ReviewQueuePanel
            title="Đề tài chờ xác nhận hoàn thành"
            description="Chỉ các đề tài đã được chủ nhiệm gửi yêu cầu hoàn thành mới xuất hiện trong danh sách này."
            items={completionRequests}
            mode="complete"
            loading={queueLoading.projects}
            error={queueError.projects}
            actionKey={actionKey}
            onRefresh={loadProjectQueues}
            onComplete={handleProjectComplete}
          />
        </div>
      ) : null}

      {activeTab === "papers" ? (
        <ReviewQueuePanel
          title="Hồ sơ bài báo chờ duyệt"
          description="Phê duyệt hoặc từ chối các hồ sơ bài báo mới nộp vào hệ thống."
          items={pendingPapers}
          mode="review"
          loading={queueLoading.papers}
          error={queueError.papers}
          actionKey={actionKey}
          onRefresh={loadPaperQueue}
          onApprove={(paperId, note) => handlePaperReview(paperId, "approve", note)}
          onReject={(paperId, note) => handlePaperReview(paperId, "reject", note)}
        />
      ) : null}

      {activeTab === "categories" ? <CategoryManager /> : null}

      {activeTab === "levels" ? <LevelManager /> : null}

      {activeTab === "registration-periods" ? <RegistrationPeriodManager /> : null}

      {activeTab === "notifications" ? (
        <div className="grid grid--2">
          <NotificationComposer onCreated={loadNotificationsData} />
          <NotificationFeed
            title="Thông báo hiện hành"
            description="Theo dõi các thông báo đang được hiển thị cho người dùng trong hệ thống."
            items={notifications}
            loading={notificationsLoading}
            error={notificationsError}
            onRefresh={loadNotificationsData}
          />
        </div>
      ) : null}
    </div>
  );
}
