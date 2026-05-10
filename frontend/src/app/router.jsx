import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/common/Layout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage";
import ProjectRegistrationPage from "../pages/ProjectRegistrationPage";
import ProjectRegistrationDetailPage from "../pages/ProjectRegistrationDetailPage";
import ProjectRegistrationFormPage from "../pages/ProjectRegistrationFormPage";
import ProjectRegistrationHistoryPage from "../pages/ProjectRegistrationHistoryPage";
import ApprovalListPage from "../pages/ApprovalListPage";
import ApprovalDetailPage from "../pages/ApprovalDetailPage";
import AssignReviewerFormPage from "../pages/AssignReviewerFormPage";
import ApprovalDecisionFormPage from "../pages/ApprovalDecisionFormPage";
import RevisionRequestFormPage from "../pages/RevisionRequestFormPage";
import ApprovalHistoryPage from "../pages/ApprovalHistoryPage";
import ReviewFeedbackListPage from "../pages/ReviewFeedbackListPage";
import ReviewFeedbackFormPage from "../pages/ReviewFeedbackFormPage";
import RevisionSubmissionPage from "../pages/RevisionSubmissionPage";
import RegistrationPeriodsPage from "../pages/RegistrationPeriodsPage";
import PapersPage from "../pages/PapersPage";
import PaperDetailPage from "../pages/PaperDetailPage";
import PaperFormPage from "../pages/PaperFormPage";
import AcademicPlansPage from "../pages/AcademicPlansPage";
import AdminPage from "../pages/AdminPage";
import DashboardPage from "../pages/DashboardPage";
import NotFoundPage from "../pages/NotFoundPage";
import { ROLES } from "../utils/constants";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "profile", element: <ProfilePage /> },
          { path: "projects", element: <ProjectRegistrationPage /> },
          { path: "registration-periods", element: <RegistrationPeriodsPage /> },
          { path: "projects/:projectId", element: <ProjectRegistrationDetailPage /> },
          { path: "projects/:projectId/approval-history", element: <ApprovalHistoryPage /> },
          { path: "projects/:projectId/history", element: <ProjectRegistrationHistoryPage /> },
          { path: "projects/:projectId/edit", element: <ProjectRegistrationFormPage mode="edit" /> },
          { path: "papers", element: <PapersPage /> },
          { path: "papers/:paperId", element: <PaperDetailPage /> },
          { path: "papers/:paperId/edit", element: <PaperFormPage mode="edit" /> },
          { path: "plans", element: <AcademicPlansPage /> },
          { path: "dashboard", element: <DashboardPage /> },
        ],
      },
      {
        element: <ProtectedRoute roles={[ROLES.LECTURER]} />,
        children: [{ path: "registration-periods/:periodId/create", element: <ProjectRegistrationFormPage mode="create" /> }],
      },
      {
        element: <ProtectedRoute roles={[ROLES.LECTURER]} />,
        children: [
          { path: "review-assignments", element: <ReviewFeedbackListPage /> },
          { path: "review-assignments/:assignmentId", element: <ReviewFeedbackFormPage /> },
          { path: "revisions/:roundId", element: <RevisionSubmissionPage /> },
        ],
      },
      {
        element: <ProtectedRoute roles={[ROLES.LECTURER, ROLES.STUDENT]} />,
        children: [{ path: "papers/new", element: <PaperFormPage mode="create" /> }],
      },
      {
        element: <ProtectedRoute roles={[ROLES.ADMIN]} />,
        children: [
          { path: "admin", element: <AdminPage /> },
          { path: "approvals", element: <ApprovalListPage /> },
          { path: "approvals/:projectId", element: <ApprovalDetailPage /> },
          { path: "approvals/:projectId/assign", element: <AssignReviewerFormPage /> },
          { path: "approvals/:projectId/decision", element: <ApprovalDecisionFormPage /> },
          { path: "approvals/:projectId/revision-request", element: <RevisionRequestFormPage /> },
          { path: "approvals/:projectId/history", element: <ApprovalHistoryPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;
