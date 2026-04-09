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
- Chỉ student/lecturer được tạo project.
- Chỉ leader được sửa/xóa project khi status là `pending` hoặc `rejected`.
- Project `rejected` khi cập nhật sẽ về lại `pending`.
- Chỉ admin review/complete project; chỉ project `approved` mới được complete.

