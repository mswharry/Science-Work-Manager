import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { listNotifications } from "../../services/notificationService";
import { useAuth } from "../../contexts/AuthContext";
import { APP_DESCRIPTION, APP_NAME, APP_SHORT_NAME } from "../../utils/constants";
import { resolveIdentityCode } from "../../utils/formatters";
import StatusBadge from "./StatusBadge";

function navLinkClass({ isActive }) {
  return `nav-link${isActive ? " nav-link--active" : ""}`;
}

export default function Navbar({
  showSidebar = true,
  sidebarCollapsed = false,
  onToggleSidebar = () => {},
}) {
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
        <div className="navbar__brand-group">
          {showSidebar ? (
            <button
              type="button"
              className="button button--ghost sidebar-toggle sidebar-toggle--header"
              onClick={onToggleSidebar}
              aria-label={sidebarCollapsed ? "Mở sidebar" : "Thu gọn sidebar"}
            >
              <span className="sidebar-toggle__bars" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          ) : null}

          <NavLink to="/" className="nav-brand">
            <span className="nav-brand__mark" aria-hidden="true">
              {APP_SHORT_NAME}
            </span>
            <span className="nav-brand__text">
              <strong className="nav-brand__title">{APP_NAME}</strong>
              <small className="nav-brand__subtitle">{APP_DESCRIPTION}</small>
            </span>
          </NavLink>
        </div>

        <div className="nav-actions nav-actions--header">
          <NavLink to="/" className={navLinkClass} end>
            Trang chủ
          </NavLink>
          {isAuthenticated ? (
            <>
              <div className="nav-user nav-user--compact">
                <div className="nav-user__meta">
                  <strong>{user?.full_name}</strong>
                  <span>{user?.email}</span>
                </div>
                <div className="nav-user__role">
                  <StatusBadge value={user?.role} kind="role" />
                  <span className="nav-user__code">
                    Mã: {resolveIdentityCode(user?.staff_id, user?.student_id)}
                  </span>
                </div>
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
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
