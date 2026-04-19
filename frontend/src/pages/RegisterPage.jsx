import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import FormField from "../components/common/FormField";
import { useAuth } from "../contexts/AuthContext";
import { getApiErrorMessage } from "../utils/apiError";
import { ROLES } from "../utils/constants";

function createDefaultForm() {
  return {
    email: "",
    password: "",
    full_name: "",
    role: ROLES.STUDENT,
    student_id: "",
    staff_id: "",
    department: "",
  };
}

export default function RegisterPage() {
  const { isAuthenticated, register } = useAuth();
  const [form, setForm] = useState(createDefaultForm());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
      ...(field === "role"
        ? {
            student_id: value === ROLES.STUDENT ? previous.student_id : "",
            staff_id: value === ROLES.LECTURER ? previous.staff_id : "",
          }
        : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        role: form.role,
        student_id: form.role === ROLES.STUDENT ? form.student_id.trim() : null,
        staff_id: form.role === ROLES.LECTURER ? form.staff_id.trim() : null,
        department: form.department.trim() || null,
      });

      const currentRole = form.role;
      setForm(createDefaultForm());
      setSuccess(
        currentRole === ROLES.LECTURER
          ? "Đăng ký tài khoản giảng viên thành công. Tài khoản cần được quản trị viên phê duyệt trước khi đăng nhập."
          : "Đăng ký tài khoản sinh viên thành công. Bạn có thể đăng nhập ngay."
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Đăng ký không thành công."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-aside stack-lg">
        <div>
          <p className="page-header__eyebrow">Đăng ký tài khoản</p>
          <h1 className="page-header__title">Tạo hồ sơ truy cập mới</h1>
          <p className="page-header__description">
            Đăng ký tài khoản để bắt đầu quản lý đề tài và bài báo trên hệ thống. Giao diện này dành cho sinh viên và giảng viên mới.
          </p>
        </div>

        <div className="auth-info-block">
          <h2 className="section-title">Quy tắc tiếp nhận</h2>
          <ul className="simple-list">
            <li>Sinh viên cần nhập mã sinh viên khi đăng ký.</li>
            <li>Giảng viên cần nhập mã cán bộ và chờ phê duyệt trước khi đăng nhập.</li>
            <li>Phòng ban có thể để trống nếu đơn vị chưa yêu cầu khai báo.</li>
          </ul>
        </div>

        <div className="auth-info-block">
          <h2 className="section-title">Đã có tài khoản?</h2>
          <p className="section-description">Quay lại trang đăng nhập để vào hệ thống bằng tài khoản hiện có.</p>
          <Link to="/login" className="button button--secondary nav-button-link">
            Trở về đăng nhập
          </Link>
        </div>
      </section>

      <form className="panel auth-form" onSubmit={handleSubmit}>
        <div className="section-heading">
          <div>
            <h2 className="section-title">Thông tin đăng ký</h2>
            <p className="section-description">Điền đầy đủ thông tin bắt buộc theo vai trò mà bạn chọn.</p>
          </div>
        </div>

        <div className="form-grid form-grid--2">
          <FormField label="Họ và tên" required>
            <input
              className="input"
              value={form.full_name}
              onChange={(event) => handleChange("full_name", event.target.value)}
              placeholder="Nguyễn Văn A"
              required
            />
          </FormField>

          <FormField label="Vai trò" required>
            <select className="input" value={form.role} onChange={(event) => handleChange("role", event.target.value)}>
              <option value={ROLES.STUDENT}>Sinh viên</option>
              <option value={ROLES.LECTURER}>Giảng viên</option>
            </select>
          </FormField>

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

          <FormField label="Mật khẩu" required hint="Mật khẩu tối thiểu 6 ký tự.">
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </FormField>

          {form.role === ROLES.STUDENT ? (
            <FormField label="Mã sinh viên" required>
              <input
                className="input"
                value={form.student_id}
                onChange={(event) => handleChange("student_id", event.target.value)}
                placeholder="Ví dụ: AT220001"
                required
              />
            </FormField>
          ) : (
            <FormField label="Mã cán bộ" required>
              <input
                className="input"
                value={form.staff_id}
                onChange={(event) => handleChange("staff_id", event.target.value)}
                placeholder="Ví dụ: GV001"
                required
              />
            </FormField>
          )}

          <FormField label="Đơn vị / khoa">
            <input
              className="input"
              value={form.department}
              onChange={(event) => handleChange("department", event.target.value)}
              placeholder="Ví dụ: Khoa An toàn thông tin"
            />
          </FormField>
        </div>

        {error ? <div className="notice notice--danger">{error}</div> : null}
        {success ? <div className="notice notice--success">{success}</div> : null}

        <div className="button-row">
          <button type="submit" className="button" disabled={submitting}>
            {submitting ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
          <Link to="/login" className="button button--secondary nav-button-link">
            Quay lại đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}
