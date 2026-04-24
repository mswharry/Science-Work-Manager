import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { listNotifications } from "../../services/notificationService";
import { useAuth } from "../../contexts/AuthContext";
import { APP_DESCRIPTION, APP_NAME, APP_SHORT_NAME } from "../../utils/constants";
import StatusBadge from "./StatusBadge";

function navLinkClass({ isActive }) {
  return `nav-link${isActive ? " nav-link--active" : ""}`;
}

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    async function loadNotificationCount() {
      if (!isAuthenticated) {
        if (isMounted) {
          setNotificationCount(0);
        }
        return;
      }

      try {
        const notifications = await listNotifications();
        if (isMounted) {
          setNotificationCount(Array.isArray(notifications) ? notifications.length : 0);
        }
      } catch {
        if (isMounted) {
          setNotificationCount(0);
        }
      }
    }

    loadNotificationCount();

    if (isAuthenticated) {
      intervalId = window.setInterval(loadNotificationCount, 60000);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isAuthenticated]);

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

        <div className="nav-main">
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
                  <span>Bảng điều khiển</span>
                  {notificationCount > 0 ? (
                    <span className="nav-link__badge" aria-label={`${notificationCount} thong bao`}>
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  ) : null}
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
        </div>
      </nav>
    </header>
  );
}
