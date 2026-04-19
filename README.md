# Science-Work-Manager

BTL Web hệ thống quản lý hoạt động nghiên cứu khoa học cho khoa An toàn thông tin PTIT.

## 1. Dự án này đang làm những gì?

Hệ thống đang số hóa toàn bộ quy trình quản lý hoạt động khoa học trong khoa, gồm các luồng chính:

1. Quản lý tài khoản và phân quyền theo 3 vai trò: `admin`, `lecturer`, `student`.
2. Quản lý đề tài nghiên cứu theo vòng đời trạng thái (`pending -> approved/rejected -> completed`).
3. Quản lý bài báo khoa học theo quy trình duyệt (`pending -> approved/rejected`).
4. Quản lý danh mục loại đề tài/loại bài báo để chuẩn hóa dữ liệu đầu vào.
5. Quản lý thông báo theo đối tượng nhận (`all`, `lecturer`, `student`).
6. Thống kê tổng hợp phục vụ dashboard quản trị và bảng xếp hạng giảng viên.
7. Tải tệp minh chứng (proposal, final report, paper file) và lưu đường dẫn để đính kèm hồ sơ.

## 2. Luồng end-to-end (UI -> Backend -> Data)

Luồng tổng quát mỗi tính năng đang vận hành theo mô hình:

`React page/component` -> `frontend service (axios)` -> `FastAPI endpoint` -> `service layer` -> `SQLAlchemy model` -> `SQLite`

Ví dụ luồng duyệt đề tài:

1. Admin thao tác trên giao diện quản trị.
2. Frontend gọi `PUT /api/v1/admin/projects/{id}/review`.
3. Backend endpoint chuyển sang `project_service.review_project`.
4. Service kiểm tra quyền + trạng thái hợp lệ (`pending`) rồi cập nhật DB.
5. UI nhận dữ liệu đã cập nhật và render lại danh sách/chi tiết.

## 3. Tính năng đã triển khai theo module

### 3.1 Authentication
- Đăng ký (`/auth/register`) cho `student`, `lecturer`.
- Đăng nhập (`/auth/login`) dùng JWT Bearer token.
- Lấy thông tin người dùng hiện tại (`/users/me`).
- Rule hiện tại:
	- Sinh viên đăng ký xong có thể hoạt động ngay (`is_approved=true`).
	- Giảng viên cần admin duyệt trước khi đăng nhập đầy đủ.

### 3.2 User Management (Admin)
- Liệt kê user có filter role/active/approved.
- Duyệt user và đổi role student/lecturer.
- Khóa hoặc mở tài khoản.
- Tra cứu danh sách giảng viên đã được duyệt để gán vào nghiệp vụ khác.

### 3.3 Category Management (Admin)
- CRUD riêng cho 2 nhóm:
	- `project_type`
	- `paper_type`
- Chặn trùng tên trong cùng loại category.
- Có API public (yêu cầu đăng nhập) để frontend lấy danh mục dùng trong form.

### 3.4 Project Management
- Tạo / sửa / xóa / xem danh sách / xem chi tiết đề tài.
- Duyệt hoặc từ chối đề tài bởi admin.
- Nghiệm thu đề tài bởi admin.
- Luồng bổ sung đang có trong code: leader phải gửi yêu cầu nghiệm thu trước (`request-completion`) thì admin mới complete được.
- Rule hiện tại theo code:
	- Chỉ `lecturer` được tạo đề tài.
	- Chỉ leader được sửa/xóa khi trạng thái `pending` hoặc `rejected`.
	- Sửa từ `rejected` sẽ tự động quay về `pending`.

### 3.5 Paper Management
- Tạo / sửa / xóa / xem danh sách / xem chi tiết bài báo.
- Duyệt hoặc từ chối bài báo bởi admin (endpoint tên `approve` nhưng hỗ trợ action `approve/reject`).
- Thêm đồng tác giả vào bài báo.
- Rule hiện tại theo code:
	- `admin` không được tạo bài báo.
	- `student` bắt buộc khai báo giảng viên hướng dẫn hợp lệ.
	- Chỉ tác giả mới sửa/xóa khi trạng thái `pending` hoặc `rejected`.
	- Sửa từ `rejected` sẽ quay về `pending`.

### 3.6 Notifications
- Admin tạo thông báo.
- User xem thông báo theo vai trò nhận.
- Chỉ lấy các thông báo còn hiệu lực (`is_active=true`).

