const EXACT_MESSAGE_MAP = {
  "Định dạng tệp không được hỗ trợ. Vui lòng dùng PDF, Word, Excel, ảnh hoặc tệp nén phổ biến.": "Định dạng tệp không được hỗ trợ. Vui lòng dùng PDF, Word, Excel, ảnh hoặc tệp nén phổ biến.",
  "Tệp tải lên không hợp lệ.": "Tệp tải lên không hợp lệ.",
  "Lecturer account is waiting for admin approval.": "Tài khoản giảng viên của bạn đang chờ quản trị viên phê duyệt. Vui lòng thử lại sau hoặc liên hệ quản trị viên.",
  "Category with this name already exists for the selected type.": "Danh mục này đã tồn tại trong nhóm đang chọn.",
  "Invalid email or password.": "Email hoặc mật khẩu không đúng.",
  "Your account is blocked.": "Tài khoản của bạn hiện đang bị khóa.",
  "Email already exists.": "Email này đã được sử dụng.",
  "Duplicate student_id, staff_id, or email.": "Email, mã sinh viên hoặc mã cán bộ đã tồn tại trong hệ thống.",
  "student_id is required for student registration.": "Vui lòng nhập mã sinh viên.",
  "staff_id is required for lecturer registration.": "Vui lòng nhập mã cán bộ.",
  "Public register only supports student or lecturer role.": "Chức năng đăng ký chỉ hỗ trợ tài khoản sinh viên hoặc giảng viên.",
  "Invalid authentication token.": "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  "Inactive account.": "Tài khoản hiện không hoạt động.",
  "Admin role required.": "Bạn không có quyền truy cập khu vực quản trị.",
  "Invalid role filter.": "Bộ lọc vai trò không hợp lệ.",
  "Approved role must be student or lecturer.": "Vai trò được phê duyệt chỉ có thể là sinh viên hoặc giảng viên.",
  "Failed to update user due to data constraint.": "Không thể cập nhật tài khoản do xung đột dữ liệu.",
  "Invalid category type.": "Loại danh mục không hợp lệ.",
  "Category not found.": "Không tìm thấy danh mục.",
  "Cannot delete this category because it is being used.": "Không thể xóa danh mục vì đang có hồ sơ sử dụng.",
  "target_role must be one of: all, lecturer, student.": "Nhóm người nhận không hợp lệ.",
  "Invalid project status.": "Trạng thái đề tài không hợp lệ.",
  "category_id must belong to a project_type category.": "Mã danh mục đề tài không hợp lệ. Vui lòng chọn một danh mục từ danh sách hiện có.",
  "end_date must be greater than or equal to start_date.": "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.",
  "Failed to create project.": "Không thể tạo đề tài.",
  "Students are not allowed to create projects.": "Sinh viên không được phép tự tạo đề tài.",
  "Project not found.": "Không tìm thấy đề tài.",
  "You do not have permission to view this project.": "Bạn không có quyền xem đề tài này.",
  "Only project leader can modify this project.": "Chỉ chủ nhiệm đề tài mới có quyền chỉnh sửa hồ sơ này.",
  "Project can only be modified when status is pending or rejected.": "Chỉ có thể chỉnh sửa đề tài khi trạng thái là chờ duyệt hoặc bị từ chối.",
  "Failed to update project.": "Không thể cập nhật đề tài.",
  "Only pending projects can be reviewed.": "Chỉ có thể duyệt các đề tài đang ở trạng thái chờ duyệt.",
  "Only approved projects can be completed.": "Chỉ có thể đánh dấu hoàn thành với đề tài đã được phê duyệt.",
  "Invalid paper status.": "Trạng thái bài báo không hợp lệ.",
  "category_id must belong to a paper_type category.": "Mã danh mục bài báo không hợp lệ. Vui lòng chọn một danh mục từ danh sách hiện có.",
  "Failed to create paper.": "Không thể tạo bài báo.",
  "Student paper requires a supervising lecturer.": "Sinh viên khai báo bài báo bắt buộc phải chọn giảng viên hướng dẫn.",
  "Supervisor lecturer not found.": "Không tìm thấy giảng viên hướng dẫn đã chọn.",
  "supervisor_lecturer_id must reference an active approved lecturer.": "Giảng viên hướng dẫn phải là tài khoản giảng viên đang hoạt động và đã được phê duyệt.",
  "Paper not found.": "Không tìm thấy bài báo.",
  "You do not have permission to view this paper.": "Bạn không có quyền xem bài báo này.",
  "Only paper author can modify this paper.": "Chỉ tác giả khai báo mới có quyền chỉnh sửa hồ sơ bài báo này.",
  "Paper can only be modified when status is pending or rejected.": "Chỉ có thể chỉnh sửa bài báo khi trạng thái là chờ duyệt hoặc bị từ chối.",
  "Failed to update paper.": "Không thể cập nhật bài báo.",
  "Only pending papers can be reviewed.": "Chỉ có thể duyệt các bài báo đang ở trạng thái chờ duyệt.",
  "Only paper creator or admin can add authors.": "Chỉ người tạo bài báo hoặc quản trị viên mới có thể thêm đồng tác giả.",
  "Author user not found.": "Không tìm thấy người dùng cần thêm làm đồng tác giả.",
  "This user is already an author of the paper.": "Người dùng này đã là tác giả của bài báo.",
  "Failed to add paper author.": "Không thể thêm đồng tác giả vào bài báo.",
  "Action must be approve or reject.": "Hành động không hợp lệ. Vui lòng chọn phê duyệt hoặc từ chối.",
};

