# CODE_CONVENTIONS.md

## Mục tiêu
Đây là các quy ước code chung để 4 thành viên trong nhóm và các LLM sinh code theo cùng một chuẩn.

---

## 1. Quy ước đặt tên

### Python files
- snake_case
- Ví dụ:
  - user_service.py
  - project_service.py
  - notifications.py

### Class names
- PascalCase
- Ví dụ:
  - User
  - Project
  - PaperCreate
  - ProjectReviewRequest

### Function names
- snake_case
- Ví dụ:
  - create_user
  - review_project
  - toggle_user_block

### Constants
- UPPER_SNAKE_CASE

---

## 2. Cấu trúc backend bắt buộc
Mọi module backend phải bám theo cấu trúc:

- model
- schema
- service
- endpoint/router

Không viết business logic phức tạp trong router.

---

## 3. Router rules
Router chỉ nên làm:
- nhận request
- inject dependencies
- gọi service
- trả response

Router không nên:
- chứa query xử lý DB dài
- chứa logic quyền phức tạp
- chứa logic state transition nặng

---

## 4. Service rules
Service chịu trách nhiệm:
- validate nghiệp vụ
- xử lý state transition
- kiểm tra quyền ở mức nghiệp vụ
- thao tác DB qua ORM
- trả object cho router

---

## 5. Schema rules
Mỗi entity nên có các schema sau nếu phù hợp:
- Create
- Update
- Out
- ReviewRequest
- ListResponse nếu cần

Không expose:
- hashed_password
- internal-only fields nếu không cần

---

## 6. Database rules
- Dùng SQLAlchemy ORM
- Có relationship rõ ràng
- Có unique constraint đúng spec
- created_at và updated_at phải ổn định
- SQLite phải cấu hình `check_same_thread=False`

---

## 7. Auth rules
- JWT Bearer Token
- sub trong token là user.id dạng string
- password hash bằng bcrypt
- không trả password trong response

---

## 8. Error handling
- Dùng HTTPException
- Message rõ ràng, dễ hiểu
- Các lỗi phổ biến:
  - 400: dữ liệu không hợp lệ
  - 401: chưa xác thực / token sai
  - 403: không có quyền
  - 404: không tìm thấy
  - 409: trùng dữ liệu nếu cần

---

## 9. Frontend rules
- Tách:
  - pages
  - components
  - services
  - contexts
- Gọi API qua service layer
- Không hard-code token trong component
- Dùng AuthContext quản lý user và token

---

## 10. Output rules khi dùng LLM generate code
LLM phải:
- output theo từng file
- ghi rõ đường dẫn file
- import đầy đủ
- không để TODO
- không để pseudo-code
- code phải chạy được hoặc gần chạy được nhất