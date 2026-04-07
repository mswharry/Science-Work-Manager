import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingState from "./LoadingState";

export default function ProtectedRoute({ children, roles = [] }) {
  const { loading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <LoadingState
        title="Đang kiểm tra phiên đăng nhập"
        message="Hệ thống đang chuẩn bị không gian làm việc của bạn."
        fullHeight
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}
