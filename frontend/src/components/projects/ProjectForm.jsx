import { useEffect, useState } from "react";
import { CATEGORY_ACCESS_NOTE } from "../../utils/constants";
import { normalizeOptionalNumber, normalizeOptionalText } from "../../utils/formatters";
import FormField from "../common/FormField";

function createDefaultForm(initialValues) {
  return {
    name: initialValues?.name || "",
    category_id: initialValues?.category_id || "",
    budget: initialValues?.budget ?? "",
    start_date: initialValues?.start_date || "",
    end_date: initialValues?.end_date || "",
    description: initialValues?.description || "",
    proposal_file: initialValues?.proposal_file || "",
    final_report_file: initialValues?.final_report_file || "",
  };
}

export default function ProjectForm({
  initialValues,
  mode,
  categories,
  categoriesLoading,
  categoryMode,
  categoryNote,
  onSubmit,
  onCancel,
  submitting,
  submitError,
}) {
  const [form, setForm] = useState(createDefaultForm(initialValues));

  useEffect(() => {
    setForm(createDefaultForm(initialValues));
  }, [initialValues]);

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      category_id: Number(form.category_id),
      budget: normalizeOptionalNumber(form.budget),
      start_date: normalizeOptionalText(form.start_date),
      end_date: normalizeOptionalText(form.end_date),
      description: normalizeOptionalText(form.description),
    };

    if (mode === "edit") {
      payload.proposal_file = normalizeOptionalText(form.proposal_file);
      payload.final_report_file = normalizeOptionalText(form.final_report_file);
    }

    onSubmit(payload);
  };

  return (
    <form className="panel form-panel stack-lg" onSubmit={handleSubmit}>
      <section className="form-section stack-md">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Thông tin chính</h2>
            <p className="section-description">Điền đầy đủ các thông tin bắt buộc của hồ sơ đề tài.</p>
          </div>
        </div>

        <div className="form-grid form-grid--2">
          <FormField label="Tên đề tài" required>
            <input
              className="input"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Nhập tên đề tài nghiên cứu"
              required
            />
          </FormField>

          {categoryMode === "select" ? (
            <FormField
              label="Danh mục đề tài"
              required
              hint={categoriesLoading ? "Đang tải danh mục..." : categoryNote || "Chọn danh mục phù hợp với đề tài."}
            >
              <select
                className="input"
                value={form.category_id}
                onChange={(event) => handleChange("category_id", event.target.value)}
                disabled={categoriesLoading}
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    #{category.id} — {category.name}
                  </option>
                ))}
              </select>
            </FormField>
          ) : (
            <FormField label="Mã danh mục" required hint={categoryNote || CATEGORY_ACCESS_NOTE}>
              <input
                className="input"
                type="number"
                min="1"
                value={form.category_id}
                onChange={(event) => handleChange("category_id", event.target.value)}
                placeholder="Ví dụ: 1"
                required
              />
            </FormField>
          )}

          <FormField label="Kinh phí">
            <input
              className="input"
              type="number"
              min="0"
              value={form.budget}
              onChange={(event) => handleChange("budget", event.target.value)}
              placeholder="Nhập kinh phí nếu có"
            />
          </FormField>

          <FormField label="Ngày bắt đầu">
            <input
              className="input"
              type="date"
              value={form.start_date}
              onChange={(event) => handleChange("start_date", event.target.value)}
            />
          </FormField>

          <FormField label="Ngày kết thúc">
            <input
              className="input"
              type="date"
              value={form.end_date}
              onChange={(event) => handleChange("end_date", event.target.value)}
            />
          </FormField>
        </div>
      </section>

      <section className="form-section stack-md">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Mô tả</h2>
            <p className="section-description">Ghi ngắn gọn mục tiêu, phạm vi hoặc ghi chú bổ sung cho đề tài.</p>
          </div>
        </div>
        <FormField label="Mô tả đề tài">
          <textarea
            className="textarea"
            rows="5"
            value={form.description}
            onChange={(event) => handleChange("description", event.target.value)}
            placeholder="Nội dung mô tả đề tài"
          />
        </FormField>
      </section>

      {mode === "edit" ? (
        <section className="form-section stack-md">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Tệp đính kèm</h2>
              <p className="section-description">Bạn có thể cập nhật đường dẫn tệp đính kèm ở bước chỉnh sửa hồ sơ.</p>
            </div>
          </div>
          <div className="form-grid form-grid--2">
            <FormField label="Tệp đề cương / đề xuất">
              <input
                className="input"
                value={form.proposal_file}
                onChange={(event) => handleChange("proposal_file", event.target.value)}
                placeholder="https://... hoặc đường dẫn lưu trữ"
              />
            </FormField>
            <FormField label="Tệp báo cáo cuối cùng">
              <input
                className="input"
                value={form.final_report_file}
                onChange={(event) => handleChange("final_report_file", event.target.value)}
                placeholder="https://... hoặc đường dẫn lưu trữ"
              />
            </FormField>
          </div>
        </section>
      ) : null}

      {submitError ? <div className="notice notice--danger">{submitError}</div> : null}

      <div className="button-row">
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Đang lưu..." : mode === "edit" ? "Lưu thay đổi" : "Tạo đề tài"}
        </button>
        <button type="button" className="button button--secondary" onClick={onCancel} disabled={submitting}>
          Hủy
        </button>
      </div>
    </form>
  );
}
