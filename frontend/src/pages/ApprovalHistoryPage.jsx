import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { listApprovalHistory, getApprovalProject } from "../services/approvalService";
import { getProject } from "../services/projectService";
import { useAuth } from "../contexts/AuthContext";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDateTime, formatLabel } from "../utils/formatters";

export default function ApprovalHistoryPage() {
  const { projectId } = useParams();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const loadProject = isAdmin ? getApprovalProject : getProject;
      const [projectData, historyData] = await Promise.all([
        loadProject(projectId),
        listApprovalHistory(projectId),
      ]);
      setProject(projectData);
      setHistories(historyData);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải lịch sử xét duyệt."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId, isAdmin]);

  if (loading) {
    return <LoadingState title="Đang tải" message="Đang lấy lịch sử xét duyệt." />;
  }

  if (error) {
    return <ErrorState title="Không thể tải" message={error} onRetry={loadData} />;
  }

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Xét duyệt"
        title={`Lịch sử xét duyệt: ${project?.name || ""}`}
        description="Theo dõi toàn bộ các mốc và hành động trong quá trình xét duyệt."
        actions={
          <Link className="button button--secondary" to={isAdmin ? `/approvals/${projectId}` : `/projects/${projectId}`}>
            Quay lại
          </Link>
        }
      />

      <section className="panel">
        {!histories.length ? (
          <div className="inline-empty">Chưa có lịch sử xét duyệt.</div>
        ) : (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Hành động</th>
                  <th>Trạng thái</th>
                  <th>Người thực hiện</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {histories.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateTime(item.created_at)}</td>
                    <td>{formatLabel(item.action)}</td>
                    <td>{formatLabel(item.new_status || item.previous_status)}</td>
                    <td>{item.performed_by_name || "—"}</td>
                    <td>{item.detail || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
