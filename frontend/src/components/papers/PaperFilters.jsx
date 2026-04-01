import { PAPER_STATUS_OPTIONS } from "../../utils/constants";
import FormField from "../common/FormField";

export default function PaperFilters({ filters, onChange, onSubmit, onReset }) {
  return (
    <form className="panel filter-panel" onSubmit={onSubmit}>
      <div className="section-heading">
        <div>
          <h2 className="section-title">Bộ lọc bài báo</h2>
          <p className="section-description">Lọc theo năm công bố, trạng thái, mã danh mục hoặc chỉ hiển thị hồ sơ của bạn.</p>
        </div>
      </div>

      <div className="filter-grid filter-grid--4">
        <FormField label="Năm công bố">
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

        <FormField label="Trạng thái">
          <select className="input" value={filters.status} onChange={(event) => onChange("status", event.target.value)}>
            {PAPER_STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Mã danh mục">
          <input
            className="input"
            type="number"
            min="1"
            value={filters.category_id}
            onChange={(event) => onChange("category_id", event.target.value)}
            placeholder="Ví dụ: 1"
          />
        </FormField>

        <FormField label="Phạm vi hiển thị">
          <label className="checkbox-field">
            <input type="checkbox" checked={filters.mine} onChange={(event) => onChange("mine", event.target.checked)} />
            <span>Chỉ hiển thị bài báo của tôi</span>
          </label>
        </FormField>
      </div>

      <div className="filter-footer">
        <span className="muted-text">Kết quả hiển thị dựa trên quyền hiện tại và bộ lọc bạn đã áp dụng.</span>
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
