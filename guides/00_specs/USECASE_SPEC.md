# USECASE_SPEC.md

## Danh sách use case chính thức
Tổng số use case: 36
Không được tự ý thêm hoặc bớt use case khi generate code.

Ghi chú:
- Implemented Baseline: UC-01 -> UC-25
- Planned Expansion: UC-26 -> UC-36

---

## NHÓM 1: AUTHENTICATION

### UC-01: Đăng ký tài khoản
- Tác nhân: Student, Lecturer
- Mô tả: Người dùng đăng ký tài khoản mới
- Input:
  - email
  - password
  - full_name
  - role
  - student_id hoặc staff_id
  - department
- Luật:
  - Public register chỉ cho role = student hoặc lecturer
  - Không cho self-register admin
  - Lecturer cần admin duyệt
- Kết quả:
  - Tạo user mới trong hệ thống

### UC-02: Đăng nhập
- Tác nhân: Tất cả
- Mô tả: Người dùng đăng nhập để nhận JWT token
- Input:
  - email
  - password
- Luật:
  - Tài khoản phải active
  - Lecturer chưa được duyệt thì không cho login đầy đủ
- Kết quả:
  - Trả về access token

### UC-03: Xem thông tin user hiện tại
- Tác nhân: Tất cả
- Mô tả: Lấy hồ sơ của chính mình
- Input:
  - Bearer token
- Kết quả:
  - Trả về thông tin user hiện tại

---

## NHÓM 2: QUẢN LÝ NGƯỜI DÙNG

### UC-04: Xem danh sách user
- Tác nhân: Admin
- Mô tả: Xem danh sách giảng viên và sinh viên
- Filter:
  - role
  - is_active
  - is_approved

### UC-05: Duyệt / phân quyền user
- Tác nhân: Admin
- Mô tả: Duyệt tài khoản lecturer hoặc chỉnh role student/lecturer
- Luật:
  - Không dùng use case này để tạo admin
  - Chỉ cho role student hoặc lecturer

### UC-06: Khóa / mở user
- Tác nhân: Admin
- Mô tả: Khóa hoặc mở tài khoản người dùng
- Kết quả:
  - đổi trạng thái is_active

---

## NHÓM 3: QUẢN LÝ ĐỀ TÀI

### UC-07: Đăng ký đề tài mới
- Tác nhân: Lecturer
- Mô tả: Tạo đề tài mới
- Luật:
  - Người tạo là leader
  - status ban đầu = pending

### UC-08: Xem danh sách đề tài
- Tác nhân: Tất cả
- Mô tả: Xem danh sách đề tài
- Luật:
  - Admin xem tất cả
  - User thường xem các đề tài approved/completed và đề tài của chính mình

### UC-09: Xem chi tiết đề tài
- Tác nhân: Tất cả
- Mô tả: Xem thông tin chi tiết một đề tài
- Luật:
  - theo quyền nhìn thấy dữ liệu

### UC-10: Cập nhật đề tài
- Tác nhân: Lecturer
- Mô tả: Sửa đề tài
- Luật:
  - chỉ leader được sửa
  - chỉ sửa khi status là pending hoặc rejected
  - nếu sửa từ rejected thì chuyển lại thành pending

### UC-11: Xóa đề tài
- Tác nhân: Lecturer
- Mô tả: Xóa đề tài
- Luật:
  - chỉ leader được xóa
  - chỉ xóa khi status là pending hoặc rejected

### UC-12: Duyệt / từ chối đề tài
- Tác nhân: Admin
- Mô tả: Duyệt hoặc từ chối đề tài
- Luật:
  - action = approve hoặc reject
  - có thể có review note

### UC-13: Nghiệm thu đề tài
- Tác nhân: Admin
- Mô tả: Đánh dấu đề tài đã hoàn thành sau khi leader gửi yêu cầu nghiệm thu
- Luật:
  - leader dùng endpoint request-completion khi project đang approved
  - admin chỉ complete khi đề tài approved và đã completion_requested=true

---

## NHÓM 4: QUẢN LÝ BÀI BÁO

### UC-14: Thêm bài báo mới
- Tác nhân: Lecturer, Student
- Mô tả: Khai báo bài báo mới
- Luật:
  - admin không được tạo bài báo
  - student bắt buộc có supervisor_lecturer_id hợp lệ
  - status ban đầu = pending
  - người tạo là tác giả đầu tiên

### UC-15: Xem danh sách bài báo
- Tác nhân: Tất cả
- Mô tả: Xem danh sách bài báo
- Luật:
  - Admin xem tất cả
  - User thường xem bài báo approved và bài báo của mình

### UC-16: Cập nhật bài báo
- Tác nhân: Lecturer, Student
- Mô tả: Sửa bài báo
- Luật:
  - chỉ tác giả nội bộ hoặc người khai báo được sửa
  - chỉ sửa khi pending hoặc rejected
  - nếu sửa từ rejected thì chuyển lại thành pending

### UC-17: Xóa bài báo
- Tác nhân: Lecturer, Student
- Mô tả: Xóa bài báo
- Luật:
  - chỉ tác giả nội bộ hoặc người khai báo được xóa
  - chỉ xóa khi pending hoặc rejected

