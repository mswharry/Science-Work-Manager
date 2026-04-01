import { Link } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";

export default function NotFoundPage() {
  return (
    <div className="stack-xl">
      <div className="notfound-card">
        <EmptyState
          title="Không tìm thấy trang"
          message="Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi trong hệ thống."
          action={
            <Link to="/" className="button nav-button-link">
              Quay về trang chủ
            </Link>
          }
        />
      </div>
    </div>
  );
}
