import { useEffect, useState } from "react";
import { approveUser, listUsers, toggleUserBlock } from "../../services/userService";
import { ROLE_OPTIONS } from "../../utils/constants";
import { getApiErrorMessage } from "../../utils/apiError";
import StatusBadge from "../common/StatusBadge";
import FormField from "../common/FormField";

const DEFAULT_FILTERS = {
  role: "",
  is_active: "",
  is_approved: "",
};

export default function UserManagementPanel() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionKey, setActionKey] = useState("");

  const loadUsersData = async (activeFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const data = await listUsers(activeFilters);
      setUsers(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải danh sách người dùng."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersData(filters);
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setDraftFilters((previous) => ({ ...previous, [field]: value }));
  };

  const handleApprove = async (user) => {
    const key = `approve-${user.id}`;
    setActionKey(key);
    setError("");

    try {
      await approveUser(user.id, { is_approved: true, role: user.role });
      await loadUsersData(filters);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể phê duyệt tài khoản."));
    } finally {
      setActionKey("");
    }
  };

  const handleToggleBlock = async (user) => {
    const key = `toggle-${user.id}`;
    setActionKey(key);
    setError("");

    try {
      await toggleUserBlock(user.id);
      await loadUsersData(filters);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể cập nhật trạng thái tài khoản."));
    } finally {
      setActionKey("");
    }
  };

  return (
    <section className="stack-lg">
      <form
        className="panel filter-panel"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draftFilters);
        }}
      >
        <div className="section-heading">
          <div>
            <h2 className="section-title">Quản lý người dùng</h2>
            <p className="section-description">Phê duyệt tài khoản, lọc theo vai trò và khóa hoặc mở khóa người dùng.</p>
          </div>
        </div>

        <div className="filter-grid filter-grid--3">
          <FormField label="Vai trò">
            <select className="input" value={draftFilters.role} onChange={(event) => handleFilterChange("role", event.target.value)}>
              <option value="">Tất cả vai trò</option>
              {ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Trạng thái kích hoạt">
            <select
              className="input"
              value={draftFilters.is_active}
              onChange={(event) => handleFilterChange("is_active", event.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đã khóa</option>
            </select>
          </FormField>

          <FormField label="Trạng thái phê duyệt">
            <select
              className="input"
              value={draftFilters.is_approved}
              onChange={(event) => handleFilterChange("is_approved", event.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="true">Đã phê duyệt</option>
              <option value="false">Chờ phê duyệt</option>
            </select>
          </FormField>
        </div>

        <div className="filter-footer">
          <span className="muted-text">Tài khoản quản trị viên không hỗ trợ khóa hoặc thay đổi tại màn hình này.</span>
          <div className="button-row">
            <button type="button" className="button button--secondary" onClick={() => { setDraftFilters(DEFAULT_FILTERS); setFilters(DEFAULT_FILTERS); }}>
              Đặt lại
            </button>
            <button type="submit" className="button">
              Áp dụng bộ lọc
            </button>
            <button type="button" className="button button--ghost" onClick={() => loadUsersData(filters)}>
              Làm mới
            </button>
          </div>
        </div>
      </form>

      {error ? <div className="notice notice--danger">{error}</div> : null}
      {loading ? <div className="inline-empty">Đang tải danh sách người dùng...</div> : null}
      {!loading && !users.length ? <div className="inline-empty">Không có người dùng nào phù hợp với bộ lọc đã chọn.</div> : null}

      {!loading && users.length ? (
        <section className="panel stack-md">
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Vai trò</th>
                  <th>Kích hoạt</th>
                  <th>Phê duyệt</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="table-primary">{user.full_name}</div>
                      <div className="table-secondary">{user.email}</div>
                      <div className="table-secondary">Người dùng #{user.id}</div>
                    </td>
                    <td>
                      <StatusBadge value={user.role} kind="role" />
                    </td>
                    <td>
                      <StatusBadge value={user.is_active} kind="active" />
                    </td>
                    <td>
                      <StatusBadge value={user.is_approved ? "approved" : "pending"} />
                    </td>
                    <td>
                      <div className="table-actions">
                        {!user.is_approved && user.role !== "admin" ? (
                          <button
                            type="button"
                            className="button button--secondary button--small"
                            disabled={actionKey === `approve-${user.id}`}
                            onClick={() => handleApprove(user)}
                          >
                            {actionKey === `approve-${user.id}` ? "Đang phê duyệt..." : "Phê duyệt"}
                          </button>
                        ) : null}

                        {user.role !== "admin" ? (
                          <button
                            type="button"
                            className={`button button--small ${user.is_active ? "button--danger" : "button--subtle"}`}
                            disabled={actionKey === `toggle-${user.id}`}
                            onClick={() => handleToggleBlock(user)}
                          >
                            {actionKey === `toggle-${user.id}`
                              ? "Đang cập nhật..."
                              : user.is_active
                                ? "Khóa tài khoản"
                                : "Mở khóa"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </section>
  );
}
