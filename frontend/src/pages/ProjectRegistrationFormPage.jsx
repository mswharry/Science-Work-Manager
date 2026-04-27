import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import LoadingState from "../components/common/LoadingState";
import PageHeader from "../components/common/PageHeader";
import ProjectRegistrationForm from "../components/projects/ProjectRegistrationForm";
import { listProjectCategories } from "../services/categoryService";
import { listRegistrationPeriods } from "../services/registrationPeriodService";
import { createProject, getProject, updateProject } from "../services/projectService";
import { uploadProjectFinalReport, uploadProjectProposal } from "../services/uploadService";
import { getApiErrorMessage } from "../utils/apiError";
import { CATEGORY_ACCESS_NOTE } from "../utils/constants";

export default function ProjectRegistrationFormPage({ mode }) {
  const { projectId, periodId } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryMode, setCategoryMode] = useState("select");
  const [categoryNote, setCategoryNote] = useState("");
  const [registrationPeriods, setRegistrationPeriods] = useState([]);
  const [selectedRegistrationPeriod, setSelectedRegistrationPeriod] = useState(null);
  const [pageLoading, setPageLoading] = useState(mode === "edit");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [registrationPeriodsLoading, setRegistrationPeriodsLoading] = useState(mode === "create");
  const [registrationPeriodsError, setRegistrationPeriodsError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadProjectData = async () => {
    if (mode !== "edit") return;
    setPageLoading(true);
    setSubmitError("");
    try {
      const data = await getProject(projectId);
      setInitialValues(data);
    } catch (requestError) {
      setSubmitError(getApiErrorMessage(requestError, "Không thể tải thông tin hồ sơ."));
    } finally {
      setPageLoading(false);
    }
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await listProjectCategories();
      setCategories(data);
      setCategoryMode(data.length ? "select" : "manual");
      setCategoryNote(data.length ? "Chọn danh mục đề tài phù hợp." : CATEGORY_ACCESS_NOTE);
    } catch (requestError) {
      setCategoryMode("manual");
      setCategoryNote(getApiErrorMessage(requestError, CATEGORY_ACCESS_NOTE));
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadRegistrationPeriods = async () => {
    if (mode !== "create") return;
    setRegistrationPeriodsLoading(true);
    setRegistrationPeriodsError("");
    try {
      const data = await listRegistrationPeriods();
      const openPeriods = data.filter((period) => period.is_open);
      setRegistrationPeriods(openPeriods);
      if (periodId) {
        const selectedPeriod = openPeriods.find((period) => String(period.id) === String(periodId));
        if (!selectedPeriod) {
          setRegistrationPeriodsError("Đợt đăng ký được chọn không còn mở hoặc không tồn tại.");
          setRegistrationPeriods([]);
          return;
        }
        setSelectedRegistrationPeriod(selectedPeriod);
      }
    } catch (requestError) {
      setRegistrationPeriods([]);
      setRegistrationPeriodsError(getApiErrorMessage(requestError, "Không thể tải danh sách đợt đăng ký."));
    } finally {
      setRegistrationPeriodsLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [mode, projectId]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadRegistrationPeriods();
  }, [mode, periodId]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setSubmitError("");

    const { proposal_upload, final_report_upload, ...basePayload } = payload;

    try {
      let proposalFile = basePayload.proposal_file || null;
      let finalReportFile = basePayload.final_report_file || null;

      if (proposal_upload) {
        const uploaded = await uploadProjectProposal(proposal_upload);
        proposalFile = uploaded.file_url;
      }
      if (final_report_upload) {
        const uploaded = await uploadProjectFinalReport(final_report_upload);
        finalReportFile = uploaded.file_url;
      }

      let saved;
      if (mode === "edit") {
        saved = await updateProject(projectId, {
          ...basePayload,
          proposal_file: proposalFile,
          final_report_file: finalReportFile,
        });
      } else {
        saved = await createProject({
          ...basePayload,
          proposal_file: proposalFile,
          final_report_file: finalReportFile,
        });
      }

      navigate(`/projects/${saved.id}`);
    } catch (requestError) {
      setSubmitError(getApiErrorMessage(requestError, "Không thể lưu hồ sơ."));
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return <LoadingState title="Đang chuẩn bị biểu mẫu" message="Hệ thống đang tải dữ liệu hồ sơ cần chỉnh sửa." />;
  }

  if (mode === "edit" && submitError && !initialValues) {
    return <ErrorState title="Không thể mở biểu mẫu" message={submitError} onRetry={loadProjectData} />;
  }

  if (mode === "create" && registrationPeriodsLoading) {
    return <LoadingState title="Đang tải đợt đăng ký" message="Hệ thống đang lấy danh sách đợt đăng ký còn hiệu lực." />;
  }

  if (mode === "create" && registrationPeriodsError) {
    return (
      <ErrorState
        title="Không thể tải đợt đăng ký"
        message={registrationPeriodsError}
        onRetry={loadRegistrationPeriods}
      />
    );
  }

  if (mode === "create" && !registrationPeriodsLoading && !registrationPeriods.length) {
    return (
      <div className="stack-xl">
        <PageHeader
          eyebrow="Hồ sơ đề tài"
          title="Chọn đợt đăng ký đề tài"
          description="Bạn cần có ít nhất một đợt đăng ký đang mở trước khi tạo hồ sơ mới."
        />
        <EmptyState
          title="Chưa có đợt đăng ký nào đang mở"
          message="Hiện tại hệ thống chưa công bố đợt đăng ký phù hợp để tạo hồ sơ mới."
        />
      </div>
    );
  }

  return (
    <div className="stack-xl">
      <PageHeader
        eyebrow="Hồ sơ đề tài"
        title={mode === "edit" ? "Chỉnh sửa hồ sơ" : selectedRegistrationPeriod ? "Khai báo hồ sơ mới" : "Chọn đợt đăng ký đề tài"}
        description={
          mode === "edit"
            ? "Nhập đầy đủ thông tin để cập nhật hồ sơ đăng ký đề tài."
            : selectedRegistrationPeriod
              ? "Nhập đầy đủ thông tin để tạo hồ sơ đăng ký đề tài, bao gồm cả tệp đính kèm nếu có."
              : "Chọn một đợt đăng ký đang mở để tiếp tục tạo hồ sơ."
        }
      />
      {mode === "create" && !selectedRegistrationPeriod ? (
        <section className="panel stack-md">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Đợt đăng ký đang mở</h2>
              <p className="section-description">Chọn một đợt đăng ký để mở biểu mẫu tạo hồ sơ.</p>
            </div>
          </div>
          <div className="stack-md">
            {registrationPeriods.map((period) => (
              <div key={period.id} className="panel stack-sm">
                <div className="section-heading">
                  <div>
                    <h3 className="section-title">{period.title}</h3>
                    <p className="section-description">{period.description || "Đợt đăng ký đang mở."}</p>
                  </div>
                  <button type="button" className="button" onClick={() => setSelectedRegistrationPeriod(period)}>
                    Chọn đợt này
                  </button>
                </div>
                {period.requirements ? <p className="section-description">{period.requirements}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {mode === "edit" || selectedRegistrationPeriod ? (
        <section className="panel stack-md">
          <div className="section-heading">
            <div>
              <h2 className="section-title">
                {mode === "edit" ? "Thông tin hồ sơ" : `Đợt đã chọn: ${selectedRegistrationPeriod.title}`}
              </h2>
              <p className="section-description">
                {mode === "edit"
                  ? "Chỉnh sửa thông tin hồ sơ đang có."
                  : "Biểu mẫu sẽ sử dụng đợt đăng ký bạn vừa chọn."}
              </p>
            </div>
          </div>
          <ProjectRegistrationForm
            initialValues={initialValues}
            mode={mode}
            categories={categories}
            categoriesLoading={categoriesLoading}
            categoryMode={categoryMode}
            categoryNote={categoryNote}
            registrationPeriod={selectedRegistrationPeriod}
            onSubmit={handleSubmit}
            onCancel={() => navigate(mode === "edit" ? `/projects/${projectId}` : "/registration-periods")}
            submitting={submitting}
            submitError={submitError}
          />
        </section>
      ) : null}
    </div>
  );
}
