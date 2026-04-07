import { useState } from "react";
import { createNotification } from "../../services/notificationService";
import { TARGET_ROLE_OPTIONS } from "../../utils/constants";
import { getApiErrorMessage } from "../../utils/apiError";
import FormField from "../common/FormField";

const INITIAL_FORM = {
  title: "",
  content: "",
  target_role: "all",
};

export default function NotificationComposer({ onCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await createNotification({
        title: form.title.trim(),
        content: form.content.trim(),
        target_role: form.target_role,
      });
      setSuccess("Đã phát hành thông báo mới.");
      setForm(INITIAL_FORM);
      if (onCreated) {
        onCreated();
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể phát hành thông báo."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="panel stack-md" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <h2 className="section-title">Phát hành thông báo</h2>
          <p className="section-description">Gửi thông báo nội bộ cho toàn hệ thống hoặc theo từng nhóm người dùng.</p>
        </div>
      </div>

      <div className="form-grid form-grid--2">
        <FormField label="Tiêu đề" required>
          <input
            className="input"
            value={form.title}
            onChange={(event) => handleChange("title", event.target.value)}
            placeholder="Ví dụ: Thông báo tiếp nhận hồ sơ đợt mới"
            required
          />
        </FormField>

        <FormField label="Đối tượng nhận">
          <select className="input" value={form.target_role} onChange={(event) => handleChange("target_role", event.target.value)}>
            {TARGET_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Nội dung" required>
        <textarea
          className="textarea"
          rows="5"
          value={form.content}
          onChange={(event) => handleChange("content", event.target.value)}
          placeholder="Nhập nội dung thông báo"
          required
        />
      </FormField>

      {error ? <div className="notice notice--danger">{error}</div> : null}
      {success ? <div className="notice notice--success">{success}</div> : null}

      <div className="button-row">
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Đang phát hành..." : "Phát hành thông báo"}
        </button>
      </div>
    </form>
  );
}
