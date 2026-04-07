import { useEffect, useState } from "react";
import { CATEGORY_ACCESS_NOTE } from "../../utils/constants";
import { normalizeOptionalNumber, normalizeOptionalText } from "../../utils/formatters";
import FormField from "../common/FormField";

function createDefaultForm(initialValues) {
  return {
    title: initialValues?.title || "",
    category_id: initialValues?.category_id || "",
    journal_name: initialValues?.journal_name || "",
    publication_year: initialValues?.publication_year || "",
    volume: initialValues?.volume || "",
    issue: initialValues?.issue || "",
    pages: initialValues?.pages || "",
    doi: initialValues?.doi || "",
    file_url: initialValues?.file_url || "",
  };
}

export default function PaperForm({
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

    onSubmit({
      title: form.title.trim(),
      category_id: Number(form.category_id),
      journal_name: normalizeOptionalText(form.journal_name),
      publication_year: normalizeOptionalNumber(form.publication_year),
      volume: normalizeOptionalText(form.volume),
      issue: normalizeOptionalText(form.issue),
      pages: normalizeOptionalText(form.pages),
      doi: normalizeOptionalText(form.doi),
      file_url: normalizeOptionalText(form.file_url),
    });
  };

  return (
    <form className="panel form-panel stack-lg" onSubmit={handleSubmit}>
      <section className="form-section stack-md">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Thông tin bài báo</h2>
            <p className="section-description">Khai báo đầy đủ thông tin xuất bản và nhận diện bài báo.</p>
          </div>
        </div>

        <div className="form-grid form-grid--2">
          <FormField label="Tên bài báo" required>
            <input
              className="input"
              value={form.title}
              onChange={(event) => handleChange("title", event.target.value)}
              placeholder="Nhập tên bài báo"
              required
            />
          </FormField>

          {categoryMode === "select" ? (
            <FormField
              label="Danh mục bài báo"
              required
              hint={categoriesLoading ? "Đang tải danh mục..." : categoryNote || "Chọn danh mục phù hợp với bài báo."}
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

          <FormField label="Tên tạp chí / hội nghị">
            <input
              className="input"
              value={form.journal_name}
              onChange={(event) => handleChange("journal_name", event.target.value)}
              placeholder="Ví dụ: Journal of ..."
            />
          </FormField>

          <FormField label="Năm công bố">
            <input
              className="input"
              type="number"
              min="1900"
              max="2100"
              value={form.publication_year}
              onChange={(event) => handleChange("publication_year", event.target.value)}
              placeholder="Ví dụ: 2026"
            />
          </FormField>

          <FormField label="Tập (Volume)">
            <input
              className="input"
              value={form.volume}
              onChange={(event) => handleChange("volume", event.target.value)}
              placeholder="Ví dụ: 12"
            />
          </FormField>

          <FormField label="Số (Issue)">
            <input
              className="input"
              value={form.issue}
              onChange={(event) => handleChange("issue", event.target.value)}
              placeholder="Ví dụ: 3"
            />
          </FormField>

          <FormField label="Trang">
            <input
              className="input"
              value={form.pages}
              onChange={(event) => handleChange("pages", event.target.value)}
              placeholder="Ví dụ: 101-118"
            />
          </FormField>

          <FormField label="DOI">
            <input
              className="input"
              value={form.doi}
              onChange={(event) => handleChange("doi", event.target.value)}
              placeholder="Ví dụ: 10.xxxx/xxxx"
            />
          </FormField>
        </div>
      </section>

      <section className="form-section stack-md">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Tệp đính kèm</h2>
            <p className="section-description">Nhập liên kết chia sẻ hoặc đường dẫn lưu trữ của tệp bài báo để lưu kèm hồ sơ.</p>
          </div>
        </div>
        <FormField label="Liên kết / đường dẫn tệp bài báo">
          <input
            className="input"
            value={form.file_url}
            onChange={(event) => handleChange("file_url", event.target.value)}
            placeholder="https://... hoặc đường dẫn lưu trữ"
          />
        </FormField>
        <p className="form-note">Bạn có thể thêm ngay khi tạo mới hoặc cập nhật lại sau nếu cần thay đổi đường dẫn tệp.</p>
      </section>

      {submitError ? <div className="notice notice--danger">{submitError}</div> : null}

      <div className="button-row">
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Đang lưu..." : mode === "edit" ? "Lưu thay đổi" : "Tạo bài báo"}
        </button>
        <button type="button" className="button button--secondary" onClick={onCancel} disabled={submitting}>
          Hủy
        </button>
      </div>
    </form>
  );
}
