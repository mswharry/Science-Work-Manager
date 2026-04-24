# GUIDE DOCS (Former Prompt Pack)

## Mục đích
Đây là bộ Guide Docs cho dự án:
**Scientific Activity Management System for Faculty of Information Security**

Bộ Guide Docs này được dùng để:
1. Thống nhất đặc tả giữa các thành viên trong nhóm.
2. Làm nguồn sự thật khi generate code bằng LLM.
3. Giảm lệch giữa backend, frontend, database và nghiệp vụ.
4. Theo dõi rõ phần đã triển khai và phần mở rộng planned.

> Lưu ý: thư mục vẫn giữ tên `prompts/` để tương thích cấu trúc repo hiện tại.

---

## Trạng thái tài liệu

### Implemented Baseline (khớp code hiện tại)
- `00_specs/PROJECT_BRIEF.md`
- `00_specs/USECASE_SPEC.md` (UC-01 -> UC-25)
- `00_specs/API_CONTRACT.md` (mục Implemented)
- `00_specs/DB_SCHEMA.md`
- `00_specs/STATE_RULES.md` (mục Implemented)
- `00_specs/TEAM_WORKFLOW.md`

### Planned Expansion (chưa merge vào code baseline)
- `00_specs/FEATURE_EXPANSION_2026.md`
- `00_specs/USECASE_SPEC.md` (UC-26 -> UC-36)

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
- quy trình làm việc nhóm,
- addendum mở rộng: `FEATURE_EXPANSION_2026.md`.

### Bước 2: Dùng `01_context/00_LOAD_CONTEXT.md`
Tệp này dùng để nạp bối cảnh trước khi sinh code.

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

## Invariants bắt buộc (Baseline)
Mọi code baseline được sinh ra phải tuân thủ các điều sau:

1. Không được tự ý thêm hoặc bớt use case ngoài đặc tả đã chốt.
2. Không được tự ý đổi tên endpoint.
3. Không được thay đổi logic trạng thái nếu không có chỉ định mới.
4. Public register không cho role = admin.
5. Lecturer mới đăng ký phải được admin duyệt.
6. Chỉ lecturer được tạo project.
7. Project status gồm: pending, approved, rejected, completed.
8. Project chỉ được complete khi đã approved và có completion request từ leader.
9. Paper status gồm: pending, approved, rejected.
10. Admin không được tạo paper; student tạo paper phải có supervising lecturer hợp lệ.
11. Khi project hoặc paper bị rejected và được sửa, phải chuyển lại pending.
12. Categories phải unique theo (type, name).
13. Project_members và paper_authors phải unique theo cặp khóa ngoại.
14. Business logic đặt trong service, không đặt nặng ở router.

---

## Invariants cho phase mở rộng
Khi triển khai phase mở rộng, UC-26+ chỉ hợp lệ nếu bám theo:
- `00_specs/FEATURE_EXPANSION_2026.md`

---

## Công nghệ chính thức
- Backend: FastAPI
- ORM: SQLAlchemy
- Database: SQLite
- Authentication: JWT Bearer Token
- Migration: Alembic
- Frontend: React + Vite
- HTTP client frontend: Axios