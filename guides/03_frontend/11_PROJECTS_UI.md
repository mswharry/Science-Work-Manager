# 11_PROJECTS_UI.md

Dựa trên API contract của dự án, hãy tạo giao diện quản lý đề tài gồm:

- ProjectList
- ProjectDetail
- ProjectForm
- ProjectsPage

Yêu cầu:
1. Hỗ trợ:
   - xem danh sách đề tài
   - xem chi tiết đề tài
   - tạo đề tài mới
   - sửa đề tài của mình khi hợp lệ
   - xóa đề tài của mình khi hợp lệ
2. Route đề xuất:
   - /projects
   - /projects/new
   - /projects/:id
   - /projects/:id/edit
3. Kết nối với projectService.js
4. Hiển thị các trường:
   - name
   - category
   - budget
   - start_date
   - end_date
   - status
   - description
5. UI đơn giản bằng JSX/CSS cơ bản.
6. Chỉ hiện nút Edit/Delete khi user có quyền phù hợp.
7. Output theo từng file.