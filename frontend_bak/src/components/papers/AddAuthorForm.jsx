import { useState } from "react";
import FormField from "../common/FormField";

export default function AddAuthorForm({ onSubmit, submitting, error, success }) {
  const [form, setForm] = useState({ user_id: "", author_order: 1, is_corresponding: false });

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      user_id: Number(form.user_id),
      author_order: Number(form.author_order || 1),
      is_corresponding: Boolean(form.is_corresponding),
    };

    const completed = await onSubmit(payload);
    if (completed) {
      setForm({ user_id: "", author_order: 1, is_corresponding: false });
    }
  };

  return (
    <form className="panel stack-md" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <h2 className="section-title">Thêm đồng tác giả</h2>
          <p className="section-description">
            Backend hiện tại yêu cầu nhập trực tiếp mã người dùng nội bộ. Hãy kiểm tra đúng mã trước khi gửi.
          </p>
        </div>
      </div>

      <div className="form-grid form-grid--3">
        <FormField label="Mã người dùng" required>
          <input
            className="input"
            type="number"
            min="1"
            value={form.user_id}
            onChange={(event) => handleChange("user_id", event.target.value)}
            placeholder="Ví dụ: 12"
            required
          />
        </FormField>

        <FormField label="Thứ tự tác giả">
          <input
            className="input"
            type="number"
            min="1"
            value={form.author_order}
            onChange={(event) => handleChange("author_order", event.target.value)}
          />
        </FormField>

        <FormField label="Tùy chọn tương ứng">
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={form.is_corresponding}
              onChange={(event) => handleChange("is_corresponding", event.target.checked)}
            />
            <span>Đánh dấu là tác giả liên hệ</span>
          </label>
        </FormField>
      </div>

      {error ? <div className="notice notice--danger">{error}</div> : null}
      {success ? <div className="notice notice--success">{success}</div> : null}

      <div className="button-row">
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Đang thêm..." : "Thêm đồng tác giả"}
        </button>
      </div>
    </form>
  );
}
