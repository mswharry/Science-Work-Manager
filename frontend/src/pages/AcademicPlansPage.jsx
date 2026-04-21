import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import MetricStrip from "../components/common/MetricStrip";
import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import {
  activateAcademicPlan,
  closeAcademicPlan,
  createAcademicPlan,
  deleteAcademicPlan,
  listAcademicPlans,
  updateAcademicPlan,
} from "../services/academicPlanService";
import { uploadAcademicPlanSheet } from "../services/uploadService";
import { getApiErrorMessage } from "../utils/apiError";
import { PLAN_STATUS_OPTIONS } from "../utils/constants";
import { formatDateTime, sortByDateDesc, truncateText } from "../utils/formatters";

const emptyForm = {
  academic_year: "",
  title: "",
  description: "",
  status: "draft",
};

function buildPlanErrorMessage(error, fallback) {
  const message = getApiErrorMessage(error, fallback);
  const planMessageMap = {
    "Academic year must use the format YYYY-YYYY.": "Năm học phải theo định dạng YYYY-YYYY.",
    "Academic year must span exactly one school year.": "Năm học phải kết thúc bằng năm bắt đầu + 1.",
    "Academic plan for this year already exists.": "Kế hoạch cho năm học này đã tồn tại.",
    "Academic plan not found.": "Không tìm thấy kế hoạch.",
    "Active academic plan must be closed before deletion.": "Cần đóng kế hoạch đang hoạt động trước khi xóa.",
    "Academic plan sheet file is required.": "Vui lòng tải lên file sheet kế hoạch trước khi tạo mới.",
  };

  return planMessageMap[message] || message;
}

function PlanCard({ plan, isAdmin, onEdit, onActivate, onClose, onDelete }) {
  return (
    <article className="panel stack-md">
      <div className="section-heading">
        <div className="stack-xs">
          <div className="list-item__title-row">
            <h3 className="section-title">{plan.academic_year}</h3>
            <StatusBadge value={plan.status} />
          </div>
          <p className="section-description">{plan.title}</p>
        </div>
        {isAdmin ? (
          <div className="button-row">
            <button type="button" className="button button--secondary button--small" onClick={() => onEdit(plan)}>
              Sửa
            </button>
            {plan.status !== "active" ? (
              <button type="button" className="button button--small" onClick={() => onActivate(plan.id)}>
                Kích hoạt
              </button>
            ) : (
              <button type="button" className="button button--secondary button--small" onClick={() => onClose(plan.id)}>
                Đóng
              </button>
            )}
            <button type="button" className="button button--ghost button--small" onClick={() => onDelete(plan.id, plan.status)}>
              Xóa
            </button>
          </div>
        ) : null}
      </div>

      <p className="list-item__body">{truncateText(plan.description || "Chưa có mô tả kế hoạch.", 220)}</p>

      <div className="list-item__meta">
        <span>Tập tin: {plan.sheet_file_name || "Chưa tải lên"}</span>
        <span>Cập nhật: {formatDateTime(plan.updated_at)}</span>
        <span>Tạo lúc: {formatDateTime(plan.created_at)}</span>
      </div>

      {plan.sheet_file_url ? (
        <a href={plan.sheet_file_url} target="_blank" rel="noreferrer" className="button button--secondary button--small nav-button-link">
          Mở file sheet
        </a>
      ) : null}
    </article>
  );
}

