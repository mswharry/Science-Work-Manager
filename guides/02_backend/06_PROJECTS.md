# 06_PROJECTS.md

Dựa trên spec, hãy viết đầy đủ:

- app/services/project_service.py
- app/api/v1/endpoints/projects.py

Phải hỗ trợ các endpoint:
- POST /projects
- GET /projects
- GET /projects/{project_id}
- PUT /projects/{project_id}
- DELETE /projects/{project_id}
- PUT /admin/projects/{project_id}/review
- PUT /admin/projects/{project_id}/complete

Rule bắt buộc:
1. Khi tạo project:
   - leader là current user
   - status mặc định = pending
2. GET /projects:
   - admin xem tất cả
   - user thường xem project approved/completed và project của chính mình
   - hỗ trợ filter: status, year, keyword, mine
3. GET /projects/{project_id} phải kiểm tra quyền nhìn thấy dữ liệu.
4. Chỉ leader được sửa/xóa project.
5. Chỉ sửa/xóa khi status là pending hoặc rejected.
6. Nếu project rejected được sửa, phải chuyển lại về pending.
7. Endpoint review nhận request:
   - action = approve hoặc reject
   - note
8. Chỉ admin mới review project.
9. Chỉ project đã approved mới được complete.
10. completed không được sửa hoặc xóa.
11. Dùng service layer cho toàn bộ nghiệp vụ.
12. Code dễ đọc, phù hợp BTL.

Output theo từng file.