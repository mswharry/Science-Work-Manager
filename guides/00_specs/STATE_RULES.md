# STATE_RULES.md

Ghi chú:
- Mục 1-6: Implemented Baseline
- Mục 7 trở đi: Planned Expansion

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
- approved -> approved (completion_requested=true, do leader request)
- approved + completion_requested -> completed (do admin complete)

### Không hợp lệ
- completed -> pending
- completed -> rejected
- completed -> delete

### Quy tắc completion request
- Chỉ leader của đề tài được request completion.
- Chỉ project ở trạng thái approved mới được request completion.
- Một project chỉ có thể request completion một lần cho đến khi trạng thái đổi.

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
- chỉ leader (lecturer tạo đề tài) được sửa/xóa khi:
  - pending
  - rejected

### Paper
- chỉ user là tác giả của paper được sửa/xóa khi:
  - pending
  - rejected

---

## 5. Quyền xem danh sách

### Admin
- xem tất cả

### User thường
- Project: xem dữ liệu approved/completed hoặc project mình sở hữu/tham gia.
- Paper: xem paper approved hoặc paper mình là tác giả.

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

## 6.1 Ràng buộc tạo dữ liệu

### Project create
- Chỉ lecturer được tạo project.

### Paper create
- Admin không được tạo paper.
- Student tạo paper bắt buộc chỉ định supervisor_lecturer_id hợp lệ (lecturer active + approved).

---

## 7. Kế hoạch năm học (Academic Plan)

### plan status
- draft
- active
- closed

### Luật chuyển trạng thái
- create -> draft
- draft -> active
- active -> closed

### Không hợp lệ
- closed -> active
- active -> draft

### Rule
- Tại mỗi thời điểm chỉ nên có 1 kế hoạch active cho 1 năm học.

---

## 8. Trạng thái công việc đề tài (Project Task)

### task status
- todo
- in_review
- done
- rejected

### Luật chuyển trạng thái
- create -> todo
- todo -> in_review (khi thành viên submit)
- in_review -> done (khi leader duyệt)
- in_review -> rejected (khi leader yêu cầu làm lại)
- rejected -> in_review (khi nộp lại)

### Rule tiến độ
- Chỉ task ở trạng thái done mới được tính vào tiến độ đề tài.

---

## 9. Trạng thái báo cáo định kỳ

### report status
- pending
- submitted
- approved
- rejected
- overdue

### Luật chuyển trạng thái
- create milestone -> pending
- pending -> submitted
- submitted -> approved hoặc rejected
- pending/submitted -> overdue (nếu quá deadline)
- rejected -> submitted (khi nộp lại)

---

## 10. Quyền thao tác đề tài sau khi approved

Sau khi đề tài được approved:
- Không cho sửa nội dung đăng ký lõi như giai đoạn pending/rejected (trừ luồng cập nhật được admin cho phép).
- Cho phép thao tác vận hành:
  - tạo task,
  - gán thành viên,
  - submit task,
  - duyệt task,
  - tạo và nộp báo cáo định kỳ.

Quyền:
- Leader: tạo/sửa task, duyệt task, tạo mốc báo cáo.
- Thành viên đề tài: cập nhật và submit task của mình, nộp báo cáo định kỳ theo phân quyền.
- Admin: theo dõi tổng thể và can thiệp khi cần.

---

## 11. Công thức tiến độ đề tài

`progress_percent = floor(done_tasks / total_tasks * 100)`

Trong đó:
- `done_tasks`: số task đã được leader duyệt `done`.
- `total_tasks`: tổng task thuộc đề tài (không tính task đã xóa mềm nếu có).

Nếu `total_tasks = 0` thì `progress_percent = 0`.

---

## 12. Cảnh báo quá hạn

Đề tài được đánh dấu quá hạn khi rơi vào một trong các điều kiện:
1. `current_date > project.end_date` và project chưa completed.
2. Có periodic report ở trạng thái overdue.
3. Có task quá hạn chưa được duyệt done.

Cảnh báo quá hạn phải hiển thị cho:
- leader của đề tài,
- admin,
- các thành viên liên quan (mức cảnh báo nhẹ hơn).