### 3.7 Statistics
- Dashboard admin: tổng user/project/paper, phân bố trạng thái, thống kê theo năm.
- Top lecturers: top 5 giảng viên theo số bài báo `approved`.

### 3.8 Uploads
- Upload file bài báo.
- Upload proposal và final report của đề tài.
- Kiểm tra định dạng cho phép + giới hạn dung lượng file.
- Mount static `/uploads` để tải/xem file.

## 4. Quy trình quản lý tính năng đang áp dụng

Phần này tách làm 2 lớp: quản lý tính năng trong phát triển phần mềm và quản lý tính năng trong vận hành nghiệp vụ.

### 4.1 Quy trình quản lý tính năng trong phát triển (team workflow)

Nhóm đang quản lý feature theo hướng spec-first:

1. Chốt spec từ bộ tài liệu chuẩn (`USECASE_SPEC`, `API_CONTRACT`, `DB_SCHEMA`, `STATE_RULES`, `CODE_CONVENTIONS`).
2. Chia ownership theo module (Core/Auth/Users, Projects/Categories, Papers/Statistics, Frontend/Notifications/Integration).
3. Mỗi thành viên phát triển trên nhánh riêng (`feature/*`).
4. Chỉ merge khi code không lệch spec và không phá API hiện có.
5. Nếu đổi hành vi nghiệp vụ thì cập nhật lại spec trước khi merge.
6. Tích hợp tại `dev`, ổn định mới đưa về `main`.

### 4.2 Quy trình quản lý tính năng trong vận hành hệ thống

#### Quy trình tài khoản
1. Student/Lecturer đăng ký.
2. Student có thể hoạt động ngay.
3. Lecturer chờ admin duyệt (`is_approved`).
4. Admin có thể khóa/mở user (`is_active`).

#### Quy trình đề tài
1. Tạo mới đề tài -> `pending`.
2. Admin review: `approve` hoặc `reject`.
3. Nếu bị `reject`, leader chỉnh sửa thì hệ thống đưa lại `pending`.
4. Khi `approved`, leader gửi yêu cầu nghiệm thu.
5. Admin nghiệm thu -> `completed`.

#### Quy trình bài báo
1. Tạo mới bài báo -> `pending`.
2. Admin review: `approve` hoặc `reject`.
3. Nếu `reject`, tác giả sửa và gửi lại -> `pending`.
4. Có thể bổ sung đồng tác giả theo quyền.

## 5. Cấu trúc dự án

```text
Science-Work-Manager/
	backend/
		app/
			api/        # FastAPI routers
			services/   # business logic
			models/     # SQLAlchemy models
			schemas/    # Pydantic schemas
			core/       # config, security, constants, db
			db/         # init + seed
		alembic/      # migration
	frontend/
		src/
			pages/      # màn hình chính
			services/   # gọi API
			contexts/   # auth state
			components/ # UI components
```

## 6. Công nghệ sử dụng

- Backend: FastAPI, SQLAlchemy, Alembic, Pydantic, JWT.
- Database: SQLite.
- Frontend: React + Vite + React Router + Axios.

## 7. Hướng dẫn chạy local

### 7.1 Chạy backend

```bash
cd backend
py -3.13 -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
python -m app.db.init_db
python -m app.db.seed
uvicorn app.main:app --reload
```

API docs: `http://127.0.0.1:8000/docs`

### 7.2 Chạy frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend mặc định chạy tại: `http://127.0.0.1:5173`

Vite đã cấu hình proxy `/api` và `/uploads` về backend `http://127.0.0.1:8000`.

## 8. Tài khoản mặc định sau khi seed

Được lấy từ `backend/.env` (hoặc giá trị mặc định trong `.env.example`):

- Email: `admin@gmail.com`
- Password: `Admin@123456`
- Role: `admin`

## 9. Ghi chú tiến độ hiện tại

- Backend đã nối đầy đủ các router chính: auth, users, categories, projects, papers, notifications, statistics, uploads.
- Frontend đã có route và page cho: auth, profile, projects, papers, dashboard, admin.
- Hệ thống đã có kiểm soát quyền theo vai trò và trạng thái dữ liệu ở service layer.

## 10. Guide Docs (trước đây Prompt Pack)

- Bộ tài liệu đặc tả hiện dùng tên gọi **Guide Docs**.
- Entry point: `prompts/GUIDE_DOCS.md`
- Bộ spec baseline theo code hiện tại: `prompts/00_specs/`
- Addendum mở rộng planned: `prompts/00_specs/FEATURE_EXPANSION_2026.md`