export default function AcademicPlansPage() {
  const { user, isAdmin } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formMessage, setFormMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const loadPlans = async () => {
    setLoading(true);
    setError("");
    setActionMessage("");

    try {
      const data = await listAcademicPlans();
      setPlans(data);
    } catch (requestError) {
      setError(buildPlanErrorMessage(requestError, "Không thể tải danh sách kế hoạch."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const metrics = useMemo(
    () => [
      {
        label: "Tổng kế hoạch",
        value: plans.length,
        hint: "Toàn bộ kế hoạch năm học đã được lưu trong hệ thống.",
      },
      {
        label: "Đang áp dụng",
        value: plans.filter((plan) => plan.status === "active").length,
        hint: "Kế hoạch đang được xem là bản hiện hành.",
      },
      {
        label: "Bản nháp",
        value: plans.filter((plan) => plan.status === "draft").length,
        hint: "Kế hoạch đã tạo nhưng chưa được kích hoạt.",
      },
      {
        label: "Đã đóng",
        value: plans.filter((plan) => plan.status === "closed").length,
        hint: "Kế hoạch đã khóa để lưu trữ hoặc thay thế.",
      },
    ],
    [plans],
  );

  const sortedPlans = useMemo(() => sortByDateDesc(plans, "updated_at"), [plans]);

  const resetForm = () => {
    setEditingPlan(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setFormMessage("");
    setActionMessage("");
  };

  const startEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      academic_year: plan.academic_year || "",
      title: plan.title || "",
      description: plan.description || "",
      status: plan.status || "draft",
    });
    setSelectedFile(null);
    setFormMessage("");
    setActionMessage("");
  };

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const preparePayload = async () => {
    let sheetData = {};

    if (selectedFile) {
      const uploadedSheet = await uploadAcademicPlanSheet(selectedFile);
      sheetData = {
        sheet_file_name: uploadedSheet.file_name,
        sheet_file_url: uploadedSheet.file_url,
        sheet_file_content_type: uploadedSheet.content_type,
      };
    } else if (editingPlan) {
      sheetData = {
        sheet_file_name: editingPlan.sheet_file_name,
        sheet_file_url: editingPlan.sheet_file_url,
        sheet_file_content_type: editingPlan.sheet_file_content_type,
      };
    }

    return {
      academic_year: form.academic_year.trim(),
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      ...sheetData,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormMessage("");

    try {
      if (!selectedFile && !editingPlan) {
        setFormMessage("Vui lòng chọn file sheet kế hoạch trước khi tạo mới.");
        return;
      }

      const payload = await preparePayload();
      if (editingPlan) {
        await updateAcademicPlan(editingPlan.id, payload);
      } else {
        await createAcademicPlan(payload);
      }

      await loadPlans();
      resetForm();
      setActionMessage(editingPlan ? "Đã cập nhật kế hoạch." : "Đã tạo kế hoạch mới.");
    } catch (requestError) {
      setFormMessage(buildPlanErrorMessage(requestError, "Không thể lưu kế hoạch."));
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (planId) => {
    try {
      await activateAcademicPlan(planId);
      await loadPlans();
      setActionMessage("Đã kích hoạt kế hoạch.");
    } catch (requestError) {
      setActionMessage(buildPlanErrorMessage(requestError, "Không thể kích hoạt kế hoạch."));
    }
  };

  const handleClose = async (planId) => {
    try {
      await closeAcademicPlan(planId);
      await loadPlans();
      setActionMessage("Đã đóng kế hoạch.");
    } catch (requestError) {
      setActionMessage(buildPlanErrorMessage(requestError, "Không thể đóng kế hoạch."));
    }
  };

  const handleDelete = async (planId, status) => {
    if (status === "active") {
      setError("Kế hoạch đang áp dụng cần được đóng trước khi xóa.");
      return;
    }

    const confirmed = window.confirm("Xóa kế hoạch này? Thao tác sẽ gỡ dữ liệu kế hoạch khỏi hệ thống.");
    if (!confirmed) {
      return;
    }

    try {
      await deleteAcademicPlan(planId);
      await loadPlans();
      setActionMessage("Đã xóa kế hoạch.");
      if (editingPlan?.id === planId) {
        resetForm();
      }
    } catch (requestError) {
      setActionMessage(buildPlanErrorMessage(requestError, "Không thể xóa kế hoạch."));
    }
  };

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Kế hoạch năm học"
        title="Trang quản lý kế hoạch"
        description="Mỗi kế hoạch gắn với một file sheet mẫu để admin tạo, sửa, kích hoạt hoặc đóng theo năm học. Các tài khoản khác chỉ được xem."
        actions={
          isAdmin ? (
            <div className="button-row">
              <a href="/templates/academic-plan-template.csv" download className="button button--secondary nav-button-link">
                Tải sheet mẫu
              </a>
              <button type="button" className="button" onClick={resetForm}>
                Tạo kế hoạch
              </button>
            </div>
          ) : null
        }
      />

      <MetricStrip items={metrics} columns={4} />

      {actionMessage ? <div className="inline-empty">{actionMessage}</div> : null}

      {loading ? <LoadingState title="Đang tải kế hoạch" message="Hệ thống đang đồng bộ các file sheet kế hoạch." /> : null}
      {!loading && error ? <ErrorState title="Không thể tải kế hoạch" message={error} onRetry={loadPlans} /> : null}

      {!loading && !error ? (
        <div className="stack-xl">
          {isAdmin ? (
            <section className="panel stack-lg">
              <div className="section-heading">
                <div>
                  <h2 className="section-title">{editingPlan ? "Chỉnh sửa kế hoạch" : "Tạo kế hoạch mới"}</h2>
                  <p className="section-description">
                    {editingPlan ? "Cập nhật thông tin và file sheet kế hoạch tương ứng." : "Điền thông tin năm học rồi tải lên file sheet mẫu để tạo kế hoạch."}
                  </p>
                </div>
              </div>

              <form className="grid grid--2" onSubmit={handleSubmit}>
                <label className="field">
                  <span className="field__label">Năm học</span>
                  <input
                    className="input"
                    value={form.academic_year}
                    onChange={(event) => handleChange("academic_year", event.target.value)}
                    placeholder="2026-2027"
                  />
                </label>

                <label className="field">
                  <span className="field__label">Trạng thái</span>
                  <select className="input" value={form.status} onChange={(event) => handleChange("status", event.target.value)}>
                    {PLAN_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field field--full">
                  <span className="field__label">Tiêu đề kế hoạch</span>
                  <input
                    className="input"
                    value={form.title}
                    onChange={(event) => handleChange("title", event.target.value)}
                    placeholder="Kế hoạch hoạt động năm học 2026-2027"
                  />
                </label>

                <label className="field field--full">
                  <span className="field__label">Mô tả</span>
                  <textarea
                    className="input"
                    rows={4}
                    value={form.description}
                    onChange={(event) => handleChange("description", event.target.value)}
                    placeholder="Mô tả ngắn về mục tiêu, mốc thời gian hoặc ưu tiên trong năm học."
                  />
                </label>

                <label className="field field--full">
                  <span className="field__label">File sheet kế hoạch</span>
                  <input className="input" type="file" accept=".csv,.xls,.xlsx" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
                  <small className="field__help">
                    {editingPlan && !selectedFile ? `Đang giữ file hiện tại: ${editingPlan.sheet_file_name || "chưa có file"}` : "Chọn file CSV/Excel theo mẫu để đính kèm kế hoạch."}
                  </small>
                </label>

                <div className="field field--full button-row">
                  <button type="submit" className="button" disabled={saving}>
                    {saving ? "Đang lưu..." : editingPlan ? "Cập nhật kế hoạch" : "Tạo kế hoạch"}
                  </button>
                  <button type="button" className="button button--secondary" onClick={resetForm} disabled={saving}>
                    Làm mới form
                  </button>
                </div>
              </form>

              {formMessage ? <p className="inline-feedback">{formMessage}</p> : null}
            </section>
          ) : null}

          <section className="stack-md">
            <div className="section-heading">
              <div>
                <h2 className="section-title">Danh sách kế hoạch</h2>
                <p className="section-description">Tất cả tài khoản đã đăng nhập đều có thể xem và theo dõi trạng thái hiện hành. Sheet mẫu chỉ dành cho admin.</p>
              </div>
            </div>

            <div className="list-stack">
              {sortedPlans.length ? (
                sortedPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isAdmin={isAdmin}
                    onEdit={startEdit}
                    onActivate={handleActivate}
                    onClose={handleClose}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <div className="inline-empty">
                  Chưa có kế hoạch nào trong hệ thống. {isAdmin ? "Bạn có thể tạo kế hoạch đầu tiên từ form phía trên." : "Vui lòng quay lại sau khi admin cập nhật."}
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}

      <section className="panel stack-md">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Dành cho người xem</h2>
            <p className="section-description">
              {user?.role === "admin"
                ? "Quản trị viên có thể chỉnh sửa trực tiếp file sheet kế hoạch ngay trên trang này."
                : "Bạn chỉ có quyền xem nội dung kế hoạch. Việc tải sheet mẫu và thêm kế hoạch chỉ dành cho admin."}
            </p>
          </div>
        </div>
        <div className="button-row">
          <Link to="/dashboard" className="button button--secondary nav-button-link">
            Mở bảng điều khiển
          </Link>
          {isAdmin ? (
            <Link to="/admin" className="button button--ghost nav-button-link">
              Đi đến khu quản trị
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
