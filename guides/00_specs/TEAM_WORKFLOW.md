# TEAM_WORKFLOW.md

## Mục tiêu
Giúp nhóm 4 người làm việc không lệch nhau khi code.

Tài liệu này thuộc bộ Guide Docs (trước đây gọi là prompt pack).

---

## Phân chia chính thức theo feature (Backend + Frontend)

Mục tiêu chia việc mới:
- Mỗi thành viên sở hữu trọn 1 feature dọc.
- Mỗi feature đều có phần backend và frontend tương ứng.
- Hạn chế phụ thuộc chéo để tăng tốc độ song song.

### Thành viên 1: Feature Kế hoạch năm học
Backend:
- CRUD academic plans và plan items
- activate/close plan, rule năm học active
- API theo dõi target vs actual theo plan item

Frontend:
- trang admin quản lý kế hoạch năm học
- form tạo/sửa kế hoạch và hạng mục chỉ tiêu
- UI bảng tiến độ hoàn thành kế hoạch

### Thành viên 2: Feature Triển khai đề tài sau duyệt
Backend:
- project tasks (create/assign/submit/review)
- periodic reports theo mốc deadline
- progress percent, overdue rules và alerts

Frontend:
- task board trong trang chi tiết đề tài approved
- UI nộp báo cáo định kỳ + duyệt task
- progress bar + cảnh báo quá hạn

### Thành viên 3: Feature Phân cấp + Bài báo theo cấp độ
Backend:
- CRUD levels cho project/paper
- mở rộng paper với level + plan linkage
- thống kê theo cấp độ công bố và theo năm học

Frontend:
- UI admin quản lý phân cấp đề tài/bài báo
- UI paper form/list/filter theo cấp độ
- widget thống kê cấp độ trên dashboard

### Thành viên 4: Feature Mẫu biểu động (Template)
Backend:
- CRUD form templates + template fields + versioning
- validate payload theo template khi submit project/paper
- lưu dữ liệu mở rộng (extra JSON) + mapping field lõi

Frontend:
- form builder cho admin (template + fields)
- form renderer động cho đăng ký đề tài/khai báo bài báo
- hiển thị lỗi validate theo field definition

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
2. Chốt phạm vi baseline vs planned
3. Tạo migration + API skeleton theo feature ownership
4. Mỗi thành viên triển khai backend và frontend cho feature của mình
5. Tích hợp chéo trên nhánh dev
6. Review
7. Demo

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
  - `feature/academic-plan`
  - `feature/project-execution`
  - `feature/paper-levels`
  - `feature/dynamic-template`

---

## Checklist trước khi merge
- code chạy
- import đủ
- endpoint đúng spec
- schema đúng contract
- không lộ dữ liệu nhạy cảm
- không làm vỡ API cũ

---

## Kế hoạch triển khai bổ sung (đợt 2026)

Mục tiêu bổ sung:
- kế hoạch năm học,
- phân cấp đề tài/bài báo,
- form mẫu mở rộng,
- tiến độ đề tài theo task,
- cảnh báo quá hạn.

### Mapping feature ownership (giữ cố định toàn sprint)

### Thành viên 1: Kế hoạch năm học
Phụ trách:
- backend + frontend cho academic plans và plan items
- KPI theo hạng mục kế hoạch

### Thành viên 2: Triển khai đề tài sau duyệt
Phụ trách:
- backend + frontend cho task/report/progress/overdue

### Thành viên 3: Phân cấp + Bài báo
Phụ trách:
- backend + frontend cho levels và paper theo cấp độ
- thống kê theo cấp độ và năm học

### Thành viên 4: Mẫu biểu động
Phụ trách:
- backend + frontend cho template engine và dynamic form

### Chia sprint
1. Sprint 1: chốt spec + migration + API khung
2. Sprint 2: backend nghiệp vụ chính
3. Sprint 3: frontend tích hợp
4. Sprint 4: test chéo, fix bug, demo

### Rule phối hợp
- Mỗi PR phải ghi rõ use case liên quan (UC-26+ nếu là tính năng mở rộng).
- Mỗi thành viên chịu trách nhiệm end-to-end cho feature của mình (API docs + UI docs + test notes).
- Thành viên 1 review migration của thành viên 2, 3, 4 trước khi merge vào dev.