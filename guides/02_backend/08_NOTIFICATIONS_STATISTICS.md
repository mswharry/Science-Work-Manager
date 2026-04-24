# 08_NOTIFICATIONS_STATISTICS.md

Dựa trên spec, hãy viết đầy đủ:

- app/services/notification_service.py
- app/services/statistics_service.py
- app/api/v1/endpoints/notifications.py
- app/api/v1/endpoints/statistics.py

Phải hỗ trợ các endpoint:
- POST /admin/notifications
- GET /notifications
- GET /admin/statistics/dashboard
- GET /statistics/top-lecturers

Rule bắt buộc:
1. Chỉ admin được tạo notification.
2. Notification gồm:
   - title
   - content
   - target_role
   - created_by
   - is_active
3. GET /notifications:
   - chỉ trả notification is_active = true
   - lọc theo target_role:
     - all
     - lecturer
     - student
4. Dashboard admin phải trả ít nhất:
   - total_users
   - total_projects
   - total_papers
   - project_counts_by_status
   - paper_counts_by_status
   - yearly project counts
   - yearly paper counts
5. Top lecturers:
   - chỉ tính user role = lecturer
   - chỉ tính papers đã approved
   - trả top 5 theo số lượng paper
6. Dùng query ORM đơn giản, dễ hiểu.
7. Output theo từng file.