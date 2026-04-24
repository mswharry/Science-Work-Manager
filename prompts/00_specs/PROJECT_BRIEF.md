# PROJECT_BRIEF.md

## Tên dự án
Scientific Activity Management System for Faculty of Information Security

## Bối cảnh
Đây là bài tập lớn môn Ngôn ngữ lập trình Python.
Dự án xây dựng hệ thống quản lý hoạt động khoa học cho khoa An toàn thông tin.

## Mục tiêu
Hệ thống hỗ trợ quản lý:
- tài khoản người dùng,
- đề tài nghiên cứu khoa học,
- bài báo khoa học,
- danh mục loại đề tài và loại bài báo,
- thông báo,
- thống kê hoạt động khoa học.

## Đối tượng sử dụng
Hệ thống có 3 nhóm người dùng:
1. Admin
2. Lecturer
3. Student

## Vai trò người dùng

### Admin
- Quản lý tài khoản người dùng
- Duyệt tài khoản lecturer
- Khóa / mở tài khoản
- Duyệt hoặc từ chối đề tài
- Nghiệm thu đề tài
- Duyệt hoặc từ chối bài báo
- Quản lý danh mục
- Gửi thông báo
- Xem dashboard thống kê

### Lecturer
- Đăng ký đề tài
- Cập nhật/xóa đề tài của mình khi chưa được duyệt hoặc bị từ chối
- Khai báo bài báo
- Cập nhật/xóa bài báo của mình khi chưa được duyệt hoặc bị từ chối
- Thêm đồng tác giả cho bài báo của mình
- Xem thông báo
- Xem thống kê top lecturers

### Student
- Đăng ký tài khoản
- Khai báo bài báo
- Xem đề tài, bài báo, thông báo theo quyền
- Xem hồ sơ cá nhân

## Phạm vi chức năng
Dự án gồm 6 nhóm chức năng:
1. Authentication
2. Quản lý người dùng
3. Quản lý đề tài
4. Quản lý bài báo
5. Quản lý danh mục
6. Thông báo và thống kê

## Ràng buộc kỹ thuật
- Backend: FastAPI
- ORM: SQLAlchemy
- Database: SQLite
- Authentication: JWT Bearer Token
- Migration: Alembic
- Frontend: React + Vite
- Mục tiêu ưu tiên: backend chắc, frontend đủ dùng

## Kiến trúc đề xuất
- Kiến trúc modular monolith
- Tách lớp: API Router -> Service -> Model
- Dùng Pydantic schemas cho request/response
- Không viết business logic nặng trong router

## Nguyên tắc triển khai
- Không thêm hoặc bớt use case ngoài danh sách chính thức
- Không tự ý đổi tên endpoint
- Mọi quyết định phải bám theo file:
  - USECASE_SPEC.md
  - API_CONTRACT.md
  - DB_SCHEMA.md
  - STATE_RULES.md
  - CODE_CONVENTIONS.md