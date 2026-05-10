import { useEffect, useMemo, useState } from "react";
import {
  closeRegistrationPeriod,
  createRegistrationPeriod,
  deleteRegistrationPeriod,
  listRegistrationPeriods,
  openRegistrationPeriod,
  updateRegistrationPeriod,
} from "../../services/registrationPeriodService";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDate, formatDateTime } from "../../utils/formatters";
import FormField from "../common/FormField";

function createEmptyForm() {
  return {
    title: "",
    registration_start: "",
    registration_end: "",
    description: "",
    requirements: "",
    is_open: true,
  };
}

export default function RegistrationPeriodManager() {
  const [periods, setPeriods] = useState([]);
  const [createForm, setCreateForm] = useState(createEmptyForm());
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionKey, setActionKey] = useState("");

  const openPeriod = useMemo(() => periods.find((period) => period.is_open), [periods]);

  const loadPeriods = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await listRegistrationPeriods();
      setPeriods(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải danh sách đợt đăng ký."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  const handleCreateChange = (field, value) => {
    setCreateForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleCreate = async () => {
    const key = "create";
    setActionKey(key);
    setError("");
    setSuccess("");

    try {
      await createRegistrationPeriod({
        title: createForm.title.trim(),
        registration_start: createForm.registration_start || null,
        registration_end: createForm.registration_end || null,
        description: createForm.description.trim() || null,
        requirements: createForm.requirements.trim() || null,
        is_open: createForm.is_open,
      });
      setCreateForm(createEmptyForm());
      setSuccess("Đã tạo đợt đăng ký thành công.");
      await loadPeriods();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tạo đợt đăng ký."));
    } finally {
      setActionKey("");
    }
  };

  const startEdit = (period) => {
    setSuccess("");
    setEditingPeriod({
      id: period.id,
      title: period.title,
      registration_start: period.registration_start || "",
      registration_end: period.registration_end || "",
      description: period.description || "",
      requirements: period.requirements || "",
      is_open: period.is_open,
    });
  };

  const handleEditChange = (field, value) => {
    setEditingPeriod((previous) => ({ ...previous, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingPeriod) {
      return;
    }

    const key = `save-${editingPeriod.id}`;
    setActionKey(key);
    setError("");
    setSuccess("");

    try {
      await updateRegistrationPeriod(editingPeriod.id, {
        title: editingPeriod.title.trim(),
        registration_start: editingPeriod.registration_start || null,
        registration_end: editingPeriod.registration_end || null,
        description: editingPeriod.description.trim() || null,
        requirements: editingPeriod.requirements.trim() || null,
        is_open: editingPeriod.is_open,
      });
      setEditingPeriod(null);
      setSuccess("Đã cập nhật đợt đăng ký thành công.");
      await loadPeriods();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể cập nhật đợt đăng ký."));
    } finally {
      setActionKey("");
    }
  };

  const handleToggleStatus = async (period) => {
    const key = `toggle-${period.id}`;
    setActionKey(key);
    setError("");
    setSuccess("");

    try {
      if (period.is_open) {
        await closeRegistrationPeriod(period.id);
        setSuccess("Đã đóng đợt đăng ký.");
      } else {
        await openRegistrationPeriod(period.id);
        setSuccess("Đã mở đợt đăng ký.");
      }
      await loadPeriods();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể thay đổi trạng thái đợt đăng ký."));
    } finally {
      setActionKey("");
    }
  };

  const handleDelete = async (periodId) => {
    const confirmed = window.confirm("Xóa đợt đăng ký này? Nếu đợt đã gắn với hồ sơ đề tài, hệ thống sẽ không cho phép xóa.");
    if (!confirmed) {
      return;
    }

    const key = `delete-${periodId}`;
    setActionKey(key);
    setError("");
    setSuccess("");

    try {
      await deleteRegistrationPeriod(periodId);
      setSuccess("Đã xóa đợt đăng ký.");
      await loadPeriods();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể xóa đợt đăng ký."));
    } finally {
      setActionKey("");
    }
  };

  return (
    <section className="stack-lg">
      {error ? <div className="notice notice--danger">{error}</div> : null}
      {success ? <div className="notice notice--success">{success}</div> : null}

      <section className="panel stack-lg">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Tạo đợt đăng ký</h2>
            <p className="section-description">
              Chỉ quản trị viên mới được thêm và điều chỉnh đợt đăng ký. Mỗi đợt có thể được mở hoặc đóng độc lập, không ảnh hưởng đến
              các đợt khác.
            </p>
          </div>
          <div className="inline-note">
            Đợt đang mở gần nhất: {openPeriod ? openPeriod.title : "Không có"}
          </div>
        </div>

        <div className="form-grid form-grid--2">
          <FormField label="Tên đợt" required>
            <input
              className="input"
              value={createForm.title}
              onChange={(event) => handleCreateChange("title", event.target.value)}
              placeholder="Ví dụ: Đợt đăng ký học kỳ 2 - 2026"
            />
          </FormField>
          <div className="field period-toggle-field">
            <span className="field__label">Trạng thái</span>
            <label className="period-toggle">
              <input
                type="checkbox"
                checked={createForm.is_open}
                onChange={(event) => handleCreateChange("is_open", event.target.checked)}
              />
              <span>Mở ngay sau khi tạo</span>
            </label>
          </div>
          <FormField label="Ngày bắt đầu">
            <input
              className="input"
              type="date"
              value={createForm.registration_start}
              onChange={(event) => handleCreateChange("registration_start", event.target.value)}
            />
          </FormField>
          <FormField label="Ngày kết thúc">
            <input
              className="input"
              type="date"
              value={createForm.registration_end}
              onChange={(event) => handleCreateChange("registration_end", event.target.value)}
            />
          </FormField>
          <FormField label="Mô tả">
            <textarea
              className="textarea"
              rows="3"
              value={createForm.description}
              onChange={(event) => handleCreateChange("description", event.target.value)}
              placeholder="Mô tả ngắn cho đợt đăng ký"
            />
          </FormField>
          <FormField label="Yêu cầu">
            <textarea
              className="textarea"
              rows="3"
              value={createForm.requirements}
              onChange={(event) => handleCreateChange("requirements", event.target.value)}
              placeholder="Các điều kiện hoặc lưu ý áp dụng"
            />
          </FormField>
        </div>

        <div className="button-row">
          <button type="button" className="button" disabled={actionKey === "create"} onClick={handleCreate}>
            {actionKey === "create" ? "Đang tạo..." : "Tạo đợt đăng ký"}
          </button>
        </div>
      </section>

      {editingPeriod ? (
        <section className="panel stack-lg">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Chỉnh sửa đợt đăng ký: {editingPeriod.title}</h2>
              <p className="section-description">Cập nhật nội dung và trạng thái hiển thị của đợt đăng ký đang chọn.</p>
            </div>
          </div>

          <div className="form-grid form-grid--2">
            <FormField label="Tên đợt" required>
              <input className="input" value={editingPeriod.title} onChange={(event) => handleEditChange("title", event.target.value)} />
            </FormField>
            <div className="field period-toggle-field">
              <span className="field__label">Trạng thái</span>
              <label className="period-toggle">
                <input
                  type="checkbox"
                  checked={editingPeriod.is_open}
                  onChange={(event) => handleEditChange("is_open", event.target.checked)}
                />
                <span>Mở đợt</span>
              </label>
            </div>
            <FormField label="Ngày bắt đầu">
              <input
                className="input"
                type="date"
                value={editingPeriod.registration_start}
                onChange={(event) => handleEditChange("registration_start", event.target.value)}
              />
            </FormField>
            <FormField label="Ngày kết thúc">
              <input
                className="input"
                type="date"
                value={editingPeriod.registration_end}
                onChange={(event) => handleEditChange("registration_end", event.target.value)}
              />
            </FormField>
            <FormField label="Mô tả">
              <textarea
                className="textarea"
                rows="3"
                value={editingPeriod.description}
                onChange={(event) => handleEditChange("description", event.target.value)}
              />
            </FormField>
            <FormField label="Yêu cầu">
              <textarea
                className="textarea"
                rows="3"
                value={editingPeriod.requirements}
                onChange={(event) => handleEditChange("requirements", event.target.value)}
              />
            </FormField>
          </div>

          <div className="button-row">
            <button
              type="button"
              className="button"
              disabled={actionKey === `save-${editingPeriod.id}`}
              onClick={handleSaveEdit}
            >
              {actionKey === `save-${editingPeriod.id}` ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button type="button" className="button button--secondary" onClick={() => setEditingPeriod(null)}>
              Hủy
            </button>
          </div>
        </section>
      ) : null}

      {loading ? (
        <div className="panel">
          <p>Đang tải danh sách đợt đăng ký...</p>
        </div>
      ) : periods.length ? (
        <section className="panel stack-md">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Danh sách đợt đăng ký</h2>
              <p className="section-description">Mở hoặc đóng đợt để kiểm soát thời điểm giảng viên có thể tạo hồ sơ đề tài.</p>
            </div>
          </div>

          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên đợt</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Mô tả</th>
                  <th>Cập nhật</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period.id}>
                    <td>#{period.id}</td>
                    <td>
                      <div className="table-primary">{period.title}</div>
                      <div className="table-secondary">{period.requirements || "Không có yêu cầu riêng"}</div>
                    </td>
                    <td>
                      {formatDate(period.registration_start)} - {formatDate(period.registration_end)}
                    </td>
                    <td>{period.is_open ? "Đang mở" : "Đã đóng"}</td>
                    <td>{period.description || "—"}</td>
                    <td>{formatDateTime(period.updated_at)}</td>
                    <td>
                      <div className="period-actions">
                        <button type="button" className="button button--secondary button--small period-actions__edit" onClick={() => startEdit(period)}>
                          Chỉnh sửa
                        </button>
                        <div className="period-actions__row">
                          <button
                            type="button"
                            className="button button--subtle button--small"
                            disabled={actionKey === `toggle-${period.id}`}
                            onClick={() => handleToggleStatus(period)}
                          >
                            {actionKey === `toggle-${period.id}` ? "Đang xử lý..." : period.is_open ? "Đóng đợt" : "Mở đợt"}
                          </button>
                          <button
                            type="button"
                            className="button button--danger button--small"
                            disabled={actionKey === `delete-${period.id}`}
                            onClick={() => handleDelete(period.id)}
                          >
                            {actionKey === `delete-${period.id}` ? "Đang xóa..." : "Xóa"}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="panel">
          <p>Chưa có đợt đăng ký nào trong hệ thống.</p>
        </div>
      )}
    </section>
  );
}
