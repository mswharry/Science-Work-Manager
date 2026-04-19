# FEATURE_EXPANSION_2026.md

## Trạng thái
Planned (chưa merge vào baseline code hiện tại).

## Mục tiêu
Tài liệu này là addendum chính thức để mở rộng hệ thống theo yêu cầu bổ sung từ giảng viên hướng dẫn.
Khi triển khai phase mở rộng, file này có hiệu lực cùng với:
- USECASE_SPEC.md
- API_CONTRACT.md
- DB_SCHEMA.md
- STATE_RULES.md
- TEAM_WORKFLOW.md

---

## 1) Phạm vi bổ sung

### 1.1 Phân loại theo cấp độ
- Bổ sung phân cấp đề tài theo cấp quản lý:
  - cap_khoa
  - cap_truong
  - cap_bo
  - cap_nha_nuoc
- Bổ sung phân cấp bài báo theo cấp độ công bố:
  - hoi_nghi_trong_nuoc
  - hoi_nghi_quoc_te
  - tap_chi_trong_nuoc
  - tap_chi_quoc_te

### 1.2 Mẫu biểu cho từng đề tài/bài báo
- Mỗi hồ sơ đề tài hoặc bài báo gắn với một mẫu biểu (template) cụ thể.
- Cho phép versioning mẫu biểu (v1, v2, ...).
- Dữ liệu hồ sơ gồm:
  - trường lõi (core fields) để query nhanh,
  - trường mở rộng (extra payload) theo JSON để dễ thêm field trong tương lai.

### 1.3 Kế hoạch hoạt động khoa học theo năm học
- Quản lý kế hoạch theo năm học kiểu 20xx-20xx+1.
- Mỗi kế hoạch gồm nhiều chỉ tiêu/hạng mục (plan items):
  - chỉ tiêu đề tài theo cấp,
  - chỉ tiêu bài báo theo cấp,
  - thời hạn các đợt,
  - mô tả ưu tiên của khoa.
- Khi tạo đề tài/bài báo, có thể liên kết với 1 hạng mục kế hoạch để theo dõi mức độ hoàn thành kế hoạch.

### 1.4 Quy trình sau khi đề tài được duyệt
Sau trạng thái approved:
- Leader và thành viên có thể tiếp tục thao tác trên đề tài.
- Hệ thống hỗ trợ:
  - phân chia công việc (tasks),
  - giao người phụ trách,
  - nộp báo cáo định kỳ theo mốc do leader đặt,
  - duyệt hoàn thành task bởi leader.
- Phần trăm tiến độ chỉ tăng khi task được leader duyệt hoàn thành.
- Đề tài quá hạn hiển thị cảnh báo.

---

## 2) Thiết kế nghiệp vụ khuyến nghị

### 2.1 Áp dụng kế hoạch năm học vào quản lý đề tài/bài báo
Mô hình áp dụng thực tế:
1. Đầu năm học, admin tạo Academic Plan (ví dụ 2026-2027).
2. Admin khai báo các Plan Item theo mục tiêu khoa.
3. Khi user tạo đề tài/bài báo, chọn plan_item phù hợp (không bắt buộc ở phase đầu, nhưng khuyến nghị bắt buộc ở phase sau).
4. Dashboard admin theo dõi:
   - mục tiêu kế hoạch,
   - số lượng đã đăng ký,
   - số lượng đã duyệt,
   - tỷ lệ hoàn thành kế hoạch theo từng hạng mục.

Lợi ích:
- Kế hoạch không nằm tách rời mà gắn trực tiếp vòng đời đề tài/bài báo.
- Có số liệu phục vụ báo cáo quản lý khoa theo năm học.

### 2.2 Cách làm phân cấp đề tài/bài báo
Khuyến nghị thiết kế:
- Không hard-code cấp độ trong code.
- Tạo danh mục cấp độ có thể cấu hình bởi admin.
- Mỗi cấp độ có các thuộc tính:
  - code,
  - name,
  - entity_type (project/paper),
  - weight/points mặc định,
  - is_active.

Lợi ích:
- Dễ thay đổi theo yêu cầu từng năm.
- Dùng lại cho thống kê và tính điểm thi đua.

### 2.3 Cách làm form mẫu dễ mở rộng
Mục tiêu: thêm field theo mẫu giấy thực tế mà không phải đổi schema lõi liên tục.

Khuyến nghị hybrid model:
- Core columns (typed) cho field quan trọng cần filter/sort/index.
- Extra payload JSON cho field mở rộng theo template.
- Template versioning + field definitions.

Cách triển khai:
1. Admin tạo template theo entity_type (project/paper).
2. Template có version, trạng thái active.
3. Field definition mô tả:
   - field_key,
   - label,
   - type,
   - required,
   - options,
   - validation_rule.
4. Khi submit hồ sơ, backend validate payload theo template version.
5. Lưu payload vào JSON column, đồng thời map một số field quan trọng sang core columns.

