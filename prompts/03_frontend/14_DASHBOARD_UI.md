# 14_DASHBOARD_UI.md

Dựa trên API contract của dự án, hãy tạo giao diện dashboard và thống kê gồm:

- DashboardPage
- TopLecturers component
- charts đơn giản nếu cần

Yêu cầu:
1. Gọi API:
   - GET /admin/statistics/dashboard
   - GET /statistics/top-lecturers
2. Hiển thị:
   - tổng users
   - tổng projects
   - tổng papers
   - project counts theo status
   - paper counts theo status
   - top lecturers
3. Có thể dùng thư viện biểu đồ nhẹ hoặc chỉ hiển thị danh sách/bảng nếu muốn đơn giản.
4. Ưu tiên code dễ chạy và dễ đọc.
5. Output theo từng file.