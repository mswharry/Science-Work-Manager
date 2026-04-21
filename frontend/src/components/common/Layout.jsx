import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "./Navbar";

function sidebarLinkClass({ isActive }) {
  return `sidebar-link${isActive ? " sidebar-link--active" : ""}`;
}

function SidebarRow({ to, label, description, collapsed, end, icon }) {
  return (
    <NavLink to={to} className={sidebarLinkClass} end={end}>
      <span className="sidebar-link__icon" aria-hidden="true">
        {icon}
      </span>
      {!collapsed ? (
        <span className="sidebar-link__content">
          <span className="sidebar-link__label">{label}</span>
          {description ? <span className="sidebar-link__description">{description}</span> : null}
        </span>
      ) : null}
    </NavLink>
  );
}

export default function Layout() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const showSidebar = isAuthenticated && !["/login", "/register"].includes(pathname);

  const sidebarSections = useMemo(() => {
    if (!isAuthenticated) {
      return [
        {
          type: "links",
          links: [
            {
              to: "/login",
              label: "Đăng nhập",
              description: "Vào hệ thống bằng tài khoản hiện có.",
              icon: "◌",
            },
            {
              to: "/register",
              label: "Đăng ký",
              description: "Tạo tài khoản mới theo đúng vai trò.",
              icon: "◌",
            },
          ],
        },
      ];
    }

    return [
      {
        type: "row",
        to: "/dashboard",
        label: "Bảng điều khiển",
        description: "Tổng quan nhanh",
        icon: "⌂",
        end: true,
      },
      {
        type: "row",
        to: "/projects",
        label: "Đề tài",
        description: "Quản lý đề tài nghiên cứu",
        icon: "◫",
      },
      {
        type: "row",
        to: "/papers",
        label: "Bài báo",
        description: "Hồ sơ bài báo và công bố",
        icon: "◫",
      },
      {
        type: "row",
        to: "/plans",
        label: "Kế hoạch",
        description: "Kế hoạch năm học",
        icon: "▣",
      },
      {
        type: "row",
        to: "/profile",
        label: "Tài khoản",
        description: "Thông tin cá nhân",
        icon: "ⓘ",
      },
      ...(isAdmin
        ? [
            {
              type: "row",
              to: "/admin",
              label: "Quản trị",
              description: "Cài đặt và kiểm soát",
              icon: "⚙",
            },
          ]
        : []),
    ];
  }, [isAdmin, isAuthenticated]);

  return (
    <div className={`app-shell ${sidebarCollapsed ? "app-shell--sidebar-collapsed" : ""}`}>
      <Navbar
        showSidebar={showSidebar}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
      />
      {showSidebar ? (
        <div className="app-body">
          <aside className="app-sidebar" aria-label="Thanh điều hướng bên trái">
            <div className="app-sidebar__content">
              {sidebarSections.map((item) => {
                if (item.type === "links") {
                  return (
                    <section key="auth-links" className="sidebar-section">
                      <div className="sidebar-links">
                        {item.links.map((link) => (
                          <SidebarRow
                            key={link.to}
                            to={link.to}
                            label={link.label}
                            description={link.description}
                            collapsed={sidebarCollapsed}
                            end={link.end}
                            icon={link.icon}
                          />
                        ))}
                      </div>
                    </section>
                  );
                }

                return (
                  <SidebarRow
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    description={item.description}
                    collapsed={sidebarCollapsed}
                    end={item.end}
                    icon={item.icon}
                  />
                );
              })}
            </div>
          </aside>

          <main className="page-shell">
            <Outlet />
          </main>
        </div>
      ) : (
        <main className="page-shell page-shell--full page-shell--public">
          <Outlet />
        </main>
      )}
    </div>
  );
}
