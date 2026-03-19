# 13_ADMIN_UI.md

Dựa trên API contract của dự án, hãy tạo giao diện admin gồm:

- UserList
- ProjectReview
- PaperReview
- NotificationForm
- NotificationList
- AdminPage

Yêu cầu:
1. UserList:
   - xem danh sách user
   - filter role/is_active/is_approved
   - duyệt user
   - khóa/mở user
2. ProjectReview:
   - xem danh sách project pending
   - approve/reject
3. PaperReview:
   - xem danh sách paper pending
   - approve/reject
4. NotificationForm:
   - tạo notification mới
5. NotificationList:
   - xem danh sách thông báo
6. Chỉ cho admin truy cập qua ProtectedRoute.
7. UI đủ dùng, không cần đẹp.
8. Output theo từng file.