import { useEffect, useMemo, useState } from "react";
import {
  createPaperCategory,
  createProjectCategory,
  deletePaperCategory,
  deleteProjectCategory,
  listPaperCategories,
  listProjectCategories,
  updatePaperCategory,
  updateProjectCategory,
} from "../../services/categoryService";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDateTime } from "../../utils/formatters";
import FormField from "../common/FormField";

function createEmptyForm() {
  return { name: "", description: "", points: "" };
}

export default function CategoryManager() {
  const [projectCategories, setProjectCategories] = useState([]);
  const [paperCategories, setPaperCategories] = useState([]);
  const [createForms, setCreateForms] = useState({
    project: createEmptyForm(),
    paper: createEmptyForm(),
  });
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionKey, setActionKey] = useState("");

  const handlers = useMemo(
    () => ({
      project: {
        list: listProjectCategories,
        create: createProjectCategory,
        update: updateProjectCategory,
        remove: deleteProjectCategory,
      },
      paper: {
        list: listPaperCategories,
        create: createPaperCategory,
        update: updatePaperCategory,
        remove: deletePaperCategory,
      },
    }),
    [],
  );

  const loadCategories = async () => {
    setLoading(true);
    setError("");

    try {
      const [projects, papers] = await Promise.all([listProjectCategories(), listPaperCategories()]);
      setProjectCategories(projects);
      setPaperCategories(papers);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải danh mục."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
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

    try {
      await handlers[type].create({
        name: createForms[type].name.trim(),
        description: createForms[type].description.trim() || null,
        points: createForms[type].points === "" ? null : Number(createForms[type].points),
      });
      setCreateForms((previous) => ({ ...previous, [type]: createEmptyForm() }));
      await loadCategories();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tạo danh mục."));
    } finally {
      setActionKey("");
    }
  };

  const startEdit = (type, category) => {
    setEditingItem({
      type,
      id: category.id,
      name: category.name,
      description: category.description || "",
      points: category.points ?? "",
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

    try {
      await handlers[editingItem.type].update(editingItem.id, {
        name: editingItem.name.trim(),
        description: editingItem.description.trim() || null,
        points: editingItem.points === "" ? null : Number(editingItem.points),
      });
      setEditingItem(null);
      await loadCategories();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể cập nhật danh mục."));
    } finally {
      setActionKey("");
    }
  };

  const handleDelete = async (type, categoryId) => {
    const confirmed = window.confirm("Xóa danh mục này? Nếu danh mục đang được sử dụng trong hồ sơ, thao tác có thể không thực hiện được.");
    if (!confirmed) {
      return;
    }

    const key = `delete-${type}-${categoryId}`;
    setActionKey(key);
    setError("");

    try {
      await handlers[type].remove(categoryId);
      await loadCategories();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể xóa danh mục."));
    } finally {
      setActionKey("");
    }
  };

  const renderSection = (type, title, items) => (
    <section className="panel stack-lg">
      <div className="section-heading">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="section-description">Mã danh mục ở cột ID có thể được dùng trong các biểu mẫu nhập thủ công khi người dùng chưa có danh sách chọn sẵn.</p>
        </div>
      </div>

      <div className="form-grid form-grid--3">
        <FormField label="Tên danh mục" required>
          <input
            className="input"
            value={createForms[type].name}
            onChange={(event) => handleCreateChange(type, "name", event.target.value)}
            placeholder="Nhập tên danh mục"
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
              <h3 className="section-title">Chỉnh sửa danh mục #{editingItem.id}</h3>
              <p className="section-description">Cập nhật thông tin hiển thị cho danh mục đang chọn.</p>
            </div>
          </div>
          <div className="form-grid form-grid--3">
            <FormField label="Tên danh mục" required>
              <input className="input" value={editingItem.name} onChange={(event) => handleEditChange("name", event.target.value)} />
            </FormField>
            <FormField label="Mô tả">
              <input className="input" value={editingItem.description} onChange={(event) => handleEditChange("description", event.target.value)} />
            </FormField>
            <FormField label="Điểm quy đổi">
              <input className="input" type="number" min="0" value={editingItem.points} onChange={(event) => handleEditChange("points", event.target.value)} />
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
        <div className="inline-empty">Chưa có danh mục nào cho nhóm này.</div>
      ) : (
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Điểm</th>
                <th>Mô tả</th>
                <th>Cập nhật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((category) => (
                <tr key={category.id}>
                  <td>#{category.id}</td>
                  <td>
                    <div className="table-primary">{category.name}</div>
                  </td>
                  <td>{category.points ?? "—"}</td>
                  <td>{category.description || "—"}</td>
                  <td>{formatDateTime(category.updated_at)}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="button button--secondary button--small" onClick={() => startEdit(type, category)}>
                        Chỉnh sửa
                      </button>
                      <button
                        type="button"
                        className="button button--danger button--small"
                        disabled={actionKey === `delete-${type}-${category.id}`}
                        onClick={() => handleDelete(type, category.id)}
                      >
                        {actionKey === `delete-${type}-${category.id}` ? "Đang xóa..." : "Xóa"}
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
      {loading ? <div className="inline-empty">Đang tải danh mục...</div> : null}
      {!loading ? (
        <>
          {renderSection("project", "Danh mục đề tài", projectCategories)}
          {renderSection("paper", "Danh mục bài báo", paperCategories)}
        </>
      ) : null}
    </section>
  );
}
