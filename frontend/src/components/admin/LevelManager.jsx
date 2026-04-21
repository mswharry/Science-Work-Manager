import { useEffect, useMemo, useState } from "react";
import {
  createPaperLevel,
  createProjectLevel,
  deletePaperLevel,
  deleteProjectLevel,
  listPaperLevels,
  listProjectLevels,
  updatePaperLevel,
  updateProjectLevel,
} from "../../services/levelService";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDateTime } from "../../utils/formatters";
import FormField from "../common/FormField";

function createEmptyForm() {
  return { code: "", name: "", description: "", weight: "", points: "", is_active: true };
}

const TYPE_LABELS = {
  project: "phân cấp đề tài",
  paper: "phân cấp bài báo",
};

export default function LevelManager() {
  const [projectLevels, setProjectLevels] = useState([]);
  const [paperLevels, setPaperLevels] = useState([]);
  const [createForms, setCreateForms] = useState({
    project: createEmptyForm(),
    paper: createEmptyForm(),
  });
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionKey, setActionKey] = useState("");

  const handlers = useMemo(
    () => ({
      project: {
        list: listProjectLevels,
        create: createProjectLevel,
        update: updateProjectLevel,
        remove: deleteProjectLevel,
      },
      paper: {
        list: listPaperLevels,
        create: createPaperLevel,
        update: updatePaperLevel,
        remove: deletePaperLevel,
      },
    }),
    [],
  );

  const loadLevels = async () => {
    setLoading(true);
    setError("");

    try {
      const [projects, papers] = await Promise.all([listProjectLevels(), listPaperLevels()]);
      setProjectLevels(projects);
      setPaperLevels(papers);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải danh sách phân cấp."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLevels();
  }, []);

  const handleCreateChange = (type, field, value) => {
    setCreateForms((previous) => ({
      ...previous,
      [type]: {
        ...previous[type],
        [field]: value,
      },
    }));
  };

  const handleCreate = async (type) => {
    const key = `create-${type}`;
    setActionKey(key);
    setError("");
    setSuccess("");

    try {
      await handlers[type].create({
        code: createForms[type].code.trim(),
        name: createForms[type].name.trim(),
        description: createForms[type].description.trim() || null,
        weight: createForms[type].weight === "" ? null : Number(createForms[type].weight),
        points: createForms[type].points === "" ? null : Number(createForms[type].points),
        is_active: createForms[type].is_active,
      });
      setCreateForms((previous) => ({ ...previous, [type]: createEmptyForm() }));
      setSuccess(`Đã tạo ${TYPE_LABELS[type]} thành công.`);
      await loadLevels();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          type === "paper" ? "Không thể tạo phân cấp bài báo." : "Không thể tạo phân cấp đề tài.",
        ),
      );
    } finally {
      setActionKey("");
    }
  };

  const startEdit = (type, level) => {
    setSuccess("");
    setEditingItem({
      type,
      id: level.id,
      code: level.code,
      name: level.name,
      description: level.description || "",
      weight: level.weight ?? "",
      points: level.points ?? "",
      is_active: level.is_active,
    });
  };

  const handleEditChange = (field, value) => {
    setEditingItem((previous) => ({ ...previous, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingItem) {
      return;
    }

    const key = `save-${editingItem.type}-${editingItem.id}`;
    setActionKey(key);
    setError("");
    setSuccess("");

    try {
      await handlers[editingItem.type].update(editingItem.id, {
        code: editingItem.code.trim(),
        name: editingItem.name.trim(),
        description: editingItem.description.trim() || null,
        weight: editingItem.weight === "" ? null : Number(editingItem.weight),
        points: editingItem.points === "" ? null : Number(editingItem.points),
        is_active: editingItem.is_active,
      });
      setSuccess(`Đã cập nhật ${TYPE_LABELS[editingItem.type]} thành công.`);
      setEditingItem(null);
      await loadLevels();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          editingItem.type === "paper" ? "Không thể cập nhật phân cấp bài báo." : "Không thể cập nhật phân cấp đề tài.",
        ),
      );
    } finally {
      setActionKey("");
    }
  };

  const handleDelete = async (type, levelId) => {
    const confirmed = window.confirm("Xóa phân cấp này? Nếu phân cấp đang được sử dụng trong hồ sơ, thao tác có thể không thực hiện được.");
    if (!confirmed) {
      return;
    }

    const key = `delete-${type}-${levelId}`;
    setActionKey(key);
    setError("");
    setSuccess("");

    try {
      await handlers[type].remove(levelId);
      setSuccess(`Đã xóa ${TYPE_LABELS[type]} thành công.`);
      await loadLevels();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          type === "paper" ? "Không thể xóa phân cấp bài báo." : "Không thể xóa phân cấp đề tài.",
        ),
      );
    } finally {
      setActionKey("");
    }
  };

  const renderSection = (type, title, items) => (
    <section className="panel stack-lg">
      <div className="section-heading">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="section-description">Mã phân cấp giúp chuẩn hóa dữ liệu đầu vào và hỗ trợ thống kê theo nhóm cấp độ.</p>
        </div>
      </div>

      <div className="form-grid form-grid--3">
        <FormField label="Mã phân cấp" required>
          <input
            className="input"
            value={createForms[type].code}
            onChange={(event) => handleCreateChange(type, "code", event.target.value)}
            placeholder="Ví dụ: cap_truong"
          />
        </FormField>
        <FormField label="Tên phân cấp" required>
          <input
            className="input"
            value={createForms[type].name}
            onChange={(event) => handleCreateChange(type, "name", event.target.value)}
            placeholder="Nhập tên phân cấp"
          />
        </FormField>
        <FormField label="Mô tả">
          <input
            className="input"
            value={createForms[type].description}
            onChange={(event) => handleCreateChange(type, "description", event.target.value)}
            placeholder="Mô tả ngắn nếu cần"
          />
        </FormField>
        <FormField label="Thứ tự (weight)">
          <input
            className="input"
            type="number"
            min="0"
            value={createForms[type].weight}
            onChange={(event) => handleCreateChange(type, "weight", event.target.value)}
            placeholder="Có thể để trống"
          />
        </FormField>
        <FormField label="Điểm quy đổi">
          <input
            className="input"
            type="number"
            min="0"
            value={createForms[type].points}
            onChange={(event) => handleCreateChange(type, "points", event.target.value)}
            placeholder="Có thể để trống"
          />
        </FormField>
        <FormField label="Trạng thái">
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={createForms[type].is_active}
              onChange={(event) => handleCreateChange(type, "is_active", event.target.checked)}
            />
            <span>Kích hoạt</span>
          </label>
        </FormField>
      </div>

      <div className="button-row">
        <button
          type="button"
          className="button"
          disabled={actionKey === `create-${type}`}
          onClick={() => handleCreate(type)}
        >
          {actionKey === `create-${type}` ? "Đang tạo..." : `Tạo ${title.toLowerCase()}`}
        </button>
      </div>

      {editingItem?.type === type ? (
        <div className="inline-note stack-md">
          <div className="section-heading">
            <div>
              <h3 className="section-title">Chỉnh sửa phân cấp: {editingItem.name}</h3>
              <p className="section-description">Cập nhật thông tin hiển thị và trạng thái sử dụng của phân cấp đang chọn.</p>
            </div>
          </div>
          <div className="form-grid form-grid--3">
            <FormField label="Mã phân cấp" required>
              <input className="input" value={editingItem.code} onChange={(event) => handleEditChange("code", event.target.value)} />
            </FormField>
            <FormField label="Tên phân cấp" required>
              <input className="input" value={editingItem.name} onChange={(event) => handleEditChange("name", event.target.value)} />
            </FormField>
            <FormField label="Mô tả">
              <input className="input" value={editingItem.description} onChange={(event) => handleEditChange("description", event.target.value)} />
            </FormField>
            <FormField label="Thứ tự (weight)">
              <input className="input" type="number" min="0" value={editingItem.weight} onChange={(event) => handleEditChange("weight", event.target.value)} />
            </FormField>
            <FormField label="Điểm quy đổi">
              <input className="input" type="number" min="0" value={editingItem.points} onChange={(event) => handleEditChange("points", event.target.value)} />
            </FormField>
            <FormField label="Trạng thái">
              <label className="checkbox-inline">
                <input type="checkbox" checked={editingItem.is_active} onChange={(event) => handleEditChange("is_active", event.target.checked)} />
                <span>Kích hoạt</span>
              </label>
            </FormField>
          </div>
          <div className="button-row">
            <button
              type="button"
              className="button"
              disabled={actionKey === `save-${editingItem.type}-${editingItem.id}`}
              onClick={handleSaveEdit}
            >
              {actionKey === `save-${editingItem.type}-${editingItem.id}` ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button type="button" className="button button--secondary" onClick={() => setEditingItem(null)}>
              Hủy
            </button>
          </div>
        </div>
      ) : null}

      {!items.length ? (
        <div className="inline-empty">Chưa có phân cấp nào cho nhóm này.</div>
      ) : (
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã</th>
                <th>Tên phân cấp</th>
                <th>Thứ tự</th>
                <th>Điểm</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((level) => (
                <tr key={level.id}>
                  <td>#{level.id}</td>
                  <td>{level.code}</td>
                  <td>
                    <div className="table-primary">{level.name}</div>
                    <div className="table-secondary">{level.description || "Không có mô tả"}</div>
                  </td>
                  <td>{level.weight ?? "—"}</td>
                  <td>{level.points ?? "—"}</td>
                  <td>{level.is_active ? "Kích hoạt" : "Tắt"}</td>
                  <td>{formatDateTime(level.updated_at)}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="button button--secondary button--small" onClick={() => startEdit(type, level)}>
                        Chỉnh sửa
                      </button>
                      <button
                        type="button"
                        className="button button--danger button--small"
                        disabled={actionKey === `delete-${type}-${level.id}`}
                        onClick={() => handleDelete(type, level.id)}
                      >
                        {actionKey === `delete-${type}-${level.id}` ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  return (
    <section className="stack-lg">
      {error ? <div className="notice notice--danger">{error}</div> : null}
      {success ? <div className="notice notice--success">{success}</div> : null}

      {loading ? (
        <div className="panel">
          <p>Đang tải dữ liệu phân cấp...</p>
        </div>
      ) : (
        <>
          {renderSection("project", "Phân cấp đề tài", projectLevels)}
          {renderSection("paper", "Phân cấp bài báo", paperLevels)}
        </>
      )}
    </section>
  );
}
