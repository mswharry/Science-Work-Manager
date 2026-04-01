import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { APP_DESCRIPTION, APP_NAME, APP_SHORT_NAME } from "../../utils/constants";
import StatusBadge from "./StatusBadge";

function navLinkClass({ isActive }) {
  return `nav-link${isActive ? " nav-link--active" : ""}`;
}

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar-wrap">
      <nav className="navbar">
        <NavLink to="/" className="nav-brand">
          <span className="nav-brand__mark" aria-hidden="true">
            {APP_SHORT_NAME}
          </span>
          <span className="nav-brand__text">
            <strong className="nav-brand__title">{APP_NAME}</strong>
            <small className="nav-brand__subtitle">{APP_DESCRIPTION}</small>
          </span>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/" className={navLinkClass} end>
            Trang chủ
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/projects" className={navLinkClass}>
                Đề tài
              </NavLink>
              <NavLink to="/papers" className={navLinkClass}>
                Bài báo
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>
                Bảng điều khiển
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Tài khoản
              </NavLink>
            </>
          ) : null}
          {isAdmin ? (
            <NavLink to="/admin" className={navLinkClass}>
              Quản trị
            </NavLink>
          ) : null}
        </div>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <div className="nav-user">
                <div className="nav-user__meta">
                  <strong>{user?.full_name}</strong>
                  <span>{user?.email}</span>
                </div>
                <StatusBadge value={user?.role} kind="role" />
              </div>
              <button type="button" className="button button--ghost" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="button button--secondary nav-button-link">
                Đăng nhập
              </NavLink>
              <NavLink to="/register" className="button nav-button-link">
                Đăng ký
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
