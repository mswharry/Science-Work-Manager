import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import { useAuth } from "../contexts/AuthContext";

const roleGuides = {
  admin: [
    "Sử dụng mục Quản trị để phê duyệt tài khoản, đề tài, bài báo và quản lý danh mục.",
    "Theo dõi bảng điều khiển để nắm các chỉ số tổng quan của hệ thống.",
  ],
  lecturer: [
    "Theo dõi các hồ sơ đang chờ duyệt và phản hồi từ quản trị viên.",
    "Cập nhật bài báo, DOI và các tệp liên quan tại màn hình chỉnh sửa tương ứng.",
  ],
  student: [
    "Theo dõi đề tài và bài báo cá nhân từ mục Đề tài và Bài báo.",
    "Sửa và nộp lại hồ sơ bị từ chối theo hướng dẫn trong ghi chú duyệt.",
  ],
};

export default function ProfilePage() {
  const { user, refreshMe } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState("info");

  const handleRefresh = async () => {
    setRefreshing(true);
    setMessage("");

    try {
      await refreshMe();
      setMessageKind("success");
      setMessage("Đã làm mới thông tin tài khoản.");
    } catch {
      setMessageKind("danger");
      setMessage("Không thể làm mới thông tin tài khoản ở thời điểm hiện tại.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Tài khoản"
        title="Thông tin người dùng"
        description="Theo dõi trạng thái tài khoản, quyền hiện có và các khu vực làm việc liên quan tới vai trò của bạn."
        actions={
          <div className="button-row">
            <button type="button" className="button button--secondary" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? "Đang làm mới..." : "Làm mới dữ liệu"}
            </button>
            <Link to="/dashboard" className="button nav-button-link">
              Mở bảng điều khiển
            </Link>
          </div>
        }
      />

      {message ? <div className={`notice notice--${messageKind}`}>{message}</div> : null}

      <section className="panel overview-columns">
        <div className="stack-md">
          <div>
            <h2 className="section-title">Thông tin cơ bản</h2>
            <p className="section-description">Dữ liệu đang được hiển thị theo phiên đăng nhập hiện tại của bạn.</p>
          </div>

          <div className="key-value-list">
            <div className="key-value-list__item">
              <span className="key-value-list__label">Họ và tên</span>
              <span className="key-value-list__value">{user?.full_name || "—"}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Email</span>
              <span className="key-value-list__value">{user?.email || "—"}</span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Vai trò</span>
              <span className="key-value-list__value">
                <StatusBadge value={user?.role} kind="role" />
              </span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Trạng thái kích hoạt</span>
              <span className="key-value-list__value">
                <StatusBadge value={user?.is_active} kind="active" />
              </span>
            </div>
            <div className="key-value-list__item">
              <span className="key-value-list__label">Trạng thái phê duyệt</span>
              <span className="key-value-list__value">
                <StatusBadge value={user?.is_approved ? "approved" : "pending"} />
              </span>
            </div>
          </div>
        </div>

        <div className="stack-lg">
          <div>
            <h2 className="section-title">Không gian làm việc</h2>
            <p className="section-description">Truy cập nhanh tới các màn hình bạn thường sử dụng trong hệ thống.</p>
          </div>

          <div className="action-list">
            <Link to="/projects" className="action-item">
              <div className="action-item__content">
                <span className="action-item__title">Đề tài</span>
                <span className="action-item__description">Tra cứu và quản lý các hồ sơ đề tài được phép truy cập.</span>
              </div>
              <span className="button button--secondary button--small nav-button-link">Mở</span>
            </Link>
            <Link to="/papers" className="action-item">
              <div className="action-item__content">
                <span className="action-item__title">Bài báo</span>
                <span className="action-item__description">Xem danh sách bài báo, trạng thái duyệt và cập nhật cần thiết.</span>
              </div>
              <span className="button button--secondary button--small nav-button-link">Mở</span>
            </Link>
            <Link to="/dashboard" className="action-item">
              <div className="action-item__content">
                <span className="action-item__title">Bảng điều khiển</span>
                <span className="action-item__description">Theo dõi số liệu tổng hợp và tiến độ xử lý hồ sơ.</span>
              </div>
              <span className="button button--secondary button--small nav-button-link">Mở</span>
            </Link>
            {user?.role === "admin" ? (
              <Link to="/admin" className="action-item">
                <div className="action-item__content">
                  <span className="action-item__title">Quản trị</span>
                  <span className="action-item__description">Điều hành phê duyệt, người dùng, danh mục và thông báo.</span>
                </div>
                <span className="button button--secondary button--small nav-button-link">Mở</span>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="panel overview-columns">
        <div className="stack-md">
          <div>
            <h2 className="section-title">Hướng dẫn theo vai trò</h2>
            <p className="section-description">Một số thao tác nên ưu tiên trong quá trình sử dụng hệ thống.</p>
          </div>
          <ul className="simple-list">
            {(roleGuides[user?.role] || []).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>

        <div className="stack-md">
          <div>
            <h2 className="section-title">Ghi chú dữ liệu</h2>
            <p className="section-description">Một số trường hồ sơ chuyên sâu chưa xuất hiện trong dữ liệu tài khoản hiện tại.</p>
          </div>
          <ul className="simple-list">
            <li>Thông tin mã sinh viên, mã cán bộ hoặc đơn vị công tác chưa có trong dữ liệu hồ sơ trả về.</li>
            <li>Nếu cần cập nhật các trường này, bạn có thể phối hợp với quản trị viên hoặc bộ phận kỹ thuật.</li>
            <li>Trang này ưu tiên hiển thị các trường đang được hệ thống cung cấp ổn định.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