Lợi ích:
- Mở rộng nhanh theo form thực tế.
- Giữ hiệu năng query nhờ tách field lõi.

---

## 3) Kế hoạch triển khai kỹ thuật (đề xuất 4 sprint)

## Sprint 1: Nền tảng dữ liệu và đặc tả
- Chốt use case mở rộng, API contract, DB schema, state rules.
- Tạo migration cho:
  - academic plans,
  - levels,
  - templates,
  - project tasks,
  - periodic reports.
- Seed dữ liệu danh mục cấp độ mặc định.

## Sprint 2: Backend nghiệp vụ chính
- CRUD Academic Plan + Plan Item.
- CRUD Level cho project/paper.
- CRUD Template + Field definitions + active version.
- Gắn level/template/plan_item vào create/update project và paper.

## Sprint 3: Hậu duyệt đề tài và tiến độ
- Task board cho project approved.
- Submit task completion + leader approval.
- Tính progress_percent theo task approved.
- Periodic report theo deadline.
- Overdue warning rules.

## Sprint 4: Frontend + tích hợp + demo
- UI quản lý kế hoạch năm học.
- UI phân cấp và mẫu biểu.
- UI task/progress/report cho đề tài đã approved.
- UI cảnh báo quá hạn và dashboard kế hoạch.
- Integration test + demo flow.

---

## 4) Chia việc đều cho 4 thành viên (mỗi người 1 feature Backend + Frontend)

Nguyên tắc chia việc:
- Mỗi người sở hữu trọn vẹn 1 feature theo chiều dọc.
- Mỗi feature có API, DB migration, UI, test notes riêng.
- Team chỉ hỗ trợ review chéo, không giành ownership.

### Thành viên 1: Feature Kế hoạch năm học
Backend:
- CRUD academic plans và academic plan items.
- Luồng activate/close plan và rule active theo năm học.
- API target vs actual theo từng plan item.

Frontend:
- trang admin quản lý kế hoạch năm học.
- form tạo/sửa kế hoạch và hạng mục.
- bảng theo dõi hoàn thành kế hoạch.

Deliverables:
- endpoint + migration + UI quản lý kế hoạch hoàn chỉnh.

### Thành viên 2: Feature Đề tài sau duyệt
Backend:
- project tasks: create/assign/submit/review.
- periodic reports theo deadline.
- progress calculation và overdue alerts.

Frontend:
- task board trong project detail.
- UI nộp báo cáo định kỳ.
- progress bar và cảnh báo quá hạn.

Deliverables:
- luồng vận hành đề tài approved end-to-end.

### Thành viên 3: Feature Phân cấp + Bài báo
Backend:
- CRUD levels cho project/paper.
- mở rộng paper với level + plan item.
- thống kê paper theo cấp độ và năm học.

Frontend:
- UI admin quản lý phân cấp.
- UI paper form/list/filter theo cấp độ.
- widget thống kê theo cấp độ trên dashboard.

Deliverables:
- luồng bài báo theo cấp độ và thống kê liên quan.

### Thành viên 4: Feature Mẫu biểu động
Backend:
- CRUD form templates + fields + version.
- validate payload theo template version.
- lưu extra form data và mapping field lõi.

Frontend:
- form builder cho admin.
- form renderer động cho project/paper.
- hiển thị lỗi validate theo field definition.

Deliverables:
- dynamic form end-to-end cho project và paper.

---

## 5) Milestone và tiêu chí nghiệm thu

## M1 - Spec freeze
- Tài liệu spec cập nhật đầy đủ.
- Team thống nhất model và API mới.

## M2 - Backend freeze
- API kế hoạch, phân cấp, template, task/report chạy qua Postman.
- Không phá API cũ.

## M3 - Frontend freeze
- UI chạy được toàn bộ flow chính.
- Cảnh báo lỗi rõ ràng.

## M4 - Demo ready
- Có dữ liệu seed minh họa.
- Có script demo theo vai trò admin/lecturer/student.
- Có checklist regression cho tính năng cũ.

---

## 6) Rủi ro và cách giảm thiểu

1. Dynamic form quá phức tạp: áp dụng hybrid model (core + JSON), không full no-code engine.
2. Progress sai do logic task: khóa công thức progress chỉ dựa trên task approved.
3. Quá tải scope: chia phase, ưu tiên luồng project trước, paper theo sau.
4. Mâu thuẫn spec: mọi thay đổi phải cập nhật đồng thời USECASE/API/DB/STATE.

---

## 7) Quy tắc triển khai bắt buộc cho phase mở rộng

1. Không đổi endpoint cũ trừ khi có migration plan rõ ràng.
2. Tính năng mới phải qua service layer, không nhét logic vào router.
3. Field mở rộng của form phải có validation theo template version.
4. Progress không được cập nhật thủ công.
5. Overdue warning phải xác định được nguồn deadline (project end_date hoặc report due_date).
