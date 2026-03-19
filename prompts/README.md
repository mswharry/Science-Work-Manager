# README.md

## Mục đích
Đây là bộ prompt hoàn chỉnh cho dự án:
**Scientific Activity Management System for Faculty of Information Security**

Bộ prompt này được dùng để:
1. Thống nhất đặc tả giữa các thành viên trong nhóm.
2. Làm nguồn sự thật khi generate code bằng LLM.
3. Giảm lệch giữa backend, frontend, database và nghiệp vụ.
4. Giữ nguyên phạm vi của bài tập lớn môn Ngôn ngữ lập trình Python.

---

## Nguyên tắc sử dụng
LLM hoặc thành viên trong nhóm phải đọc theo đúng thứ tự:

### Bước 1: Đọc toàn bộ thư mục `00_specs/`
Đây là phần đặc tả gốc của dự án, gồm:
- mô tả dự án,
- use case,
- API contract,
- database schema,
- state rules,
- coding conventions,
- quy trình làm việc nhóm.

### Bước 2: Dùng `01_context/00_LOAD_CONTEXT.md`
Prompt này dùng để “nạp bối cảnh” cho LLM trước khi sinh code.

### Bước 3: Generate backend theo thứ tự
- 01_BACKEND_SKELETON.md
- 02_MODELS.md
- 03_SCHEMAS_SECURITY.md
- 04_AUTH_USERS.md
- 05_CATEGORIES.md
- 06_PROJECTS.md
- 07_PAPERS.md
- 08_NOTIFICATIONS_STATISTICS.md
- 09_INIT_DB_SEED.md

### Bước 4: Generate frontend theo thứ tự
- 10_FRONTEND_SCAFFOLD.md
- 11_PROJECTS_UI.md
- 12_PAPERS_UI.md
- 13_ADMIN_UI.md
- 14_DASHBOARD_UI.md

### Bước 5: Review và sửa lỗi
- 15_REVIEW_CHECKLIST.md
- 16_BUGFIX_REFACTOR.md

---

## Invariants bắt buộc
Mọi code được sinh ra phải tuân thủ các điều sau:

1. Không được tự ý thêm hoặc bớt use case.
2. Không được tự ý đổi tên endpoint.
3. Không được thay đổi logic trạng thái nếu không có chỉ định mới.
4. Public register không cho role = admin.
5. Lecturer mới đăng ký phải được admin duyệt.
6. Project status gồm:
   - pending
   - approved
   - rejected
   - completed
7. Paper status gồm:
   - pending
   - approved
   - rejected
8. Khi project hoặc paper bị rejected và được sửa, phải chuyển lại về pending.
9. Categories phải unique theo (type, name).
10. project_members và paper_authors phải unique theo cặp khóa ngoại.
11. Business logic đặt trong service, không đặt nặng ở router.
12. Ưu tiên code đơn giản, rõ ràng, phù hợp BTL Python.

---

## Công nghệ chính thức
- Backend: FastAPI
- ORM: SQLAlchemy
- Database: SQLite
- Authentication: JWT Bearer Token
- Migration: Alembic
- Frontend: React + Vite
- HTTP client frontend: Axios

---

## Cấu trúc backend chuẩn
- Router/API
- Service
- Model
- Schema
- Core
- Utils

---

## Cấu trúc frontend chuẩn
- pages
- components
- services
- contexts
- utils

---

## Mục tiêu ưu tiên
1. Backend chắc và đúng nghiệp vụ
2. API khớp DB và khớp frontend
3. Frontend đủ dùng, không cần quá đẹp
4. Demo ổn định
5. Dễ chia việc cho 4 thành viên