const PARTIAL_MESSAGE_MAP = [
  ["Field required", "Trường này là bắt buộc."],
  ["Input should be a valid integer", "Giá trị phải là số nguyên hợp lệ."],
  ["Input should be a valid number", "Giá trị phải là số hợp lệ."],
  ["Input should be a valid date", "Ngày không hợp lệ."],
  ["Input should be a valid string", "Dữ liệu văn bản không hợp lệ."],
  ["String should have at least", "Độ dài nội dung chưa đạt yêu cầu tối thiểu."],
  ["String should have at most", "Nội dung vượt quá độ dài cho phép."],
  ["Request failed with status code 500", "Máy chủ gặp lỗi khi xử lý yêu cầu. Vui lòng thử lại hoặc kiểm tra backend."],
  ["Internal Server Error", "Máy chủ gặp lỗi khi xử lý yêu cầu. Vui lòng thử lại hoặc kiểm tra backend."],
];

function translateErrorText(message) {
  if (typeof message !== "string") {
    return message;
  }

  const trimmed = message.trim();

  if (EXACT_MESSAGE_MAP[trimmed]) {
    return EXACT_MESSAGE_MAP[trimmed];
  }

  const partial = PARTIAL_MESSAGE_MAP.find(([source]) => trimmed.includes(source));
  if (partial) {
    return partial[1];
  }

  if (trimmed === "Network Error") {
    return "Không thể kết nối tới máy chủ. Vui lòng kiểm tra backend hoặc thử lại sau.";
  }

  return trimmed;
}

function flattenErrorDetail(detail) {
  if (!detail) {
    return "Phản hồi máy chủ không hợp lệ.";
  }

  if (typeof detail === "string") {
    return translateErrorText(detail);
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") {
          return translateErrorText(item);
        }

        if (item?.msg) {
          const location = Array.isArray(item.loc)
            ? item.loc
                .filter((part) => part !== "body")
                .map((part) => String(part))
                .join(" → ")
            : "";
          const message = translateErrorText(item.msg);
          return location ? `${location}: ${message}` : message;
        }

        return JSON.stringify(item);
      })
      .join(" • ");
  }

  if (typeof detail === "object") {
    if (typeof detail.message === "string") {
      return translateErrorText(detail.message);
    }

    return Object.entries(detail)
      .map(([key, value]) => `${key}: ${flattenErrorDetail(value)}`)
      .join(" • ");
  }

  return "Phản hồi máy chủ không hợp lệ.";
}

export function getApiErrorMessage(error, fallback = "Có lỗi xảy ra.") {
  if (!error) {
    return fallback;
  }

  const responseData = error?.response?.data;

  if (responseData?.detail) {
    return flattenErrorDetail(responseData.detail);
  }

  if (responseData?.message) {
    return flattenErrorDetail(responseData.message);
  }

  if (typeof error.message === "string") {
    return translateErrorText(error.message);
  }

  return fallback;
}
