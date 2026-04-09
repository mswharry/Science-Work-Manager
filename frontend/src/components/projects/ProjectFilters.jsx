import { PROJECT_STATUS_OPTIONS } from "../../utils/constants";
import FormField from "../common/FormField";

export default function ProjectFilters({ filters, onChange, onSubmit, onReset }) {
  return (
    <form className="panel filter-panel" onSubmit={onSubmit}>
      <div className="section-heading">
        <div>
          <h2 className="section-title">Bộ lọc đề tài</h2>
          <p className="section-description">Tìm kiếm theo tên, trạng thái, năm thực hiện hoặc chỉ hiển thị hồ sơ của bạn.</p>
        </div>
      </div>

      <div className="filter-grid filter-grid--4">
        <FormField label="Từ khóa">
          <input
            className="input"
            value={filters.keyword}
            onChange={(event) => onChange("keyword", event.target.value)}
            placeholder="Tên đề tài hoặc nội dung liên quan"
          />
        </FormField>

        <FormField label="Trạng thái">
          <select className="input" value={filters.status} onChange={(event) => onChange("status", event.target.value)}>
            {PROJECT_STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Năm thực hiện">
          <input
            className="input"
            type="number"
            min="1900"
            max="2100"
            value={filters.year}
            onChange={(event) => onChange("year", event.target.value)}
            placeholder="Ví dụ: 2026"
          />
        </FormField>

        <FormField label="Phạm vi hiển thị">
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={filters.mine}
              onChange={(event) => onChange("mine", event.target.checked)}
            />
            <span>Chỉ hiển thị đề tài của tôi</span>
          </label>
        </FormField>
      </div>

      <div className="filter-footer">
        <span className="muted-text">Bộ lọc chỉ ảnh hưởng tới danh sách đang hiển thị trên màn hình này.</span>
        <div className="button-row">
          <button type="button" className="button button--secondary" onClick={onReset}>
            Đặt lại
          </button>
          <button type="submit" className="button">
            Áp dụng bộ lọc
          </button>
        </div>
      </div>
    </form>
  );
}
