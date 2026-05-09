import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import FormField from "../components/common/FormField";
import { useAuth } from "../contexts/AuthContext";
import { listRegistrationPeriods } from "../services/registrationPeriodService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDate } from "../utils/formatters";
import { canCreateProject } from "../utils/permissions";

export default function RegistrationPeriodsPage() {
  const { user } = useAuth();
  const [periods, setPeriods] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [draftKeyword, setDraftKeyword] = useState("");
  const [year, setYear] = useState("");
  const [draftYear, setDraftYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async (filters = { keyword, year }) => {
    setLoading(true);
    setError("");
    try {
      const data = await listRegistrationPeriods(filters);
      setPeriods(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải thông tin đợt đăng ký."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData({ keyword, year });
  }, [keyword, year]);

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Đợt đăng ký"
        title="Thông tin đợt đăng ký đề tài"
        description="Xem thời gian đăng ký, điều kiện tham gia và yêu cầu liên quan do nhà trường hoặc khoa công bố."
      />

      <form
        className="panel filter-panel"
        onSubmit={(event) => {
          event.preventDefault();
          setKeyword(draftKeyword.trim());
          setYear(draftYear.trim());
        }}
      >
        <div className="section-heading">
          <div>
            <h2 className="section-title">Tra cứu đợt đăng ký</h2>
            <p className="section-description">Tìm theo tên đợt, mô tả hoặc yêu cầu áp dụng.</p>
          </div>
        </div>

        <div className="filter-grid filter-grid--2">
          <FormField label="Từ khóa">
            <input
              className="input"
              value={draftKeyword}
              onChange={(event) => setDraftKeyword(event.target.value)}
              placeholder="Ví dụ: học kỳ, nghiên cứu, đề tài"
            />
          </FormField>

          <FormField label="Năm">
            <input
              className="input"
              type="number"
              min="1900"
              max="2100"
              value={draftYear}
              onChange={(event) => setDraftYear(event.target.value)}
              placeholder="Ví dụ: 2026"
            />
          </FormField>
        </div>

        <div className="filter-footer">
          <span className="muted-text">Kết quả tra cứu sẽ được lọc ngay trên danh sách đợt đăng ký hiện có.</span>
          <div className="button-row">
            <button
              type="button"
              className="button button--secondary"
              onClick={() => {
                setDraftKeyword("");
                setDraftYear("");
                setKeyword("");
                setYear("");
              }}
            >
              Đặt lại
            </button>
            <button type="submit" className="button">
              Tra cứu
            </button>
          </div>
        </div>
      </form>

      {loading ? <LoadingState title="Đang tải đợt đăng ký" message="Hệ thống đang lấy danh sách đợt đăng ký đề tài." /> : null}
      {!loading && error ? <ErrorState title="Không thể tải đợt đăng ký" message={error} onRetry={() => loadData({ keyword, year })} /> : null}

      {!loading && !error ? (
        periods.length ? (
          <div className="stack-md">
            {periods.map((period) => (
              <section key={period.id} className="panel stack-md">
                <div className="section-heading">
                  <div>
                    <h2 className="section-title">{period.title}</h2>
                    <p className="section-description">{period.is_open ? "Đang mở đăng ký" : "Đã đóng đăng ký"}</p>
                  </div>
                  {period.is_open && canCreateProject(user) ? (
                    <Link to={`/registration-periods/${period.id}/create`} className="button nav-button-link">
                      Tạo hồ sơ
                    </Link>
                  ) : null}
                </div>

                <div className="key-value-list">
                  <div className="key-value-list__item">
                    <span className="key-value-list__label">Thời gian</span>
                    <span className="key-value-list__value">
                      {formatDate(period.registration_start)} - {formatDate(period.registration_end)}
                    </span>
                  </div>
                  <div className="key-value-list__item">
                    <span className="key-value-list__label">Điều kiện</span>
                    <span className="key-value-list__value">{period.description || "—"}</span>
                  </div>
                  <div className="key-value-list__item">
                    <span className="key-value-list__label">Yêu cầu</span>
                    <span className="key-value-list__value">{period.requirements || "—"}</span>
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            title={keyword || year ? "Không tìm thấy dữ liệu phù hợp" : "Chưa có đợt đăng ký"}
            message={keyword || year ? "Hãy thử đổi từ khóa hoặc năm tra cứu khác." : "Hiện tại hệ thống chưa có đợt đăng ký đề tài nào."}
          />
        )
      ) : null}
    </div>
  );
}
