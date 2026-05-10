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
        element: <ProtectedRoute roles={[ROLES.LECTURER, ROLES.STUDENT]} />,
        children: [{ path: "papers/new", element: <PaperFormPage mode="create" /> }],
      },
      {
        element: <ProtectedRoute roles={[ROLES.ADMIN]} />,
        children: [{ path: "admin", element: <AdminPage /> }],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;
