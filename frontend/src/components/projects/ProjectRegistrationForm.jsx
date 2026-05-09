import { useEffect, useState } from "react";
import { CATEGORY_ACCESS_NOTE } from "../../utils/constants";
import { normalizeOptionalNumber, normalizeOptionalText } from "../../utils/formatters";
import FormField from "../common/FormField";
import FileAttachmentField from "../common/FileAttachmentField";

function createDefaultForm(initialValues, registrationPeriod) {
  return {
    name: initialValues?.name || "",
    category_id: initialValues?.category_id || "",
    registration_period_id: initialValues?.registration_period_id || registrationPeriod?.id || "",
    budget: initialValues?.budget ?? "",
    start_date: initialValues?.start_date || "",
    end_date: initialValues?.end_date || "",
    description: initialValues?.description || "",
    proposal_file: "",
    final_report_file: "",
    proposal_upload: null,
    final_report_upload: null,
  };
}

export default function ProjectRegistrationForm({
  initialValues,
  mode,
  categories,
  categoriesLoading,
  categoryMode,
  categoryNote,
  registrationPeriod,
  onSubmit,
  onCancel,
  submitting,
  submitError,
}) {
  const [form, setForm] = useState(createDefaultForm(initialValues, registrationPeriod));

  useEffect(() => {
    setForm(createDefaultForm(initialValues, registrationPeriod));
  }, [initialValues, registrationPeriod]);

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const proposalFile = form.proposal_upload
      ? form.proposal_file.trim() || initialValues?.proposal_file || null
      : form.proposal_file.trim() || initialValues?.proposal_file || null;
    const finalReportFile = form.final_report_upload
      ? form.final_report_file.trim() || initialValues?.final_report_file || null
      : form.final_report_file.trim() || initialValues?.final_report_file || null;

    onSubmit({
      name: form.name.trim(),
      category_id: Number(form.category_id),
      registration_period_id: mode === "create" ? Number(form.registration_period_id) : undefined,
      budget: normalizeOptionalNumber(form.budget),
      start_date: normalizeOptionalText(form.start_date),
      end_date: normalizeOptionalText(form.end_date),
      description: normalizeOptionalText(form.description),
      proposal_file: proposalFile,
      final_report_file: finalReportFile,
      proposal_upload: form.proposal_upload || null,
      final_report_upload: form.final_report_upload || null,
    });
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
            <input className="input" value={form.name} onChange={(event) => handleChange("name", event.target.value)} placeholder="Nhập tên đề tài nghiên cứu" required />
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
                    {category.name}
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

          {mode === "create" ? (
            <FormField label="Đợt đăng ký đề tài" hint="Đợt đăng ký đã được chọn trước khi mở form.">
              <input className="input" value={registrationPeriod?.title || ""} disabled />
            </FormField>
          ) : (
            <FormField label="Đợt đăng ký đề tài" hint="Đợt đăng ký đã được gắn sẵn với hồ sơ này.">
              <input className="input" value={initialValues?.registration_period_name || ""} disabled />
            </FormField>
          )}

          <FormField label="Kinh phí">
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={form.budget}
              onChange={(event) => handleChange("budget", event.target.value)}
              placeholder="Nhập kinh phí nếu có"
            />
          </FormField>

          <FormField label="Ngày bắt đầu">
            <input className="input" type="date" value={form.start_date} onChange={(event) => handleChange("start_date", event.target.value)} />
          </FormField>

          <FormField label="Ngày kết thúc">
            <input className="input" type="date" value={form.end_date} onChange={(event) => handleChange("end_date", event.target.value)} />
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
          <textarea className="textarea" rows="5" value={form.description} onChange={(event) => handleChange("description", event.target.value)} placeholder="Nội dung mô tả đề tài" />
        </FormField>
      </section>

      <section className="form-section stack-md">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Tệp đính kèm</h2>
            <p className="section-description">Tải tệp lên hệ thống hoặc dùng liên kết ngoài nếu hồ sơ được lưu trên nền tảng khác.</p>
          </div>
        </div>
        <div className="form-grid form-grid--2">
          <FileAttachmentField
            label="Tệp đề cương"
            file={form.proposal_upload}
            onFileChange={(file) => handleChange("proposal_upload", file)}
            linkValue={form.proposal_file}
            onLinkChange={(value) => handleChange("proposal_file", value)}
            existingUrl={initialValues?.proposal_file || ""}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar,.png,.jpg,.jpeg,.ppt,.pptx"
            helperText="Đề cương nghiên cứu hoặc tài liệu mô tả ban đầu."
          />
          <FileAttachmentField
            label="Báo cáo cuối cùng"
            file={form.final_report_upload}
            onFileChange={(file) => handleChange("final_report_upload", file)}
            linkValue={form.final_report_file}
            onLinkChange={(value) => handleChange("final_report_file", value)}
            existingUrl={initialValues?.final_report_file || ""}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar,.png,.jpg,.jpeg,.ppt,.pptx"
            helperText="Báo cáo tổng kết hoặc tài liệu hoàn thành đề tài."
          />
        </div>
      </section>

      {submitError ? <div className="notice notice--danger">{submitError}</div> : null}

      <div className="button-row">
        <button type="submit" className="button" disabled={submitting || (mode === "create" && !registrationPeriod)}>
          {submitting ? "Đang lưu..." : mode === "edit" ? "Lưu thay đổi" : "Tạo hồ sơ"}
        </button>
        <button type="button" className="button button--secondary" onClick={onCancel} disabled={submitting}>
          Hủy
        </button>
      </div>
    </form>
  );
}
