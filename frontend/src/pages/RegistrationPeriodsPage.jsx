import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import { useAuth } from "../contexts/AuthContext";
import { listRegistrationPeriods } from "../services/registrationPeriodService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDate } from "../utils/formatters";
import { canCreateProject } from "../utils/permissions";

export default function RegistrationPeriodsPage() {
  const { user } = useAuth();
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listRegistrationPeriods();
      setPeriods(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải thông tin đợt đăng ký."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Đợt đăng ký"
        title="Thông tin đợt đăng ký đề tài"
        description="Xem thời gian đăng ký, điều kiện tham gia và yêu cầu liên quan do nhà trường hoặc khoa công bố."
      />

      {loading ? <LoadingState title="Đang tải đợt đăng ký" message="Hệ thống đang lấy danh sách đợt đăng ký đề tài." /> : null}
      {!loading && error ? <ErrorState title="Không thể tải đợt đăng ký" message={error} onRetry={loadData} /> : null}

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
          <EmptyState title="Chưa có đợt đăng ký" message="Hiện tại hệ thống chưa có đợt đăng ký đề tài nào." />
        )
      ) : null}
    </div>
  );
}
