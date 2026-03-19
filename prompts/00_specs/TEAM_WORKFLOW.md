# TEAM_WORKFLOW.md

## Mục tiêu
Giúp nhóm 4 người làm việc không lệch nhau khi code.

---

## Phân chia đề xuất

### Thành viên 1: Core/Auth/Users/DB
Phụ trách:
- cấu hình project
- database
- models nền
- auth JWT
- users
- seed admin
- alembic

### Thành viên 2: Categories + Projects
Phụ trách:
- categories CRUD
- projects CRUD
- review project
- complete project

### Thành viên 3: Papers + Statistics
Phụ trách:
- papers CRUD
- add authors
- approve/reject paper
- statistics dashboard
- top lecturers

### Thành viên 4: Frontend + Notifications + Integration
Phụ trách:
- React scaffold
- auth context
- notifications
- pages chính
- integration frontend-backend
- README và demo flow

---

## Tài liệu phải khóa ngay từ đầu
Trước khi chia code, cả nhóm phải thống nhất:
1. USECASE_SPEC.md
2. API_CONTRACT.md
3. DB_SCHEMA.md
4. STATE_RULES.md
5. CODE_CONVENTIONS.md

---

## Quy trình làm việc
1. Chốt spec
2. Dựng backend skeleton
3. Hoàn thành auth và users
4. Hoàn thành categories, projects, papers
5. Hoàn thành notifications và statistics
6. Dựng frontend
7. Tích hợp
8. Review
9. Demo

---

## Quy tắc merge code
- Không merge code nếu trái spec
- Không tự ý đổi endpoint
- Không tự ý đổi tên field DB
- Không tự ý thêm state mới
- Mọi thay đổi phải cập nhật lại spec trước

---

## Git workflow đơn giản
- `main`: nhánh ổn định
- `dev`: nhánh tích hợp
- mỗi thành viên làm trên nhánh riêng:
  - `feature/auth-users`
  - `feature/projects`
  - `feature/papers-statistics`
  - `feature/frontend-notifications`

---

## Checklist trước khi merge
- code chạy
- import đủ
- endpoint đúng spec
- schema đúng contract
- không lộ dữ liệu nhạy cảm
- không làm vỡ API cũ