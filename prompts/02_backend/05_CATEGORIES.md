# 05_CATEGORIES.md

Dựa trên spec, hãy viết đầy đủ:

- app/services/category_service.py
- app/api/v1/endpoints/categories.py

Phải hỗ trợ CRUD cho 2 nhóm category:
1. project types
2. paper types

Endpoint yêu cầu:
- GET /admin/categories/project-types
- POST /admin/categories/project-types
- PUT /admin/categories/project-types/{id}
- DELETE /admin/categories/project-types/{id}

- GET /admin/categories/paper-types
- POST /admin/categories/paper-types
- PUT /admin/categories/paper-types/{id}
- DELETE /admin/categories/paper-types/{id}

Rule bắt buộc:
1. Chỉ admin được truy cập.
2. project type tương ứng type = project_type.
3. paper type tương ứng type = paper_type.
4. Không cho trùng (type, name).
5. points dùng cho paper_type, nhưng schema vẫn có thể giữ chung cho cả 2 loại nếu muốn đơn giản.
6. Code rõ ràng, tách business logic vào service.

Output theo từng file.