import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import FormField from "../components/common/FormField";
import { useAuth } from "../contexts/AuthContext";
import { getApiErrorMessage } from "../utils/apiError";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const waitingApproval = error.includes("chờ quản trị viên phê duyệt");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({ email: form.email.trim(), password: form.password });
      const redirectPath = location.state?.from?.pathname || "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Đăng nhập không thành công."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-aside stack-lg">
        <div>
          <p className="page-header__eyebrow">Đăng nhập</p>
          <h1 className="page-header__title">Truy cập không gian làm việc nghiên cứu</h1>
          <p className="page-header__description">
            Sử dụng tài khoản đã được cấp hoặc đã đăng ký thành công để truy cập các chức năng quản lý đề tài, bài báo và báo cáo tổng hợp.
          </p>
        </div>

        <div className="auth-info-block">
          <h2 className="section-title">Lưu ý truy cập</h2>
          <ul className="simple-list">
            <li>Tài khoản giảng viên chỉ đăng nhập được sau khi được quản trị viên phê duyệt.</li>
            <li>Nếu phiên làm việc hết hạn, hệ thống sẽ yêu cầu đăng nhập lại.</li>
            <li>Sau khi đăng nhập, giao diện sẽ hiển thị chức năng tương ứng với vai trò của bạn.</li>
          </ul>
        </div>

        <div className="auth-info-block">
          <h2 className="section-title">Chưa có tài khoản?</h2>
          <p className="section-description">Bạn có thể đăng ký tài khoản mới nếu là sinh viên hoặc giảng viên chưa có tài khoản trong hệ thống.</p>
          <Link to="/register" className="button button--secondary nav-button-link">
            Đi tới trang đăng ký
          </Link>
        </div>
      </section>

      <form className="panel auth-form" onSubmit={handleSubmit}>
        <div className="section-heading">
          <div>
            <h2 className="section-title">Đăng nhập hệ thống</h2>
            <p className="section-description">Nhập email và mật khẩu để tiếp tục.</p>
          </div>
        </div>

        <div className="stack-md">
          <FormField label="Email" required>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="tenban@truong.edu.vn"
              required
            />
          </FormField>

          <FormField label="Mật khẩu" required>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </FormField>
        </div>

        {error ? <div className="notice notice--danger">{error}</div> : null}
        {waitingApproval ? (
          <div className="notice notice--warning">
            Tài khoản giảng viên chỉ có thể đăng nhập sau khi được quản trị viên phê duyệt. Vui lòng kiểm tra lại sau.
          </div>
        ) : null}

        <div className="button-row">
          <button type="submit" className="button" disabled={submitting}>
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <Link to="/register" className="button button--secondary nav-button-link">
            Tạo tài khoản mới
          </Link>
        </div>
      </form>
    </div>
  );
}
