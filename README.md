# Science-Work-Manager
BTL Web hệ thống quản lý hoạt động nghiên cứu khoa học của khoa An toàn thông tin PTIT

## Backend (Thành viên 1)
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

## Backend (Thành viên 2)
Phạm vi đã hoàn thành:
- Categories (admin CRUD):
	- `/api/v1/admin/categories/project-types`
	- `/api/v1/admin/categories/paper-types`
- Projects:
	- `POST /api/v1/projects`
	- `GET /api/v1/projects`
	- `GET /api/v1/projects/{project_id}`
	- `PUT /api/v1/projects/{project_id}`
	- `DELETE /api/v1/projects/{project_id}`
	- `PUT /api/v1/admin/projects/{project_id}/review`
	- `PUT /api/v1/admin/projects/{project_id}/complete`

Rule chính đã áp dụng:
- Chỉ admin được quản lý categories.
- `project_type` và `paper_type` tách theo endpoint, không cho trùng `(type, name)`.
- Chỉ lecturer được tạo project.
- Chỉ leader được sửa/xóa project khi status là `pending` hoặc `rejected`.
- Project `rejected` khi cập nhật sẽ về lại `pending`.
- Chỉ admin review/complete project; chỉ project `approved` mới được complete.

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend chạy mặc định ở `http://localhost:5173`.

Nếu cần cấu hình API backend, tạo file `.env` trong thư mục `frontend` với biến:
```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

## Demo Flow

Điều kiện trước khi demo:
- Backend đang chạy tại `http://127.0.0.1:8000`
- Frontend đang chạy tại `http://localhost:5173`
- Đã chạy seed dữ liệu (`python -m app.db.seed`)

Tài khoản admin mặc định:
- Email: `admin@gmail.com`
- Password: `Admin@123456`

### Luồng 1: Đăng ký và duyệt tài khoản lecturer
1. Mở frontend và đăng ký một tài khoản mới với role `lecturer`.
2. Thử đăng nhập ngay bằng tài khoản lecturer vừa tạo, hệ thống sẽ báo đang chờ duyệt.
3. Đăng nhập bằng tài khoản admin mặc định.
4. Vào trang `Quản trị` -> tab `Người dùng` -> bấm `Duyệt giảng viên` cho tài khoản vừa đăng ký.
5. Đăng xuất admin, đăng nhập lại bằng tài khoản lecturer để xác nhận đã vào hệ thống thành công.

### Luồng 2: Lecturer tạo và gửi đề tài
1. Đăng nhập bằng tài khoản lecturer đã được duyệt.
2. Vào `Đề tài` -> `Tạo đề tài mới`.
3. Nhập thông tin bắt buộc và lưu hồ sơ (trạng thái ban đầu là `pending`).
4. Mở chi tiết đề tài để kiểm tra dữ liệu đã lưu.

### Luồng 3: Admin duyệt đề tài
1. Đăng nhập bằng admin.
2. Vào `Quản trị` -> tab `Duyệt đề tài`.
3. Chọn đề tài đang `pending`, nhập ghi chú và bấm `Phê duyệt` hoặc `Từ chối`.
4. Nếu đã phê duyệt, có thể theo dõi tiếp yêu cầu hoàn thành từ lecturer và dùng nút `Xác nhận hoàn thành` khi đủ điều kiện.

### Luồng 4: Student khai báo paper và lecturer/top statistics
1. Đăng ký tài khoản role `student`, sau đó đăng nhập.
2. Vào `Bài báo` -> `Khai báo bài báo mới`.
3. Chọn giảng viên hướng dẫn (bắt buộc với student), nhập thông tin paper và lưu.
4. Dùng admin để duyệt paper ở tab `Duyệt bài báo`.
5. Mở `Bảng điều khiển` để xem số liệu tổng hợp và `Top lecturers`.

### Luồng 5: Thông báo hệ thống
1. Đăng nhập admin, vào tab `Thông báo` trong trang `Quản trị`.
2. Tạo thông báo mới với `target_role` là `all`, `lecturer` hoặc `student`.
3. Đăng nhập bằng tài khoản phù hợp để kiểm tra thông báo hiển thị ở trang chủ, dashboard và badge trên navbar.

Lưu ý nghiệp vụ khi demo:
- Chỉ `lecturer` được tạo đề tài.
- `student` và `lecturer` được khai báo paper.
- Chỉ `admin` được duyệt/từ chối đề tài, paper, và phát hành thông báo.

