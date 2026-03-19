# STATE_RULES.md

## 1. User

### role
- admin
- lecturer
- student

### is_active
- true: hoạt động
- false: bị khóa

### is_approved
- lecturer mới đăng ký: false
- student có thể true ngay
- admin seed sẵn

---

## 2. Project status
- pending
- approved
- rejected
- completed

### Luật chuyển trạng thái
- create -> pending
- pending -> approved
- pending -> rejected
- rejected -> pending (khi leader sửa)
- approved -> completed

### Không hợp lệ
- completed -> pending
- completed -> rejected
- completed -> delete

---

## 3. Paper status
- pending
- approved
- rejected

### Luật chuyển trạng thái
- create -> pending
- pending -> approved
- pending -> rejected
- rejected -> pending (khi tác giả sửa)

### Không hợp lệ
- approved -> pending
- approved -> delete trực tiếp

---

## 4. Quyền chỉnh sửa

### Project
- leader được sửa/xóa khi:
  - pending
  - rejected

### Paper
- người khai báo hoặc tác giả nội bộ được sửa/xóa khi:
  - pending
  - rejected

---

## 5. Quyền xem danh sách

### Admin
- xem tất cả

### User thường
- xem dữ liệu approved/completed
- xem thêm dữ liệu của chính mình

---

## 6. Quyền admin
Chỉ admin mới được:
- duyệt user
- khóa/mở user
- duyệt/từ chối project
- complete project
- duyệt/từ chối paper
- quản lý category
- tạo notification
- xem dashboard admin