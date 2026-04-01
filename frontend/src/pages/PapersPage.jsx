import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import MetricStrip from "../components/common/MetricStrip";
import PageHeader from "../components/common/PageHeader";
import PaperFilters from "../components/papers/PaperFilters";
import PaperList from "../components/papers/PaperList";
import { useAuth } from "../contexts/AuthContext";
import { deletePaper, listPapers } from "../services/paperService";
import { getApiErrorMessage } from "../utils/apiError";
import { countByStatus } from "../utils/formatters";

const DEFAULT_FILTERS = {
  year: "",
  status: "",
  category_id: "",
  mine: false,
};

export default function PapersPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadData = async (activeFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const data = await listPapers(activeFilters);
      setPapers(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải danh sách bài báo."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(filters);
  }, [filters]);

  const summary = useMemo(() => countByStatus(papers), [papers]);

  const handleDelete = async (paperId) => {
    const confirmed = window.confirm("Xóa bài báo này? Thao tác không thể hoàn tác.");
    if (!confirmed) {
      return;
    }

    setDeletingId(paperId);
    setError("");

    try {
      await deletePaper(paperId);
      await loadData(filters);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể xóa bài báo."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Bài báo"
        title="Quản lý bài báo khoa học"
        description="Tra cứu, lọc và quản lý các bài báo mà bạn được phép xem hoặc chỉnh sửa theo trạng thái và quyền hiện tại."
        actions={
          <Link to="/papers/new" className="button nav-button-link">
            Khai báo bài báo mới
          </Link>
        }
      />

      <MetricStrip
        items={[
          {
            label: "Tổng số hồ sơ",
            value: summary.total || 0,
            hint: "Tổng số bài báo đang hiển thị theo bộ lọc hiện tại.",
          },
          {
            label: "Chờ duyệt",
            value: summary.pending || 0,
            hint: "Hồ sơ đang trong hàng đợi xét duyệt của quản trị viên.",
          },
          {
            label: "Đã duyệt",
            value: summary.approved || 0,
            hint: "Bài báo đã qua bước phê duyệt của hệ thống.",
          },
          {
            label: "Từ chối",
            value: summary.rejected || 0,
            hint: "Các hồ sơ cần được chỉnh sửa và gửi lại.",
          },
        ]}
        columns={4}
      />

      <PaperFilters
        filters={draftFilters}
        onChange={(field, value) => setDraftFilters((previous) => ({ ...previous, [field]: value }))}
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draftFilters);
        }}
        onReset={() => {
          setDraftFilters(DEFAULT_FILTERS);
          setFilters(DEFAULT_FILTERS);
        }}
      />

      {loading ? <LoadingState title="Đang tải bài báo" message="Hệ thống đang lấy dữ liệu bài báo." /> : null}
      {!loading && error ? <ErrorState title="Không thể tải danh sách bài báo" message={error} onRetry={() => loadData(filters)} /> : null}
      {!loading && !error ? (
        <PaperList
          papers={papers}
          currentUser={user}
          deletingId={deletingId}
          onDelete={handleDelete}
          isMineView={filters.mine}
        />
      ) : null}
    </div>
  );
}
