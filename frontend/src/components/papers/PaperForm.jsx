import { useEffect, useMemo, useState } from "react";
import { CATEGORY_ACCESS_NOTE, ROLES } from "../../utils/constants";
import { normalizeOptionalNumber, normalizeOptionalText, resolveIdentityCode } from "../../utils/formatters";
import FormField from "../common/FormField";
import FileAttachmentField from "../common/FileAttachmentField";

function createDefaultForm(initialValues) {
  return {
    title: initialValues?.title || "",
    category_id: initialValues?.category_id || "",
    level_id: initialValues?.level_id || "",
    journal_name: initialValues?.journal_name || "",
    publication_year: initialValues?.publication_year || "",
    volume: initialValues?.volume || "",
    issue: initialValues?.issue || "",
    pages: initialValues?.pages || "",
    doi: initialValues?.doi || "",
    file_url: initialValues?.file_url || "",
    supervisor_lecturer_id: initialValues?.supervisor_lecturer_id || "",
    classification_option_ids: initialValues?.classification_options?.map((item) => item.option_id) || [],
    file_upload: null,
  };
}

export default function PaperForm({
  initialValues,
  mode,
  categories,
  categoriesLoading,
  categoryMode,
  categoryNote,
  levels,
  levelsLoading,
  classificationGroups,
  classificationLoading,
  currentUser,
  lecturers,
  lecturersLoading,
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

  const selectedLecturer = useMemo(
    () => lecturers.find((lecturer) => String(lecturer.id) === String(form.supervisor_lecturer_id)),
    [form.supervisor_lecturer_id, lecturers],
  );

  const isStudent = currentUser?.role === ROLES.STUDENT;

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      title: form.title.trim(),
      category_id: Number(form.category_id),
      level_id: form.level_id ? Number(form.level_id) : null,
      journal_name: normalizeOptionalText(form.journal_name),
      publication_year: normalizeOptionalNumber(form.publication_year),
      volume: normalizeOptionalText(form.volume),
      issue: normalizeOptionalText(form.issue),
      pages: normalizeOptionalText(form.pages),
      doi: normalizeOptionalText(form.doi),
      file_url: normalizeOptionalText(form.file_url),
      supervisor_lecturer_id: isStudent ? Number(form.supervisor_lecturer_id) : null,
      classification_option_ids: form.classification_option_ids,
      file_upload: form.file_upload || null,
    });
  };

  const toggleClassificationOption = (optionId) => {
    setForm((previous) => {
      const exists = previous.classification_option_ids.includes(optionId);
      return {
        ...previous,
        classification_option_ids: exists
          ? previous.classification_option_ids.filter((id) => id !== optionId)
          : [...previous.classification_option_ids, optionId],
      };
    });
  };

  return (
    <form className="panel form-panel stack-lg" onSubmit={handleSubmit}>
      <section className="form-section stack-md">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Người khai báo</h2>
            <p className="section-description">Thông tin tài khoản đang thực hiện khai báo hồ sơ bài báo.</p>
          </div>
        </div>

        <div className="form-grid form-grid--3">
          <FormField label="Họ và tên">
            <input className="input" value={currentUser?.full_name || ""} disabled readOnly />
          </FormField>
          <FormField label="Email">
            <input className="input" value={currentUser?.email || ""} disabled readOnly />
          </FormField>
          <FormField label="Mã cán bộ / mã sinh viên">
            <input className="input" value={resolveIdentityCode(currentUser?.staff_id, currentUser?.student_id)} disabled readOnly />
          </FormField>
        </div>
      </section>

      {isStudent ? (
        <section className="form-section stack-md">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Giảng viên hướng dẫn</h2>
              <p className="section-description">Sinh viên bắt buộc phải chọn giảng viên hướng dẫn khi khai báo bài báo mới.</p>
            </div>
          </div>

          <div className="form-grid form-grid--2">
            <FormField
              label="Giảng viên hướng dẫn"
              required
              hint={lecturersLoading ? "Đang tải danh sách giảng viên..." : "Chỉ hiển thị các giảng viên đang hoạt động và đã được phê duyệt."}
            >
              <select
                className="input"
                value={form.supervisor_lecturer_id}
                onChange={(event) => handleChange("supervisor_lecturer_id", event.target.value)}
                disabled={lecturersLoading}
                required
              >
                <option value="">Chọn giảng viên hướng dẫn</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.full_name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Mã cán bộ giảng viên">
              <input className="input" value={selectedLecturer?.staff_id || "—"} disabled readOnly />
            </FormField>

            <FormField label="Email giảng viên">
              <input className="input" value={selectedLecturer?.email || "—"} disabled readOnly />
            </FormField>

            <FormField label="Đơn vị công tác">
              <input className="input" value={selectedLecturer?.department || "—"} disabled readOnly />
            </FormField>
          </div>
        </section>
      ) : null}

      <section className="form-section stack-md">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Thông tin bài báo</h2>
            <p className="section-description">Khai báo đầy đủ thông tin xuất bản và nhận diện bài báo.</p>
          </div>
        </div>

        <div className="form-grid form-grid--2 paper-info-grid">
          <FormField label="Tên bài báo" required>
            <input className="input" value={form.title} onChange={(event) => handleChange("title", event.target.value)} placeholder="Nhập tên bài báo" required />
          </FormField>

          {categoryMode === "select" ? (
            <FormField label="Danh mục bài báo" required hint={categoriesLoading ? "Đang tải danh mục..." : categoryNote || "Chọn danh mục phù hợp với bài báo."}>
              <select className="input" value={form.category_id} onChange={(event) => handleChange("category_id", event.target.value)} disabled={categoriesLoading} required>
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>
          ) : (
            <FormField label="Mã danh mục" required hint={categoryNote || CATEGORY_ACCESS_NOTE}>
              <input className="input" type="number" min="1" value={form.category_id} onChange={(event) => handleChange("category_id", event.target.value)} placeholder="Ví dụ: 1" required />
            </FormField>
          )}

          <FormField label="Cấp độ bài báo" hint={levelsLoading ? "Đang tải danh sách cấp độ..." : "Chọn cấp độ phù hợp với bài báo (tùy chọn)."}>
            <select className="input" value={form.level_id} onChange={(event) => handleChange("level_id", event.target.value)} disabled={levelsLoading}>
              <option value="">Không chọn</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="paper-classification-field">
            <FormField label="Phân loại học thuật" hint={classificationLoading ? "Đang tải bộ phân loại..." : "Bạn có thể chọn nhiều mục phân loại cho cùng một bài báo."}>
              {classificationLoading ? (
                <div className="muted-text">Đang tải bộ phân loại...</div>
              ) : !classificationGroups.length ? (
                <div className="muted-text">Chưa có dữ liệu phân loại.</div>
              ) : (
                <div className="stack-md">
                  {classificationGroups.map((group) => (
                    <div key={group.id} className="inline-note stack-sm">
                      <div className="table-primary">{group.name}</div>
                      <div className="table-secondary">{group.description || "Chọn một hoặc nhiều mục phù hợp."}</div>
                      <div className="form-grid form-grid--2 paper-classification-options">
                        {group.options.map((option) => (
                          <label key={option.id} className="paper-classification-option">
                            <input
                              type="checkbox"
                              checked={form.classification_option_ids.includes(option.id)}
                              onChange={() => toggleClassificationOption(option.id)}
                            />
                            <span>{option.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </FormField>
          </div>

          <FormField label="Tên tạp chí / hội nghị">
            <input className="input" value={form.journal_name} onChange={(event) => handleChange("journal_name", event.target.value)} placeholder="Ví dụ: Journal of ..." />
          </FormField>

          <FormField label="Năm công bố">
            <input className="input" type="number" min="1900" max="2100" value={form.publication_year} onChange={(event) => handleChange("publication_year", event.target.value)} placeholder="Ví dụ: 2026" />
          </FormField>

          <FormField label="Tập (Volume)">
            <input className="input" value={form.volume} onChange={(event) => handleChange("volume", event.target.value)} placeholder="Ví dụ: 12" />
          </FormField>

          <FormField label="Số (Issue)">
            <input className="input" value={form.issue} onChange={(event) => handleChange("issue", event.target.value)} placeholder="Ví dụ: 3" />
          </FormField>

          <FormField label="Trang">
            <input className="input" value={form.pages} onChange={(event) => handleChange("pages", event.target.value)} placeholder="Ví dụ: 101-118" />
          </FormField>

          <FormField label="DOI">
            <input className="input" value={form.doi} onChange={(event) => handleChange("doi", event.target.value)} placeholder="Ví dụ: 10.xxxx/xxxx" />
          </FormField>
        </div>
      </section>

      <section className="form-section stack-md">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Tệp đính kèm</h2>
            <p className="section-description">Tải trực tiếp tệp bài báo lên hệ thống hoặc dùng liên kết ngoài nếu tài liệu đang được lưu ở nơi khác.</p>
          </div>
        </div>
        <FileAttachmentField
          label="Tệp bài báo"
          file={form.file_upload}
          onFileChange={(file) => handleChange("file_upload", file)}
          linkValue={form.file_url}
          onLinkChange={(value) => handleChange("file_url", value)}
          existingUrl={initialValues?.file_url || ""}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar,.png,.jpg,.jpeg,.ppt,.pptx"
          helperText="Ưu tiên tải tệp trực tiếp lên hệ thống. Nếu chưa có tệp cục bộ, bạn vẫn có thể dùng liên kết ngoài."
        />
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
