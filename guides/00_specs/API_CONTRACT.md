# API_CONTRACT.md

## Base URL
`/api/v1`

Tài liệu này mô tả **Implemented Baseline** (đúng với code hiện tại).

---

## 1. Auth

### POST /auth/register
Request:
```json
{
  "email": "student@example.com",
  "password": "123456",
  "full_name": "Nguyen Van A",
  "role": "student",
  "student_id": "AT220001",
  "staff_id": null,
  "department": "ATTT K16"
}
```
Luật:
- `role` chỉ nhận `student` hoặc `lecturer`.
- `student` bắt buộc `student_id`.
- `lecturer` bắt buộc `staff_id`.

### POST /auth/login
Request:
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```
Response:
```json
{
  "access_token": "jwt-token",
  "token_type": "bearer"
}
```

### GET /users/me
Response:
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "Nguyen Van A",
  "role": "student",
  "is_active": true,
  "is_approved": true
}
```

---

## 2. Users

### GET /users/lecturers
Mô tả:
- Trả về danh sách giảng viên đang `is_active=true` và `is_approved=true`.

### GET /admin/users
Query params:
- role
- is_active
- is_approved

### PUT /admin/users/{user_id}/approve
Request:
```json
{
  "is_approved": true,
  "role": "lecturer"
}
```
Luật:
- `role` chỉ cho `student` hoặc `lecturer`.

### PUT /admin/users/{user_id}/toggle-block
Response:
```json
{
  "message": "User status updated"
}
```

---

## 3. Categories

### Public (đã đăng nhập)
- GET /categories/project-types
- GET /categories/paper-types

### Admin CRUD
Project types:
- GET /admin/categories/project-types
- POST /admin/categories/project-types
- PUT /admin/categories/project-types/{category_id}
- DELETE /admin/categories/project-types/{category_id}

Paper types:
- GET /admin/categories/paper-types
- POST /admin/categories/paper-types
- PUT /admin/categories/paper-types/{category_id}
- DELETE /admin/categories/paper-types/{category_id}

---

## 4. Projects

### POST /projects
Request:
```json
{
  "name": "Nghiên cứu ứng dụng AI trong ATTT",
  "category_id": 1,
  "budget": 20,
  "start_date": "2026-03-01",
  "end_date": "2026-12-30",
  "description": "Mô tả đề tài",
  "proposal_file": "/uploads/projects/proposals/p1.pdf",
  "final_report_file": null
}
```
Luật:
- Chỉ `lecturer` được tạo project.

### GET /projects
Query params:
- status
- year
- keyword
- mine=true/false
- completion_requested=true/false

### GET /projects/{project_id}
### PUT /projects/{project_id}
### DELETE /projects/{project_id}

### PUT /projects/{project_id}/request-completion
Mô tả:
- Leader gửi yêu cầu nghiệm thu khi project đang `approved`.

### PUT /admin/projects/{project_id}/review
Request:
```json
{
  "action": "approve",
  "note": "Đề tài hợp lệ"
}
```

### PUT /admin/projects/{project_id}/complete
Response:
```json
{
  "message": "Project completed successfully"
}
```
Luật:
- Chỉ complete khi project `approved` và đã `completion_requested=true`.

---

## 5. Papers

### POST /papers
Request:
```json
{
  "title": "A Study on Network Security",
  "category_id": 2,
  "journal_name": "Journal of Cyber Security",
  "publication_year": 2026,
  "volume": "12",
  "issue": "3",
  "pages": "100-110",
  "doi": "10.xxxx/abcd",
  "file_url": "/uploads/papers/paper_1.pdf",
  "supervisor_lecturer_id": 7
}
```
Luật:
- `admin` không được tạo paper.
- `student` bắt buộc có `supervisor_lecturer_id` hợp lệ.

### GET /papers
Query params:
- year
- category_id
- status
- mine=true/false

### GET /papers/{paper_id}
### PUT /papers/{paper_id}
### DELETE /papers/{paper_id}

### PUT /admin/papers/{paper_id}/approve
Request:
```json
{
  "action": "reject",
  "note": "Thiếu minh chứng bài báo"
}
```

### POST /papers/{paper_id}/authors
Request:
```json
{
  "user_id": 5,
  "author_order": 2,
  "is_corresponding": false
}
```
Luật:
- Chỉ admin hoặc tác giả đầu tiên (`author_order=1`) được thêm đồng tác giả.

---

## 6. Notifications

### POST /admin/notifications
Request:
```json
{
  "title": "Thông báo mới",
  "content": "Nội dung thông báo",
  "target_role": "lecturer"
}
```

### GET /notifications
Mô tả:
- Trả thông báo `is_active=true` và phù hợp vai trò (`all`, `lecturer`, `student`).

---

## 7. Statistics

### GET /admin/statistics/dashboard
Response gồm:
- tổng users
- tổng projects
- tổng papers
- projects theo status
- papers theo status
- số lượng theo năm

### GET /statistics/top-lecturers
Response:
```json
{
  "lecturer_id": 2,
  "full_name": "Tran Van B",
  "paper_count": 5
}
```

---

## 8. Uploads

### POST /uploads/paper-file
### POST /uploads/project-proposal
### POST /uploads/project-final-report

Response mẫu:
```json
{
  "file_name": "report.pdf",
  "file_url": "/uploads/projects/proposals/uuid_report.pdf",
  "content_type": "application/pdf",
  "size": 123456
}
```

---

## Planned Expansion
Các endpoint mở rộng (academic plan, levels, template engine, task/progress chi tiết)
được quản lý tại:

- `FEATURE_EXPANSION_2026.md`