### UC-18: Duyệt bài báo
- Tác nhân: Admin
- Mô tả: Duyệt hoặc từ chối bài báo
- Luật:
  - endpoint giữ nguyên tên approve nhưng request phải hỗ trợ action=approve/reject

### UC-19: Gán tác giả cho bài báo
- Tác nhân: Lecturer, Student, Admin
- Mô tả: Thêm đồng tác giả cho bài báo
- Luật:
  - admin hoặc tác giả đầu tiên (author_order=1) được thêm
  - không cho thêm trùng user

---

## NHÓM 5: QUẢN LÝ DANH MỤC

### UC-20: Quản lý loại đề tài
- Tác nhân: Admin
- Mô tả: CRUD project types

### UC-21: Quản lý loại bài báo
- Tác nhân: Admin
- Mô tả: CRUD paper types

---

## NHÓM 6: THÔNG BÁO VÀ THỐNG KÊ

### UC-22: Gửi thông báo
- Tác nhân: Admin
- Mô tả: Tạo thông báo mới

### UC-23: Xem thông báo
- Tác nhân: Tất cả
- Mô tả: Xem danh sách thông báo phù hợp với role

### UC-24: Thống kê tổng hợp
- Tác nhân: Admin
- Mô tả: Xem dashboard tổng hợp số liệu

### UC-25: Top giảng viên
- Tác nhân: Tất cả
- Mô tả: Xem top giảng viên có nhiều bài báo nhất
- Luật:
  - chỉ tính paper đã approved

---

## NHÓM 7: KẾ HOẠCH NĂM HỌC

Các use case trong nhóm 7-9 thuộc Planned Expansion.

### UC-26: Tạo kế hoạch hoạt động khoa học năm học
- Tác nhân: Admin
- Mô tả: Tạo kế hoạch cho năm học dạng `20xx-20xx+1`
- Input:
  - academic_year
  - name
  - description
  - start_date
  - end_date

### UC-27: Quản lý hạng mục kế hoạch
- Tác nhân: Admin
- Mô tả: Tạo/sửa/xóa các hạng mục chỉ tiêu trong kế hoạch
- Input:
  - plan_id
  - item_type (project_target/paper_target/activity)
  - level_id
  - target_value
  - due_date

### UC-28: Liên kết đề tài hoặc bài báo với hạng mục kế hoạch
- Tác nhân: Lecturer, Student, Admin
- Mô tả: Khi tạo/sửa hồ sơ, chọn hạng mục kế hoạch tương ứng
- Luật:
  - chỉ liên kết tới kế hoạch đang active
  - chỉ liên kết item cùng loại dữ liệu (project/paper)

---

## NHÓM 8: PHÂN CẤP VÀ MẪU BIỂU

### UC-29: Quản lý phân cấp đề tài
- Tác nhân: Admin
- Mô tả: Quản lý danh mục cấp đề tài (khoa, trường, bộ, nhà nước...)

### UC-30: Quản lý phân cấp bài báo
- Tác nhân: Admin
- Mô tả: Quản lý danh mục cấp bài báo (hội nghị trong nước/quốc tế, tạp chí...)

### UC-31: Quản lý mẫu biểu và phiên bản mẫu
- Tác nhân: Admin
- Mô tả: Tạo template cho project/paper, định nghĩa field và version
- Luật:
  - template có trạng thái active/inactive
  - mỗi entity có thể có nhiều version

### UC-32: Nộp hồ sơ theo mẫu biểu động
- Tác nhân: Lecturer, Student
- Mô tả: Người dùng nộp hồ sơ theo template đang chọn
- Luật:
  - payload phải qua validate theo field definition
  - cho phép lưu field mở rộng để map từ biểu mẫu thực tế

---

## NHÓM 9: TRIỂN KHAI ĐỀ TÀI SAU KHI ĐƯỢC DUYỆT

### UC-33: Phân chia công việc trong đề tài đã duyệt
- Tác nhân: Lecturer (leader)
- Mô tả: Leader tạo task, gán người thực hiện, đặt thời hạn
- Luật:
  - chỉ áp dụng cho project status = approved

### UC-34: Nộp và duyệt hoàn thành công việc
- Tác nhân: Member, Lecturer (leader)
- Mô tả:
  - thành viên nộp kết quả task
  - leader duyệt hoặc yêu cầu làm lại
- Luật:
  - chỉ khi leader duyệt thì task mới được tính hoàn thành

### UC-35: Nộp báo cáo định kỳ theo mốc thời hạn
- Tác nhân: Member, Lecturer (leader)
- Mô tả: Nộp báo cáo định kỳ theo mốc do leader tạo
- Luật:
  - báo cáo có deadline
  - quá deadline thì đánh dấu trễ hạn

### UC-36: Theo dõi tiến độ và cảnh báo quá hạn đề tài
- Tác nhân: Admin, Lecturer, Member
- Mô tả:
  - hệ thống tính progress theo tỷ lệ task đã duyệt
  - cảnh báo đề tài quá hạn hoặc có mốc báo cáo bị trễ
- Luật:
  - progress chỉ tăng khi task được leader duyệt hoàn thành